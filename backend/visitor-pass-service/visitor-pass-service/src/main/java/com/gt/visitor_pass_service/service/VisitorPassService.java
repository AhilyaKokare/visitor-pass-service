package com.gt.visitor_pass_service.service;

import com.gt.visitor_pass_service.config.RabbitMQConfig;
import com.gt.visitor_pass_service.dto.*;
import com.gt.visitor_pass_service.exception.ResourceNotFoundException;
import com.gt.visitor_pass_service.model.User;
import com.gt.visitor_pass_service.model.VisitorPass;
import com.gt.visitor_pass_service.model.enums.PassStatus;
import com.gt.visitor_pass_service.repository.UserRepository;
import com.gt.visitor_pass_service.repository.VisitorPassRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VisitorPassService {

    private final VisitorPassRepository passRepository;
    private final UserRepository userRepository;
    private final RabbitTemplate rabbitTemplate;
    private final AuditService auditService;

    public VisitorPassService(VisitorPassRepository passRepository,
                              UserRepository userRepository,
                              RabbitTemplate rabbitTemplate,
                              AuditService auditService) {
        this.passRepository = passRepository;
        this.userRepository = userRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.auditService = auditService;
    }

    // Method for an Employee to create a pass
    public VisitorPassResponse createPass(Long tenantId, CreatePassRequest request, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", creatorEmail));

        VisitorPass pass = new VisitorPass();
        pass.setTenant(creator.getTenant());
        pass.setVisitorName(request.getVisitorName());
        pass.setVisitorEmail(request.getVisitorEmail());
        pass.setVisitorPhone(request.getVisitorPhone());
        pass.setPurpose(request.getPurpose());
        pass.setVisitDateTime(request.getVisitDateTime());
        pass.setStatus(PassStatus.PENDING);
        pass.setPassCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        pass.setCreatedBy(creator);

        VisitorPass savedPass = passRepository.save(pass);
        auditService.logEvent("PASS_CREATED", creator.getId(), tenantId, savedPass.getId());

        return mapToResponse(savedPass);
    }

    // Method for an Approver to approve a pass
    public VisitorPassResponse approvePass(Long passId, String approverEmail) {
        User approver = userRepository.findByEmail(approverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", approverEmail));

        VisitorPass pass = passRepository.findById(passId)
                .orElseThrow(() -> new ResourceNotFoundException("VisitorPass", "id", passId));

        pass.setStatus(PassStatus.APPROVED);
        pass.setApprovedBy(approver);

        VisitorPass savedPass = passRepository.save(pass);
        auditService.logEvent("PASS_APPROVED", approver.getId(), pass.getTenant().getId(), savedPass.getId());

        // VVV THIS IS THE FIX VVV
        // The event now includes the visitor's email, pass code, and visit date/time
        PassApprovedEvent event = new PassApprovedEvent(
                savedPass.getId(),
                savedPass.getTenant().getId(),
                savedPass.getVisitorName(),
                savedPass.getVisitorEmail(),
                savedPass.getCreatedBy().getEmail(),
                savedPass.getPassCode(), // <-- ADDED
                savedPass.getVisitDateTime() // <-- ADDED
        );
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY_APPROVED, event);

        return mapToResponse(savedPass);
    }

    /**
     * Rejects a visitor pass request.
     */
    public VisitorPassResponse rejectPass(Long passId, String approverEmail, String reason) {
        User approver = userRepository.findByEmail(approverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", approverEmail));

        VisitorPass pass = passRepository.findById(passId)
                .orElseThrow(() -> new ResourceNotFoundException("VisitorPass", "id", passId));

        pass.setStatus(PassStatus.REJECTED);
        pass.setRejectionReason(reason);
        pass.setApprovedBy(approver);

        VisitorPass savedPass = passRepository.save(pass);
        auditService.logEvent("PASS_REJECTED", approver.getId(), pass.getTenant().getId(), savedPass.getId());

        PassRejectedEvent event = new PassRejectedEvent(
                savedPass.getId(),
                savedPass.getVisitorName(),
                savedPass.getCreatedBy().getEmail(),
                reason
        );
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY_REJECTED, event);

        return mapToResponse(savedPass);
    }

    // Method for Security to check-in a visitor
    public VisitorPassResponse checkIn(Long passId) {
        VisitorPass pass = passRepository.findById(passId)
                .orElseThrow(() -> new ResourceNotFoundException("VisitorPass", "id", passId));

        if (pass.getStatus() != PassStatus.APPROVED) {
            throw new IllegalStateException("Pass must be approved before check-in.");
        }

        pass.setStatus(PassStatus.CHECKED_IN);

        VisitorPass savedPass = passRepository.save(pass);
        auditService.logEvent("PASS_CHECKED_IN", null, pass.getTenant().getId(), savedPass.getId());

        return mapToResponse(savedPass);
    }

    public VisitorPassResponse checkOut(Long passId, Long securityUserId) {
        VisitorPass pass = passRepository.findById(passId)
                .orElseThrow(() -> new ResourceNotFoundException("VisitorPass", "id", passId));

        if (pass.getStatus() != PassStatus.CHECKED_IN) {
            throw new IllegalStateException("Pass must be checked-in before it can be checked-out.");
        }

        pass.setStatus(PassStatus.CHECKED_OUT);

        VisitorPass savedPass = passRepository.save(pass);
        auditService.logEvent("PASS_CHECKED_OUT", securityUserId, pass.getTenant().getId(), savedPass.getId());
        return mapToResponse(savedPass);
    }

    public VisitorPassResponse findByPassCode(Long tenantId, String passCode) {
        VisitorPass pass = passRepository.findByTenantIdAndPassCode(tenantId, passCode)
                .orElseThrow(() -> new ResourceNotFoundException("VisitorPass", "passCode", passCode));
        return mapToResponse(pass);
    }

    public Page<VisitorPassResponse> getPassesByTenant(Long tenantId, Pageable pageable) {
        Page<VisitorPass> passPage = passRepository.findByTenantId(tenantId, pageable);
        return passPage.map(this::mapToResponse);
    }

    public VisitorPassResponse getPassById(Long passId) {
        VisitorPass pass = passRepository.findById(passId)
                .orElseThrow(() -> new ResourceNotFoundException("VisitorPass", "id", passId));
        return mapToResponse(pass);
    }

    public Page<VisitorPassResponse> getPassHistoryForUser(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Page<VisitorPass> passPage = passRepository.findByCreatedById(user.getId(), pageable);
        return passPage.map(this::mapToResponse);
    }

    public List<SecurityDashboardResponse> getTodaysVisitors(Long tenantId) {
        return passRepository.findTodaysVisitorsByTenant(tenantId, LocalDate.now())
                .stream()
                .map(pass -> new SecurityDashboardResponse(
                        pass.getId(),
                        pass.getVisitorName(),
                        pass.getPassCode(),
                        pass.getStatus().name(),
                        pass.getVisitDateTime(),
                        pass.getCreatedBy().getName()
                ))
                .collect(Collectors.toList());
    }

    public VisitorPassResponse mapToResponse(VisitorPass pass) {
        VisitorPassResponse response = new VisitorPassResponse();
        response.setId(pass.getId());
        response.setTenantId(pass.getTenant().getId());
        response.setVisitorName(pass.getVisitorName());
        response.setVisitorEmail(pass.getVisitorEmail());
        response.setVisitorPhone(pass.getVisitorPhone());
        response.setPurpose(pass.getPurpose());
        response.setStatus(pass.getStatus().name());
        response.setPassCode(pass.getPassCode());
        response.setVisitDateTime(pass.getVisitDateTime());
        response.setCreatedByEmployeeName(pass.getCreatedBy().getName());

        if (pass.getApprovedBy() != null) {
            response.setApprovedBy(pass.getApprovedBy().getName());
        }
        if (pass.getStatus() == PassStatus.REJECTED) {
            response.setRejectionReason(pass.getRejectionReason());
        }
        
        return response;
    }

    
}