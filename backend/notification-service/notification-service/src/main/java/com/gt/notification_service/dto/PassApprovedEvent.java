package com.gt.notification_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

// THIS MUST MATCH THE DTO IN THE OTHER SERVICE
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PassApprovedEvent implements Serializable {
    private Long passId;
    private Long tenantId;
    private String visitorName;
    private String employeeEmail;
}