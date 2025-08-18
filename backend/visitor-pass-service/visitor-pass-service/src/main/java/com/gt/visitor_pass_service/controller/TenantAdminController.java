package com.gt.visitor_pass_service.controller;

import com.gt.visitor_pass_service.dto.CreateUserRequest;
import com.gt.visitor_pass_service.dto.UpdateUserStatusRequest;
import com.gt.visitor_pass_service.dto.UserResponse;
import com.gt.visitor_pass_service.service.UserService;
import com.gt.visitor_pass_service.service.TenantSecurityService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.gt.visitor_pass_service.dto.TenantDashboardResponse; // Add import
import com.gt.visitor_pass_service.service.DashboardService;

import java.util.List;

@RestController
@RequestMapping("/api/tenants/{tenantId}/admin")
public class TenantAdminController {

    private final UserService userService;
    private final TenantSecurityService tenantSecurityService;
    private final DashboardService dashboardService;


    public TenantAdminController(UserService adminService, TenantSecurityService tenantSecurityService, DashboardService dashboardService) {
        this.userService = adminService;
        this.tenantSecurityService = tenantSecurityService;
        this.dashboardService = dashboardService;
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<UserResponse> createUser(@PathVariable Long tenantId, @RequestBody CreateUserRequest request, HttpServletRequest servletRequest) {
        tenantSecurityService.checkTenantAccess(servletRequest.getHeader("Authorization"), tenantId);
        UserResponse response = userService.createUser(tenantId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<List<UserResponse>> getUsersInTenant(@PathVariable Long tenantId, HttpServletRequest servletRequest) {
        tenantSecurityService.checkTenantAccess(servletRequest.getHeader("Authorization"), tenantId);
        List<UserResponse> users = userService.getUsersByTenant(tenantId);
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{userId}/status")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<UserResponse> updateUserStatus(@PathVariable Long tenantId, @PathVariable Long userId, @RequestBody UpdateUserStatusRequest request, HttpServletRequest servletRequest) {
        tenantSecurityService.checkTenantAccess(servletRequest.getHeader("Authorization"), tenantId);
        UserResponse response = userService.updateUserStatus(userId, tenantId, request.isActive());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<TenantDashboardResponse> getDashboard(@PathVariable Long tenantId, HttpServletRequest servletRequest) {
        tenantSecurityService.checkTenantAccess(servletRequest.getHeader("Authorization"), tenantId);
        TenantDashboardResponse dashboardData = dashboardService.getTenantDashboardData(tenantId);
        return ResponseEntity.ok(dashboardData);
    }
}