package com.doki.commonservice.backdoor.controller;

import com.doki.commonservice.backdoor.service.PerfTestReserveService;
import com.doki.commonservice.reserve.dto.ReserveRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @author Queue-ri
 */

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/backdoor/test/reserve")
@Profile("test")
public class PerfTestReserveRestController {

    private final PerfTestReserveService testService;

    @PostMapping("/v1")
    public ResponseEntity reserveTestV1(@RequestBody ReserveRequestDto dto) {
        return testService.createPendingReservation(dto);
    }

    @PostMapping("/v2")
    public ResponseEntity reserveTestV2(@RequestBody ReserveRequestDto dto) {
        return testService.sendMessage(dto);
    }
}
