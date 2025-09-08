package com.doki.commonservice.reserve.controller;

import com.doki.commonservice.reserve.dto.ReserveRequestDto;
import com.doki.commonservice.reserve.service.ReserveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Queue-ri
 */

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/reserve")
public class ReserveRestControllerV1 {
    private final ReserveService reserveService;

    @PostMapping
    public ResponseEntity<?> produceMessage(@RequestBody ReserveRequestDto dto) {
        return reserveService.createPendingReservation(dto);
    }
}
