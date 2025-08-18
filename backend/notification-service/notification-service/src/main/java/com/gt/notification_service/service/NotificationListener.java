package com.gt.notification_service.service;

import com.gt.notification_service.dto.PassApprovedEvent;
import com.gt.notification_service.dto.PassExpiredEvent;
import com.gt.notification_service.dto.PassRejectedEvent;
import com.gt.notification_service.model.EmailAuditLog;
import com.gt.notification_service.model.EmailStatus;
import com.gt.notification_service.repository.EmailAuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service that listens to RabbitMQ queues for visitor pass events and handles notifications.
 */
@Service
public class NotificationListener {

    // --- REMOVED THE @Autowired JavaMailSender FIELD ---

    private static final Logger logger = LoggerFactory.getLogger(NotificationListener.class);

    private final EmailAuditLogRepository emailAuditLogRepository;
    private final EmailSenderService emailSenderService;

    /**
     * Use a single constructor to inject ALL required dependencies.
     */
    public NotificationListener(EmailAuditLogRepository emailAuditLogRepository, EmailSenderService emailSenderService) {
        this.emailAuditLogRepository = emailAuditLogRepository;
        this.emailSenderService = emailSenderService;
    }

    /**
     * Listens to the "pass.approved.queue" for events when a pass is approved.
     * @param event The event data from the message queue.
     */
    @RabbitListener(queues = "pass.approved.queue")
    public void handlePassApproved(PassApprovedEvent event) {
        logger.info("Received PassApprovedEvent for pass ID: {}", event.getPassId());

        String subject = "Your Visitor Pass Request has been Approved!";
        String body = String.format("Hello,\n\nThe visitor pass for %s has been approved.\n\nThank you.", event.getVisitorName());

        processEmailNotification(event.getPassId(), event.getEmployeeEmail(), subject, body);
    }

    /**
     * Listens to the "pass.rejected.queue" for events when a pass is rejected.
     * @param event The event data from the message queue.
     */
    @RabbitListener(queues = "pass.rejected.queue")
    public void handlePassRejected(PassRejectedEvent event) {
        logger.info("Received PassRejectedEvent for pass ID: {}", event.getPassId());

        String subject = "Update on Your Visitor Pass Request";
        String body = String.format(
                "Hello,\n\nUnfortunately, the visitor pass request for %s has been rejected.\n\nReason: %s\n\nThank you.",
                event.getVisitorName(),
                event.getRejectionReason()
        );

        processEmailNotification(event.getPassId(), event.getEmployeeEmail(), subject, body);
    }

    /**
     * Listens to the pass.expired.queue for events when a pass is automatically expired.
     * @param event The event data from the message queue.
     */
    @RabbitListener(queues = "pass.expired.queue")
    public void handlePassExpired(PassExpiredEvent event) {
        logger.info("Received PassExpiredEvent for pass ID: {}", event.getPassId());

        String subject = "Visitor Pass Expired: " + event.getVisitorName();
        String body = String.format(
                "This is an automated notification.\n\nThe visitor pass for %s (scheduled for %s) was not used and has been automatically expired by the system.",
                event.getVisitorName(),
                event.getVisitDateTime().toLocalDate().toString()
        );

        // Notify the employee who created the pass
        processEmailNotification(event.getPassId(), event.getEmployeeEmail(), subject, body);

        // Also notify the tenant admin, if one was found
        if (event.getTenantAdminEmail() != null && !event.getTenantAdminEmail().isEmpty()) {
            processEmailNotification(event.getPassId(), event.getTenantAdminEmail(), subject, body);
        }
    }

    /**
     * A generic helper method to process any email notification.
     */
    private void processEmailNotification(Long passId, String recipientAddress, String subject, String body) {
        // Step 1: Create the PENDING audit log record.
        EmailAuditLog auditLog = new EmailAuditLog();
        // VVV COMPLETED THIS SECTION VVV
        auditLog.setCorrelationId(UUID.randomUUID().toString());
        auditLog.setAssociatedPassId(passId);
        auditLog.setRecipientAddress(recipientAddress);
        auditLog.setSubject(subject);
        auditLog.setBody(body);
        auditLog.setStatus(EmailStatus.PENDING);
        auditLog.setCreatedAt(LocalDateTime.now());
        EmailAuditLog savedLog = emailAuditLogRepository.save(auditLog);

        // Step 2: Try to send the real email.
        try {
            boolean wasSent = emailSenderService.sendEmail(recipientAddress, subject, body);

            // Step 3: Update the log with the result.
            if (wasSent) {
                savedLog.setStatus(EmailStatus.SENT);
            } else {
                savedLog.setStatus(EmailStatus.FAILED);
                savedLog.setFailureReason("Email provider (SMTP) failed to send the message.");
            }
        } catch (Exception e) {
            logger.error("An exception occurred while sending email for pass ID: {}. Error: {}", passId, e.getMessage());
            savedLog.setStatus(EmailStatus.FAILED);
            savedLog.setFailureReason(e.getMessage());
        }

        savedLog.setProcessedAt(LocalDateTime.now());
        emailAuditLogRepository.save(savedLog);
    }
}