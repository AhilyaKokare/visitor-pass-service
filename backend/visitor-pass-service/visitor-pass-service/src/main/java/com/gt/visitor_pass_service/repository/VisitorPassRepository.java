package com.gt.visitor_pass_service.repository;

import com.gt.visitor_pass_service.model.VisitorPass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;

import java.util.Optional;

public interface VisitorPassRepository extends JpaRepository<VisitorPass, Long> {

    Page<VisitorPass> findByTenantId(Long tenantId, Pageable pageable);

    Page<VisitorPass> findByCreatedById(Long userId, Pageable pageable);

    Optional<VisitorPass> findByTenantIdAndPassCode(Long tenantId, String passCode);

    @Query("SELECT vp FROM VisitorPass vp WHERE vp.status = 'APPROVED' AND DATE(vp.visitDateTime) < CURRENT_DATE")
    List<VisitorPass> findOverdueApprovedPasses();
    // FOR SECURITY DASHBOARD
    @Query("SELECT vp FROM VisitorPass vp WHERE vp.tenant.id = :tenantId AND DATE(vp.visitDateTime) = :date AND (vp.status = 'APPROVED' OR vp.status = 'CHECKED_IN')")
    List<VisitorPass> findTodaysVisitorsByTenant(Long tenantId, LocalDate date);

    long countByTenantIdAndStatus(Long tenantId, String status);

    @Query("SELECT COUNT(vp) FROM VisitorPass vp WHERE vp.tenant.id = :tenantId AND DATE(vp.visitDateTime) = CURRENT_DATE AND vp.status = 'APPROVED'")
    long countApprovedForToday(Long tenantId);

    @Query("SELECT COUNT(vp) FROM VisitorPass vp WHERE vp.tenant.id = :tenantId AND DATE(vp.visitDateTime) = CURRENT_DATE AND (vp.status = 'CHECKED_OUT' OR vp.status = 'EXPIRED')")
    long countCompletedForToday(Long tenantId);

    List<VisitorPass> findTop10ByTenantIdOrderByCreatedAtDesc(Long tenantId);

    @Query("SELECT COUNT(vp) FROM VisitorPass vp WHERE DATE(vp.visitDateTime) = CURRENT_DATE AND (vp.status = 'APPROVED' OR vp.status = 'CHECKED_IN')")
    long countActivePassesForToday();

    long countByTenantId(Long tenantId);

    @Query("SELECT COUNT(vp) FROM VisitorPass vp WHERE vp.tenant.id = :tenantId AND DATE(vp.visitDateTime) = CURRENT_DATE")
    long countPassesForTenantToday(Long tenantId);

    List<VisitorPass> findTop10ByOrderByCreatedAtDesc();
}