package com.gt.visitor_pass_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreatePassRequest {
    private String visitorName;
    private String visitorPhone;
    private String purpose;
    private LocalDateTime visitDateTime;
}