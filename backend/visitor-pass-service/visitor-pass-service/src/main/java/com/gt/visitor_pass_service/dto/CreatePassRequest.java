package com.gt.visitor_pass_service.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Data
public class CreatePassRequest {
    @NotBlank(message = "Visitor name cannot be blank")
    private String visitorName;

    @NotBlank(message = "Visitor email cannot be blank")
    @Email(message = "Visitor email should be valid")
    private String visitorEmail;

    private String visitorPhone;
    private String purpose;
    private LocalDateTime visitDateTime;
}