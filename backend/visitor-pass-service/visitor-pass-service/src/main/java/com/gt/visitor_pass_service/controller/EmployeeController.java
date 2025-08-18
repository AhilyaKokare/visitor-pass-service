package com.gt.visitor_pass_service.controller;

import com.gt.visitor_pass_service.dto.CreatePassRequest;
import com.gt.visitor_pass_service.dto.VisitorPassResponse;
import com.gt.visitor_pass_service.service.TenantSecurityService;
import com.gt.visitor_pass_service.service.VisitorPassService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenants/{tenantId}/passes")
public class EmployeeController {

    private final VisitorPassService visitorPassService;
    private final TenantSecurityService tenantSecurityService;

    public EmployeeController(VisitorPassService visitorPassService, TenantSecurityService tenantSecurityService) {
        this.visitorPassService = visitorPassService;
        this.tenantSecurityService = tenantSecurityService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'TENANT_ADMIN')")
    public ResponseEntity<VisitorPassResponse> createPass(@PathVariable Long tenantId, @RequestBody CreatePassRequest request, Authentication authentication, HttpServletRequest servletRequest) {
        tenantSecurityService.checkTenantAccess(servletRequest.getHeader("Authorization"), tenantId);
        String userEmail = authentication.getName();
        VisitorPassResponse response = visitorPassService.createPass(tenantId, request, userEmail);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'APPROVER', 'SECURITY', 'TENANT_ADMIN')")
    public ResponseEntity<List<VisitorPassResponse>> getPassesForTenant(@PathVariable Long tenantId, HttpServletRequest servletRequest) {
        tenantSecurityService.checkTenantAccess(servletRequest.getHeader("Authorization"), tenantId);
        List<VisitorPassResponse> passes = visitorPassService.getPassesByTenant(tenantId);
        return ResponseEntity.ok(passes);
    }

    // NEW ENDPOINT
    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'TENANT_ADMIN')")
    public ResponseEntity<List<VisitorPassResponse>> getMyPassHistory(Authentication authentication) {
        String userEmail = authentication.getName();
        List<VisitorPassResponse> history = visitorPassService.getPassHistoryForUser(userEmail);
        return ResponseEntity.ok(history);
    }
}