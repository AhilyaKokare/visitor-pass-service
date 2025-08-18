package com.gt.visitor_pass_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class VisitorPassResponse {
    private Long id;
    private Long tenantId;
    private String visitorName;
    private String status;
    private String passCode;
    private LocalDateTime visitDateTime;
    private String createdByEmployeeName;
}