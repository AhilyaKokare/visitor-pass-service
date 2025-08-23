package com.gt.visitor_pass_service.service;

import com.gt.visitor_pass_service.dto.EmailAuditLogResponse;
import com.gt.visitor_pass_service.dto.TenantDashboardResponse;
import com.gt.visitor_pass_service.dto.TenantDashboardStats;
import com.gt.visitor_pass_service.dto.VisitorPassResponse;
import com.gt.visitor_pass_service.model.AuditLog;
import com.gt.visitor_pass_service.model.enums.PassStatus; // <-- IMPORT THE ENUM
import com.gt.visitor_pass_service.repository.AuditLogRepository;
import com.gt.visitor_pass_service.repository.VisitorPassRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.gt.visitor_pass_service.dto.UserDashboardStatsDTO; // Add this import
import com.gt.visitor_pass_service.model.User; // Add this import
import com.gt.visitor_pass_service.repository.UserRepository;
import com.gt.visitor_pass_service.exception.ResourceNotFoundException;


import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final VisitorPassRepository passRepository;
    private final AuditLogRepository auditLogRepository;
    private final VisitorPassService visitorPassService; // For the mapper
    private final WebClient webClient;
    private final UserRepository userRepository;

    public DashboardService(VisitorPassRepository passRepository,
                            AuditLogRepository auditLogRepository,
                            VisitorPassService visitorPassService,
                            @Value("${services.notification.base-url}") String notificationServiceUrl, UserRepository userRepository) {
        this.passRepository = passRepository;
        this.auditLogRepository = auditLogRepository;
        this.visitorPassService = visitorPassService;
        this.webClient = WebClient.create(notificationServiceUrl);
        this.userRepository = userRepository;
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
        // VVV THESE ARE THE FIXES VVV
        long pending = passRepository.countByTenantIdAndStatus(tenantId, PassStatus.PENDING);
        long checkedIn = passRepository.countByTenantIdAndStatus(tenantId, PassStatus.CHECKED_IN);

        long approvedToday = passRepository.countApprovedForToday(tenantId);
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
        if (recentPasses == null || recentPasses.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> passIds = recentPasses.stream().map(VisitorPassResponse::getId).collect(Collectors.toList());

        // Make an API call to the notification-service
        try {
            return webClient.post()
                    .uri("/api/internal/email-logs/by-pass-ids")
                    .bodyValue(passIds)
                    .retrieve()
                    .bodyToFlux(EmailAuditLogResponse.class)
                    .collectList()
                    .block(); // Using block for simplicity; reactive is better for high load
        } catch (Exception e) {
            // Log the error and return an empty list to prevent dashboard from failing
            // In a real app, you would have more robust error handling here
            System.err.println("Error fetching email activity from notification-service: " + e.getMessage());
            return Collections.emptyList();
        }
    }
    public UserDashboardStatsDTO getUserDashboardStats(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        long myPending = passRepository.countByCreatedByIdAndStatus(user.getId(), "PENDING");
        long myApproved = passRepository.countByCreatedByIdAndStatus(user.getId(), "APPROVED");
        long myCompleted = passRepository.countByCreatedByIdAndStatus(user.getId(), "CHECKED_OUT");

        long awaitingMyApproval = 0;
        if ("ROLE_APPROVER".equals(user.getRole()) || "ROLE_TENANT_ADMIN".equals(user.getRole())) {
            // This counts pending passes for the user's entire tenant
            awaitingMyApproval = passRepository.countByTenantIdAndStatus(user.getTenant().getId(), "PENDING");
        }

        return UserDashboardStatsDTO.builder()
                .myPendingPasses(myPending)
                .myApprovedPasses(myApproved)
                .myCompletedPasses(myCompleted)
                .passesAwaitingMyApproval(awaitingMyApproval)
                .build();
    }
}
