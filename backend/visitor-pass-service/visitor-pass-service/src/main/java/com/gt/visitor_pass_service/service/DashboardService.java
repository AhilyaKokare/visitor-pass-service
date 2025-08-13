package com.gt.visitor_pass_service.service;

import com.gt.visitor_pass_service.dto.EmailAuditLogResponse;
import com.gt.visitor_pass_service.dto.TenantDashboardResponse;
import com.gt.visitor_pass_service.dto.TenantDashboardStats;
import com.gt.visitor_pass_service.dto.VisitorPassResponse;
import com.gt.visitor_pass_service.model.AuditLog;
import com.gt.visitor_pass_service.model.VisitorPass;
import com.gt.visitor_pass_service.repository.AuditLogRepository;
import com.gt.visitor_pass_service.repository.VisitorPassRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final VisitorPassRepository passRepository;
    private final AuditLogRepository auditLogRepository;
    private final VisitorPassService visitorPassService; // For the mapper
    private final WebClient webClient;

    public DashboardService(VisitorPassRepository passRepository,
                            AuditLogRepository auditLogRepository,
                            VisitorPassService visitorPassService,
                            @Value("${services.notification.base-url}") String notificationServiceUrl) {
        this.passRepository = passRepository;
        this.auditLogRepository = auditLogRepository;
        this.visitorPassService = visitorPassService;
        this.webClient = WebClient.create(notificationServiceUrl);
    }

    public TenantDashboardResponse getTenantDashboardData(Long tenantId) {
        TenantDashboardStats stats = getStats(tenantId);
        List<VisitorPassResponse> recentPasses = getRecentPasses(tenantId);
        List<AuditLog> recentPassActivity = getRecentPassActivity(tenantId);
        List<EmailAuditLogResponse> recentEmailActivity = getRecentEmailActivity(recentPasses);

        return TenantDashboardResponse.builder()
                .stats(stats)
                .recentPasses(recentPasses)
                .recentPassActivity(recentPassActivity)
                .recentEmailActivity(recentEmailActivity)
                .build();
    }

    private TenantDashboardStats getStats(Long tenantId) {
        long pending = passRepository.countByTenantIdAndStatus(tenantId, "PENDING");
        long approvedToday = passRepository.countApprovedForToday(tenantId);
        long checkedIn = passRepository.countByTenantIdAndStatus(tenantId, "CHECKED_IN");
        long completedToday = passRepository.countCompletedForToday(tenantId);

        return TenantDashboardStats.builder()
                .pendingPasses(pending)
                .approvedPassesToday(approvedToday)
                .checkedInVisitors(checkedIn)
                .completedPassesToday(completedToday)
                .build();
    }

    private List<VisitorPassResponse> getRecentPasses(Long tenantId) {
        return passRepository.findTop10ByTenantIdOrderByCreatedAtDesc(tenantId)
                .stream()
                .map(visitorPassService::mapToResponse) // Reuse the mapper from VisitorPassService
                .collect(Collectors.toList());
    }

    private List<AuditLog> getRecentPassActivity(Long tenantId) {
        return auditLogRepository.findTop10ByTenantIdAndPassIdIsNotNullOrderByTimestampDesc(tenantId);
    }

    private List<EmailAuditLogResponse> getRecentEmailActivity(List<VisitorPassResponse> recentPasses) {
        if (recentPasses.isEmpty()) {
            return List.of();
        }

        List<Long> passIds = recentPasses.stream().map(VisitorPassResponse::getId).collect(Collectors.toList());

        // Make an API call to the notification-service
        return webClient.post()
                .uri("/api/internal/email-logs/by-pass-ids")
                .bodyValue(passIds)
                .retrieve()
                .bodyToFlux(EmailAuditLogResponse.class)
                .collectList()
                .block(); // Using block for simplicity; reactive is better for high load
    }
}