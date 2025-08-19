package com.gt.visitor_pass_service.controller;

import com.gt.visitor_pass_service.dto.CreateTenantAndAdminRequest;
import com.gt.visitor_pass_service.dto.SuperAdminDashboardDTO;
import com.gt.visitor_pass_service.dto.TenantDashboardInfo;
import com.gt.visitor_pass_service.service.SuperAdminDashboardService;
import com.gt.visitor_pass_service.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/super-admin")
@Tag(name = "1. Super Admin", description = "Global APIs for managing tenants and viewing system-wide analytics.")
public class SuperAdminController {

    private final UserService userService;
    private final SuperAdminDashboardService dashboardService; // <-- INJECT NEW SERVICE

    public SuperAdminController(UserService userService, SuperAdminDashboardService dashboardService) {
        this.userService = userService;
        this.dashboardService = dashboardService; // <-- INITIALIZE
    }

    // NEW / REPLACED ENDPOINT
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get Super Admin Analytics Dashboard", description = "Retrieves a complete system-wide dashboard including global stats, per-tenant activity, and recent passes.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved dashboard data"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Caller is not a Super Admin")
    })
    public ResponseEntity<SuperAdminDashboardDTO> getAnalyticsDashboard() {
        SuperAdminDashboardDTO dashboardData = dashboardService.getDashboardData();
        return ResponseEntity.ok(dashboardData);
    }

    // The createTenantAndAdmin method remains the same
    @PostMapping("/tenants")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a Tenant and its Admin", description = "Creates a new office location (tenant) and its first primary administrator.")
    public ResponseEntity<TenantDashboardInfo> createTenantAndAdmin(
            @Valid @RequestBody CreateTenantAndAdminRequest request,
            Authentication authentication) {
        String creatorName = authentication.getName();
        TenantDashboardInfo response = userService.createTenantAndAdmin(request, creatorName);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}