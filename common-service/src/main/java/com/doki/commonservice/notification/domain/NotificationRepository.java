package com.doki.commonservice.notification.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * @author Queue-ri
 */

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @Query("SELECT n FROM Notification n " +
            "WHERE n.member.memberCode = :memberCode " +
            "AND n.status <> NotificationStatus.DELETED " +
            "ORDER BY n.notificationId DESC")
    List<Notification> findAllActiveByMemberCode(@Param("memberCode") Long memberCode);

    List<Notification> findAllByMember_MemberCodeAndNotificationIdGreaterThan(Long memberCode, Long lastEventId);

    @Query("SELECT MAX(n.notificationId) " +
            "FROM Notification n " +
            "WHERE n.member.memberCode = :memberCode")
    Optional<Long> findLastNotificationIdByMemberCode(@Param("memberCode") Long memberCode);

    Optional<Notification> findByNotificationIdAndMember_MemberCode(Long notificationId, Long memberCode);
}
