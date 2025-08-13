package com.gt.visitor_pass_service.controller;

import com.gt.visitor_pass_service.dto.CreateTenantAndAdminRequest;
import com.gt.visitor_pass_service.dto.TenantDashboardInfo;
import com.gt.visitor_pass_service.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/super-admin")
public class SuperAdminController {

    private final UserService userService;

    public SuperAdminController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Creates a new Tenant (location) and its primary Tenant Admin in a single operation.
     * @param request The request body containing details for both tenant and admin.
     * @param authentication The security principal of the logged-in Super Admin.
     * @return A DTO containing the combined information for dashboard display.
     */
    @PostMapping("/tenants")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<TenantDashboardInfo> createTenantAndAdmin(
            @Valid @RequestBody CreateTenantAndAdminRequest request,
            Authentication authentication) {

        // We get the Super Admin's name from the token to stamp the 'createdBy' field
        String creatorName = authentication.getName();

        TenantDashboardInfo response = userService.createTenantAndAdmin(request, creatorName);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Retrieves a list of all tenants and their assigned admin details for the dashboard.
     * @return A list of TenantDashboardInfo objects.
     */
    @GetMapping("/dashboard/tenants")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<TenantDashboardInfo>> getTenantDashboard() {
        List<TenantDashboardInfo> dashboardInfo = userService.getTenantDashboardInfo();
        return ResponseEntity.ok(dashboardInfo);
    }
}