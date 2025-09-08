package com.doki.reserveservice.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @author Queue-ri
 */

@Getter
@AllArgsConstructor
public class CustomException extends RuntimeException {
    ErrorCode errorCode;
}
