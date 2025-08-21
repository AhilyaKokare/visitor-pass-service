package com.gt.visitor_pass_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDashboardStatsDTO {
    private long myPendingPasses;
    private long myApprovedPasses;
    private long myCompletedPasses;
    private long passesAwaitingMyApproval; // For approvers
}