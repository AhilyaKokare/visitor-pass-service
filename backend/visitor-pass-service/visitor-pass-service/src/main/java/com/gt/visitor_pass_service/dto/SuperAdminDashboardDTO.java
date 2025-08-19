package com.gt.visitor_pass_service.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class SuperAdminDashboardDTO {
    private GlobalStatsDTO globalStats;
    private List<TenantActivityDTO> tenantActivity;
    private List<VisitorPassResponse> recentPassesAcrossAllTenants; // Last 5-10 recent passes system-wide
}