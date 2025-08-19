package com.gt.visitor_pass_service.controller;

import com.gt.visitor_pass_service.dto.CreateTenantAndAdminRequest;
import com.gt.visitor_pass_service.dto.TenantDashboardInfo;
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

import java.util.List;

@RestController
@RequestMapping("/api/super-admin")
@Tag(name = "1. Super Admin", description = "Global APIs for managing tenants and their primary administrators.")
public class SuperAdminController {

    private final UserService userService;

    public SuperAdminController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/tenants")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a Tenant and its Admin", description = "Creates a new office location (tenant) and its first primary administrator in a single transaction.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tenant and Admin created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data provided"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Caller is not a Super Admin")
    })
    public ResponseEntity<TenantDashboardInfo> createTenantAndAdmin(
            @Valid @RequestBody CreateTenantAndAdminRequest request,
            Authentication authentication) {
        String creatorName = authentication.getName();
        TenantDashboardInfo response = userService.createTenantAndAdmin(request, creatorName);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/dashboard/tenants")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get Tenant Dashboard", description = "Retrieves a list of all tenants and their assigned admin details for the main dashboard.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the list of tenants"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Caller is not a Super Admin")
    })
    public ResponseEntity<List<TenantDashboardInfo>> getTenantDashboard() {
        List<TenantDashboardInfo> dashboardInfo = userService.getTenantDashboardInfo();
        return ResponseEntity.ok(dashboardInfo);
    }
}