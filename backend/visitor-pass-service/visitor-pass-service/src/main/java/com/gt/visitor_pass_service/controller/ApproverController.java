package com.gt.visitor_pass_service.controller;

import com.gt.visitor_pass_service.dto.RejectPassRequest;
import com.gt.visitor_pass_service.dto.VisitorPassResponse;
import com.gt.visitor_pass_service.service.TenantSecurityService;
import com.gt.visitor_pass_service.service.VisitorPassService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tenants/{tenantId}/approvals")
public class ApproverController {

    private final VisitorPassService visitorPassService;
    private final TenantSecurityService tenantSecurityService;

    public ApproverController(VisitorPassService visitorPassService, TenantSecurityService tenantSecurityService) {
        this.visitorPassService = visitorPassService;
        this.tenantSecurityService = tenantSecurityService;
    }

    @PostMapping("/{passId}/approve")
    @PreAuthorize("hasAnyRole('APPROVER', 'TENANT_ADMIN')")
    public ResponseEntity<VisitorPassResponse> approvePass(@PathVariable Long tenantId, @PathVariable Long passId, Authentication authentication, HttpServletRequest servletRequest) {
        tenantSecurityService.checkTenantAccess(servletRequest.getHeader("Authorization"), tenantId);
        String approverEmail = authentication.getName();
        VisitorPassResponse response = visitorPassService.approvePass(passId, approverEmail);
        return ResponseEntity.ok(response);
    }

    // NEW ENDPOINT
    @PostMapping("/{passId}/reject")
    @PreAuthorize("hasAnyRole('APPROVER', 'TENANT_ADMIN')")
    public ResponseEntity<VisitorPassResponse> rejectPass(@PathVariable Long tenantId, @PathVariable Long passId, @Valid @RequestBody RejectPassRequest request, Authentication authentication, HttpServletRequest servletRequest) {
        tenantSecurityService.checkTenantAccess(servletRequest.getHeader("Authorization"), tenantId);
        String approverEmail = authentication.getName();
        VisitorPassResponse response = visitorPassService.rejectPass(passId, approverEmail, request.getReason());
        return ResponseEntity.ok(response);
    }
}