package com.doki.commonservice.notification.service;

import com.doki.commonservice.exception.CustomException;
import com.doki.commonservice.exception.ErrorCode;
import com.doki.commonservice.member.model.Member;
import com.doki.commonservice.member.model.MemberRepository;
import com.doki.commonservice.notification.controller.NotificationController;
import com.doki.commonservice.notification.domain.Notification;
import com.doki.commonservice.notification.domain.NotificationRepository;
import com.doki.commonservice.notification.domain.NotificationType;
import com.doki.commonservice.notification.dto.ReserveRequestNotiDto;
import com.doki.commonservice.notification.dto.ReserveResultNotiDto;
import com.doki.commonservice.reserve.model.Reservation;
import com.doki.commonservice.reserve.model.ReservationRepository;
import com.doki.commonservice.store.model.Store;
import com.doki.commonservice.store.model.StoreRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

/**
 * @author Queue-ri
 */

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    private final ReservationRepository rRepo;
    private final NotificationRepository nRepo;
    private final StoreRepository sRepo;
    private final MemberRepository mRepo;

    private final ObjectMapper objectMapper; // LocalDateTime 호환을 위해 직접 인스턴스화해서 사용하지 말 것


    /* 로그인 유저 대상 SSE 연결 */
    public SseEmitter subscribe(Long memberCode, Long lastEventId) {
        // 0. 요청자에게 할당된 key 없으면 초기화
        List<SseEmitter> emitters = NotificationController.sseEmitters.getOrDefault(memberCode, new ArrayList<>());

        // 1. 현재 클라이언트를 위한 sseEmitter 객체 생성
        SseEmitter sseEmitter = new SseEmitter(Long.MAX_VALUE);

        // 2. 연결
        try {
            sseEmitter.send(SseEmitter.event().name("connect").data("connected"));
        } catch (IOException e) {
            e.printStackTrace();
        }

        // 2-1. lastEventId 이후부터 fallback 처리
        if (lastEventId != null) {
            List<Notification> unsentNotiList = nRepo.findAllByMember_MemberCodeAndNotificationIdGreaterThan(memberCode, lastEventId);
            for (Notification noti : unsentNotiList) {
                log.warn("SSE fallback");
                try {
                    sseEmitter.send(SseEmitter.event()
                            .id(String.valueOf(noti.getNotificationId()))
                            .name(noti.getNotiType().name())
                            .data(noti.getData()));
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

        // 3. 리스트에 저장
        emitters.add(sseEmitter);
        NotificationController.sseEmitters.put(memberCode, emitters);

        // 4. 연결 종료 처리
        sseEmitter.onCompletion(() -> emitters.remove(sseEmitter));
        sseEmitter.onTimeout(() -> emitters.remove(sseEmitter));
        sseEmitter.onError((e) -> emitters.remove(sseEmitter));

        return sseEmitter;
    }


    /* 특정 member의 전체 알림 조회 - 서비스 정책 상 조회된다는 것 == 아직 읽지 않음 */
    public List<Notification> getAll(Long memberCode) {
        return nRepo.findAllByMember_MemberCode(memberCode);
    }


    /* [INTERNAL] 예약 결과 알림 - 운영자 to 이용자 */
    // rid -> 이용자가 예약 요청하여 승인 대기중이거나
    //     -> 운영자가 승인/거절/취소한 예약의 id
    // 팝업스토어 id가 아닌 예약 id를 받는 것이 맞음
    @Transactional
    public void notifyReserveResultToMember(Long rid, String resultStatus) {
        // 추후에 에러핸들링 필요
        Reservation reservation = rRepo.findById(rid).get();
        Long memberCode = reservation.getMember().getMemberCode(); // 해당 예약의 이용자

        if (NotificationController.sseEmitters.containsKey(memberCode)) {
            try {
                String resultStr = ""; // 예약 결과 알림 메시지 내용
                if (resultStatus.equals("RESERVE_PENDING")) resultStr = "예약이 신청되었습니다.";
                else if (resultStatus.equals("CONFIRMED")) {
                    // RESERVE_PENDING -> CONFIRMED 는 예약 신청 승인(=예약 확정)이지만,
                    // CANCEL_PENDING -> CONFIRMED 는 예약 취소 요청에 대한 거절임.
                    resultStr = "예약이 확정되었습니다.";
                }
                else if (resultStatus.equals("REFUSED")) resultStr = "예약이 거절되었습니다.";
                else if (resultStatus.equals("CANCELED")) resultStr = "예약이 취소되었습니다.";
                else resultStr = "ERROR: 관리자에게 문의 바랍니다.";

                // DB에 Notification 저장
                Optional<Member> memberOpt = mRepo.findByMemberCode(memberCode);
                if (memberOpt.isEmpty()) {
                    log.error("요청 id의 회원 조회 결과 없음.");
                    throw new CustomException(ErrorCode.USER_NOT_FOUND);
                }

                LocalDateTime now = LocalDateTime.now();
                Notification notification = nRepo.save(
                        Notification.builder()
                                .member(memberOpt.get())
                                .notiType(NotificationType.RESERVE_RESULT)
                                .data("")
                                .createdAt(LocalDateTime.now())
                                .build()
                );

                // SSE data DTO 생성
                ReserveResultNotiDto dto = ReserveResultNotiDto.builder()
                        .notificationId(notification.getNotificationId())
                        .storeId(reservation.getStore().getStoreId())
                        .storeName(reservation.getStore().getStoreName())
                        .messageCode(resultStatus)
                        .message(resultStr)
                        .createdAt(now)
                        .build();

                // data 직렬화 및 Notification data 업데이트
                String json = objectMapper.writeValueAsString(dto);
                notification.setData(json);
                nRepo.save(notification);
                nRepo.flush();

                // SSE 전송
                sendSSE(memberCode, notification.getNotificationId(), "RESERVE_RESULT", json);
                log.info("memberCode: {} | SSE RESERVE_RESULT sent: {}", memberCode, dto);

            } catch (Exception e) {
                log.error("SSE 알림 전송 실패: [{}]", e.getClass().getSimpleName());
                log.error("SSE 알림 전송 실패: {}", e.getMessage());
                NotificationController.sseEmitters.remove(memberCode);
                throw new CustomException(ErrorCode.SOMETHING_WENT_WRONG);
            }
        }
    }


    /* [INTERNAL] 예약 실패 알림 - '나의 예약'에 조회되지 않고, 알림만 감 */
    // 왜냐하면, 실패한 예약 트랜잭션은 reservation 테이블에 등록되지 않기 때문
    @Transactional
    public void notifyFailureToMember(Long memberCode, Long sid) { // sid: 알림을 받을 이용자가 예약에 실패한 팝업스토어 id
        // 추후에 에러핸들링 필요
        Store store = sRepo.findById(sid).get();

        if (NotificationController.sseEmitters.containsKey(memberCode)) {
            try {
                // DB에 Notification 저장
                Optional<Member> memberOpt = mRepo.findByMemberCode(memberCode);
                if (memberOpt.isEmpty()) {
                    log.error("요청 id의 회원 조회 결과 없음.");
                    throw new CustomException(ErrorCode.USER_NOT_FOUND);
                }

                LocalDateTime now = LocalDateTime.now();
                Notification notification = nRepo.save(
                        Notification.builder()
                                .member(memberOpt.get())
                                .notiType(NotificationType.RESERVE_RESULT)
                                .data("")
                                .createdAt(now)
                                .build()
                );

                // SSE data DTO 생성
                String storeName = store.getStoreName(); // 이용자가 예약 관련 요청을 보낸 팝업스토어명
                ReserveResultNotiDto dto = ReserveResultNotiDto.builder()
                        .notificationId(notification.getNotificationId())
                        .storeId(sid)
                        .storeName(storeName)
                        .messageCode("FAILED")
                        .message("예약 정원이 마감되었습니다.")
                        .createdAt(now)
                        .build();

                // data 직렬화 및 Notification data 업데이트
                String json = objectMapper.writeValueAsString(dto);
                notification.setData(json);
                nRepo.save(notification);
                nRepo.flush();

                // SSE 전송
                sendSSE(memberCode, notification.getNotificationId(), "RESERVE_RESULT", json);
                log.info("memberCode: {} | SSE RESERVE_RESULT sent: {}", memberCode, dto);

            } catch (Exception e) {
                log.error("SSE 알림 전송 실패: [{}]", e.getClass().getSimpleName());
                log.error("SSE 알림 전송 실패: {}", e.getMessage());
                NotificationController.sseEmitters.remove(memberCode);
                throw new CustomException(ErrorCode.SOMETHING_WENT_WRONG);
            }
        }
    }


    /* [INTERNAL] 예약 요청 알림 - 이용자 to 운영자 */
    @Transactional
    public void notifyReserveRequestToManager(Long memberCode, Reservation reservation, String requestType) {
        if (NotificationController.sseEmitters.containsKey(memberCode)) {
            try {
                String requestTypeStr = "";
                if (requestType.equals("CONFIRM_REQUEST")) requestTypeStr = "새로운 예약 신청이 있습니다.";
                else if (requestType.equals("CANCEL_REQUEST")) requestTypeStr = "새로운 예약 취소 요청이 있습니다.";
                else if (requestType.equals("AUTO_CONFIRMED")) requestTypeStr = "예약이 자동 승인되었습니다."; // V2는 자동 예약 확정
                else requestTypeStr = "ERROR: 관리자에게 문의 바랍니다.";

                // DB에 Notification 저장
                Optional<Member> memberOpt = mRepo.findByMemberCode(memberCode);
                if (memberOpt.isEmpty()) {
                    log.error("요청 id의 회원 조회 결과 없음.");
                    throw new CustomException(ErrorCode.USER_NOT_FOUND);
                }

                LocalDateTime now = LocalDateTime.now();
                Notification notification = nRepo.save(
                        Notification.builder()
                                .member(memberOpt.get())
                                .notiType(NotificationType.RESERVE_REQUEST)
                                .data("")
                                .createdAt(now)
                                .build()
                );

                // SSE data DTO 생성
                String storeName = reservation.getStore().getStoreName(); // 이용자가 예약 관련 요청을 보낸 팝업스토어명
                ReserveRequestNotiDto dto = ReserveRequestNotiDto.builder()
                        .notificationId(notification.getNotificationId())
                        .reservationId(reservation.getReservationId())
                        .reservedDateTime(reservation.getReservedDateTime())
                        .messageCode(requestType)
                        .message(requestTypeStr)
                        .createdAt(now)
                        .build();

                // data 직렬화 및 Notification data 업데이트
                String json = objectMapper.writeValueAsString(dto);
                notification.setData(json);
                nRepo.save(notification);
                nRepo.flush();

                // SSE 전송
                sendSSE(memberCode, notification.getNotificationId(), "RESERVE_REQUEST", json);
                log.info("memberCode: {} | SSE RESERVE_REQUEST sent: {}", memberCode, dto);

            } catch (Exception e) {
                log.error("SSE 알림 전송 실패: [{}]", e.getClass().getSimpleName());
                log.error("SSE 알림 전송 실패: {}", e.getMessage());
                NotificationController.sseEmitters.remove(memberCode);
                throw new CustomException(ErrorCode.SOMETHING_WENT_WRONG);
            }
        }
    }


    /* memberCode에 대한 모든 SSE Emitter에 전송 (다중 탭 지원) */
    private void sendSSE(Long memberCode, Long notificationId, String eventName, String data) {
        List<SseEmitter> emitters = NotificationController.sseEmitters.get(memberCode);
        if (emitters != null) {
            Iterator<SseEmitter> iterator = emitters.iterator();
            while (iterator.hasNext()) {
                SseEmitter emitter = iterator.next();
                try {
                    emitter.send(SseEmitter.event()
                            .id(String.valueOf(notificationId))
                            .name(eventName)
                            .data(data)
                    );
                } catch (IOException e) {
                    emitter.complete(); // 끊긴 emitter는 닫고
                    iterator.remove(); // 리스트에서 제거
                }
            }
        }
    }


    /* 특정 알림 삭제 - 서비스 정책 상 member가 읽었으면 해당 알림은 삭제 */
    @Transactional
    public ResponseEntity<?> deleteNotification(Long nid, Long memberCode) {
        log.info("memberCode: {}", memberCode);
        nRepo.deleteByNotificationIdAndMember_MemberCode(nid, memberCode);

        return ResponseEntity.ok().build();
    }


    /* 요청 member의 전체 알림 삭제 */
    @Transactional
    public ResponseEntity<?> deleteAllNotifications(Long memberCode) {
        log.info("memberCode: {}", memberCode);
        nRepo.deleteAllByMember_MemberCode(memberCode);

        return ResponseEntity.ok().build();
    }
}
