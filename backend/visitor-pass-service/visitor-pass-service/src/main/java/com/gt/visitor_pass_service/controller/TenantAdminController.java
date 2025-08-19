package com.gt.visitor_pass_service.controller;

import com.gt.visitor_pass_service.dto.*;
import com.gt.visitor_pass_service.service.DashboardService;
import com.gt.visitor_pass_service.service.TenantSecurityService;
import com.gt.visitor_pass_service.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenants/{tenantId}/admin")
@Tag(name = "2. Tenant Admin", description = "APIs for Tenant Admins to manage their own location's users and view dashboards.")
public class TenantAdminController {

    private final UserService userService;
    private final TenantSecurityService tenantSecurityService;
    private final DashboardService dashboardService;

    public TenantAdminController(UserService userService, TenantSecurityService tenantSecurityService, DashboardService dashboardService) {
        this.userService = userService;
        this.tenantSecurityService = tenantSecurityService;
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    @Operation(summary = "Get Tenant Admin Dashboard", description = "Retrieves an aggregated dashboard of statistics, recent passes, and activity logs for the specified tenant.")
    public ResponseEntity<TenantDashboardResponse> getDashboard(@Parameter(description = "ID of the tenant to manage") @PathVariable Long tenantId, HttpServletRequest servletRequest) {
        tenantSecurityService.checkTenantAccess(servletRequest.getHeader("Authorization"), tenantId);
        TenantDashboardResponse dashboardData = dashboardService.getTenantDashboardData(tenantId);
        return ResponseEntity.ok(dashboardData);
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    @Operation(summary = "Get All Users in Tenant", description = "Retrieves a list of all users within the Tenant Admin's assigned location.")
    public ResponseEntity<List<UserResponse>> getUsersInTenant(@Parameter(description = "ID of the tenant to manage") @PathVariable Long tenantId, HttpServletRequest servletRequest) {
        tenantSecurityService.checkTenantAccess(servletRequest.getHeader("Authorization"), tenantId);
        List<UserResponse> users = userService.getUsersByTenant(tenantId);
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    @Operation(summary = "Create a New User", description = "Creates a new user (Employee, Approver, or Security) within the Tenant Admin's assigned location.")
    public ResponseEntity<UserResponse> createUser(@Parameter(description = "ID of the tenant where user will be created") @PathVariable Long tenantId, @Valid @RequestBody CreateUserRequest request, HttpServletRequest servletRequest) {
        tenantSecurityService.checkTenantAccess(servletRequest.getHeader("Authorization"), tenantId);
        UserResponse response = userService.createUser(tenantId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/users/{userId}/status")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    @Operation(summary = "Activate or Deactivate a User", description = "Updates the active status of a user within the Tenant Admin's location.")
    public ResponseEntity<UserResponse> updateUserStatus(
            @Parameter(description = "ID of the tenant") @PathVariable Long tenantId,
            @Parameter(description = "ID of the user to update") @PathVariable Long userId,
            @RequestBody UpdateUserStatusRequest request,
            HttpServletRequest servletRequest) {
        tenantSecurityService.checkTenantAccess(servletRequest.getHeader("Authorization"), tenantId);
        UserResponse response = userService.updateUserStatus(userId, tenantId, request.isActive());
        return ResponseEntity.ok(response);
    }
}