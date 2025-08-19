package com.gt.notification_service.service;

import com.gt.notification_service.dto.PassApprovedEvent;
import com.gt.notification_service.dto.PassExpiredEvent;
import com.gt.notification_service.dto.PassRejectedEvent;
import com.gt.notification_service.dto.UserCreatedEvent; // <-- IMPORT THE NEW DTO
import com.gt.notification_service.model.EmailAuditLog;
import com.gt.notification_service.model.EmailStatus;
import com.gt.notification_service.repository.EmailAuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class NotificationListener {

    private static final Logger logger = LoggerFactory.getLogger(NotificationListener.class);

    private final EmailAuditLogRepository emailAuditLogRepository;
    private final EmailSenderService emailSenderService;

    public NotificationListener(EmailAuditLogRepository emailAuditLogRepository, EmailSenderService emailSenderService) {
        this.emailAuditLogRepository = emailAuditLogRepository;
        this.emailSenderService = emailSenderService;
    }

    @RabbitListener(queues = "pass.approved.queue", errorHandler = "rabbitMQErrorHandler")
    public void handlePassApproved(PassApprovedEvent event) {
        logger.info("Received PassApprovedEvent for pass ID: {}", event.getPassId());
        String subject = "Your Visitor Pass Request has been Approved!";
        String body = String.format("Hello,\n\nThe visitor pass for %s has been approved.\n\nThank you.", event.getVisitorName());
        processEmailNotification(event.getPassId(), event.getEmployeeEmail(), subject, body);
    }

    @RabbitListener(queues = "pass.rejected.queue", errorHandler = "rabbitMQErrorHandler")
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

    @RabbitListener(queues = "pass.expired.queue", errorHandler = "rabbitMQErrorHandler")
    public void handlePassExpired(PassExpiredEvent event) {
        logger.info("Received PassExpiredEvent for pass ID: {}", event.getPassId());
        String subject = "Visitor Pass Expired: " + event.getVisitorName();
        String body = String.format(
                "This is an automated notification.\n\nThe visitor pass for %s (scheduled for %s) was not used and has been automatically expired by the system.",
                event.getVisitorName(),
                event.getVisitDateTime().toLocalDate().toString()
        );
        processEmailNotification(event.getPassId(), event.getEmployeeEmail(), subject, body);
        if (event.getTenantAdminEmail() != null && !event.getTenantAdminEmail().isEmpty()) {
            processEmailNotification(event.getPassId(), event.getTenantAdminEmail(), subject, body);
        }
    }

    // VVV THIS IS THE MISSING METHOD VVV
    /**
     * Listens to the user.created.queue for events when a new user is created.
     * @param event The event data from the message queue.
     */
    @RabbitListener(queues = "user.created.queue", errorHandler = "rabbitMQErrorHandler")
    public void handleUserCreated(UserCreatedEvent event) {
        logger.info("Received UserCreatedEvent for new user: {}", event.getNewUserEmail());

        String subject = "Welcome to the Visitor Pass Management System!";
        String body = String.format(
                "Hello %s,\n\n" +
                        "An account has been created for you in the Visitor Pass Management System for the location: %s.\n\n" +
                        "Your assigned role is: %s\n\n" +
                        "Please log in using the email address this was sent to and the password provided by your administrator.\n\n" +
                        "You can log in at: %s",
                event.getNewUserName(),
                event.getTenantName(),
                event.getNewUserRole().replace("ROLE_", ""),
                event.getLoginUrl()
        );

        // We don't have a passId, so we can use null for the audit log
        processEmailNotification(null, event.getNewUserEmail(), subject, body);
    }

    private void processEmailNotification(Long passId, String recipientAddress, String subject, String body) {
        EmailAuditLog auditLog = new EmailAuditLog();
        auditLog.setCorrelationId(UUID.randomUUID().toString());
        auditLog.setAssociatedPassId(passId);
        auditLog.setRecipientAddress(recipientAddress);
        auditLog.setSubject(subject);
        auditLog.setBody(body);
        auditLog.setStatus(EmailStatus.PENDING);
        auditLog.setCreatedAt(LocalDateTime.now());
        EmailAuditLog savedLog = emailAuditLogRepository.save(auditLog);

        try {
            boolean wasSent = emailSenderService.sendEmail(recipientAddress, subject, body);
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