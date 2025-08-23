package com.gt.visitor_pass_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Data
public class CreatePassRequest {
<<<<<<< HEAD
    @NotBlank(message = "Visitor name cannot be blank")
    private String visitorName;

    @NotBlank(message = "Visitor email cannot be blank")
    @Email(message = "Visitor email should be valid")
    private String visitorEmail;

=======

    @NotEmpty(message = "Visitor name cannot be empty.")
    private String visitorName;

    @NotEmpty(message = "Visitor email cannot be empty.")
    @Email(message = "Please provide a valid email address.")
    private String visitorEmail; // <-- ADDED THIS LINE

    @NotEmpty(message = "Visitor phone number cannot be empty.")
>>>>>>> 44b2135 (Updated Pagination and notification service)
    private String visitorPhone;

    @NotEmpty(message = "Purpose of visit cannot be empty.")
    private String purpose;

    @NotNull(message = "Visit date and time must be provided.")
    @Future(message = "Visit date and time must be in the future.")
    private LocalDateTime visitDateTime;
}