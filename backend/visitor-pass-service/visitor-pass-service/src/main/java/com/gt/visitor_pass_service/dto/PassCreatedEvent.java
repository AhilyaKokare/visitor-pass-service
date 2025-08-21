package com.gt.visitor_pass_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PassCreatedEvent implements Serializable {
    private Long passId;
    private Long tenantId;
    private String visitorName;
    private String visitorEmail;
    private String visitorPhone;
    private String purpose;
    private LocalDateTime visitDateTime;
    private String passCode;
    private String employeeEmail;
    private String employeeName;
    private String tenantName;
}
