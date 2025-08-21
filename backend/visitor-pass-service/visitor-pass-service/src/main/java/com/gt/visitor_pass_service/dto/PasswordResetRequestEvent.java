package com.gt.visitor_pass_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetRequestEvent implements Serializable {
    private String recipientName;
    private String recipientEmail;
    private String resetToken;
    private String frontendResetUrl; // e.g., "http://localhost:4200/reset-password"
}