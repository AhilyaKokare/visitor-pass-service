package com.gt.visitor_pass_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PassApprovedEvent implements Serializable{
    private Long passId;
    private Long tenantId;
    private String visitorName;
    private String employeeEmail;
}
