package com.doki.commonservice.reserve.model;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * @author Queue-ri
 */

public interface ReservationLogRepository extends JpaRepository<ReservationLog, Long> {
    List<ReservationLog> findAllByReservation_ReservationId(Long reservationId);
}
