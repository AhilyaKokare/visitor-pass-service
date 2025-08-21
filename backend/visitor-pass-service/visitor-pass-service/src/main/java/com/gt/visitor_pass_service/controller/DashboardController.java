package com.gt.visitor_pass_service.controller;

import com.gt.visitor_pass_service.dto.UserDashboardStatsDTO;
import com.gt.visitor_pass_service.service.DashboardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "8. Dashboards", description = "APIs for retrieving dashboard-specific data.")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/user-stats")
    public ResponseEntity<UserDashboardStatsDTO> getUserStats(Authentication authentication) {
        String userEmail = authentication.getName();
        UserDashboardStatsDTO stats = dashboardService.getUserDashboardStats(userEmail);
        return ResponseEntity.ok(stats);
    }
}