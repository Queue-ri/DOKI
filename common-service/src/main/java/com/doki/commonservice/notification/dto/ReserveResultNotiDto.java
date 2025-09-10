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
public class ReserveResultNotiDto {
    /*
        예약 이용자가 받는 예약 처리 결과 알림
    */
    private Long notificationId;

    private Long storeId;

    private String storeName;

    private String messageCode;

    private String message;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}
