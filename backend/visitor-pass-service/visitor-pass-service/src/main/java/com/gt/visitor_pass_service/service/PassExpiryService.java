package com.gt.visitor_pass_service.service;

import com.gt.visitor_pass_service.config.RabbitMQConfig;
import com.gt.visitor_pass_service.dto.PassExpiredEvent;
import com.gt.visitor_pass_service.model.User;
import com.gt.visitor_pass_service.model.VisitorPass;
import com.gt.visitor_pass_service.repository.UserRepository;
import com.gt.visitor_pass_service.repository.VisitorPassRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PassExpiryService {

    private static final Logger logger = LoggerFactory.getLogger(PassExpiryService.class);

    private final VisitorPassRepository passRepository;
    private final AuditService auditService;
    private final RabbitTemplate rabbitTemplate;
    private final UserRepository userRepository;

    public PassExpiryService(VisitorPassRepository passRepository, AuditService auditService, RabbitTemplate rabbitTemplate, UserRepository userRepository) {
        this.passRepository = passRepository;
        this.auditService = auditService;
        this.rabbitTemplate = rabbitTemplate;
        this.userRepository = userRepository;
    }

    /**
     * A scheduled task that runs automatically every day at 1 AM.
     * It finds all visitor passes with an 'APPROVED' status for dates before today and expires them.
     */
    @Scheduled(cron = "0 0 1 * * ?") // Runs every day at 1:00 AM
    @Transactional
    public void expireOldPasses() {
        logger.info("Running scheduled job: Expiring old visitor passes...");
        List<VisitorPass> passesToExpire = passRepository.findOverdueApprovedPasses();

        if (passesToExpire.isEmpty()) {
            logger.info("No overdue passes to expire.");
            return;
        }

        for (VisitorPass pass : passesToExpire) {
            pass.setStatus("EXPIRED");
            pass.setUpdatedAt(LocalDateTime.now());
            passRepository.save(pass);

            // Log the system event (no specific user performed this action)
            auditService.logEvent("PASS_EXPIRED_SYSTEM", null, pass.getTenant().getId(), pass.getId());

            // Find the Tenant Admin to notify
            String tenantAdminEmail = findTenantAdminEmail(pass.getTenant().getId());

            // Create and send the notification event
            PassExpiredEvent event = new PassExpiredEvent(
                    pass.getId(),
                    pass.getVisitorName(),
                    pass.getVisitDateTime(),
                    pass.getCreatedBy().getEmail(),
                    tenantAdminEmail,
                    pass.getTenant().getId()
            );

            // For expired events, you might want a different routing key or use the same one
            // We'll create a new one for clarity in RabbitMQConfig
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY_EXPIRED, event);
        }

        logger.info("Successfully expired {} passes.", passesToExpire.size());
    }

    /**
     * Helper method to find the email of a Tenant Admin for a given tenant.
     * @param tenantId The ID of the tenant.
     * @return The email of the Tenant Admin, or null if not found.
     */
    private String findTenantAdminEmail(Long tenantId) {
        // This is a simple implementation. A more optimized approach would be a custom query.
        Optional<User> tenantAdmin = userRepository.findAll().stream()
                .filter(user -> "ROLE_TENANT_ADMIN".equals(user.getRole()) &&
                        user.getTenant() != null &&
                        user.getTenant().getId().equals(tenantId))
                .findFirst();
        return tenantAdmin.map(User::getEmail).orElse(null);
    }
}