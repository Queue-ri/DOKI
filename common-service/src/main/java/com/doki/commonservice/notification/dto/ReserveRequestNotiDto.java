package com.doki.commonservice.notification.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * @author Queue-ri
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReserveRequestNotiDto {
    /*
        팝업스토어 운영자가 받는 예약 요청 알림
    */
    private Long notificationId;

    private Long reservationId;

    private LocalDateTime reservedDateTime;

    private String messageCode;

    private String message;

    private String status;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}
