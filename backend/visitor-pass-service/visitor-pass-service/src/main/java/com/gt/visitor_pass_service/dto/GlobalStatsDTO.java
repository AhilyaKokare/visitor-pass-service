package com.gt.visitor_pass_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GlobalStatsDTO {
    private long totalTenants;
    private long totalUsers;
    private long totalPassesIssued;
    private long activePassesToday; // Approved or Checked-In for the current day
}