package com.gt.visitor_pass_service.controller;

import com.gt.visitor_pass_service.config.security.JwtTokenProvider;
import com.gt.visitor_pass_service.dto.SecurityDashboardResponse;
import com.gt.visitor_pass_service.dto.VisitorPassResponse;
import com.gt.visitor_pass_service.service.TenantSecurityService;
import com.gt.visitor_pass_service.service.VisitorPassService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenants/{tenantId}/security")
public class SecurityController {

    private final VisitorPassService visitorPassService;
    private final TenantSecurityService tenantSecurityService;
    private final JwtTokenProvider tokenProvider;

    public SecurityController(VisitorPassService visitorPassService, TenantSecurityService tenantSecurityService, JwtTokenProvider tokenProvider) {
        this.visitorPassService = visitorPassService;
        this.tenantSecurityService = tenantSecurityService;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/check-in/{passId}")
    @PreAuthorize("hasAnyRole('SECURITY', 'TENANT_ADMIN')")
    public ResponseEntity<VisitorPassResponse> checkInVisitor(@PathVariable Long tenantId, @PathVariable Long passId, HttpServletRequest request) {
        tenantSecurityService.checkTenantAccess(request.getHeader("Authorization"), tenantId);
        VisitorPassResponse response = visitorPassService.checkIn(passId);
        return ResponseEntity.ok(response);
    }

    // NEW ENDPOINT
    @PostMapping("/check-out/{passId}")
    @PreAuthorize("hasAnyRole('SECURITY', 'TENANT_ADMIN')")
    public ResponseEntity<VisitorPassResponse> checkOutVisitor(@PathVariable Long tenantId, @PathVariable Long passId, HttpServletRequest request) {
        tenantSecurityService.checkTenantAccess(request.getHeader("Authorization"), tenantId);

        // Extract userId from token to log who performed the checkout
        String token = request.getHeader("Authorization").substring(7);
        // This is a simplification; a better approach would be getting the User object from the Authentication principal
        Long securityUserId = tokenProvider.getUserIdFromJWT(token);

        VisitorPassResponse response = visitorPassService.checkOut(passId, securityUserId);
        return ResponseEntity.ok(response);
    }

    // NEW ENDPOINT
    @GetMapping("/dashboard/today")
    @PreAuthorize("hasAnyRole('SECURITY', 'TENANT_ADMIN')")
    public ResponseEntity<List<SecurityDashboardResponse>> getTodaysVisitors(@PathVariable Long tenantId, HttpServletRequest request) {
        tenantSecurityService.checkTenantAccess(request.getHeader("Authorization"), tenantId);
        List<SecurityDashboardResponse> visitors = visitorPassService.getTodaysVisitors(tenantId);
        return ResponseEntity.ok(visitors);
    }

    // NEW ENDPOINT
    /**
     * Searches for a specific visitor pass by its unique pass code.
     * @param tenantId The tenant ID from the path.
     * @param passCode The pass code from the query parameter.
     * @param request The servlet request for security checks.
     * @return The details of the found visitor pass.
     */
    @GetMapping("/passes/search")
    @PreAuthorize("hasAnyRole('SECURITY', 'TENANT_ADMIN')")
    public ResponseEntity<VisitorPassResponse> findPassByCode(
            @PathVariable Long tenantId,
            @RequestParam String passCode,
            HttpServletRequest request) {

        tenantSecurityService.checkTenantAccess(request.getHeader("Authorization"), tenantId);
        VisitorPassResponse response = visitorPassService.findByPassCode(tenantId, passCode);
        return ResponseEntity.ok(response);
    }
}