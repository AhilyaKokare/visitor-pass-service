package com.gt.visitor_pass_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CreateUserRequest {
    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    private String password;

    @NotBlank(message = "Role cannot be blank")
    private String role; // e.g., "ROLE_EMPLOYEE", "ROLE_APPROVER", "ROLE_SECURITY"

    // --- NEW FIELDS ---
    @NotNull(message = "Joining date cannot be null")
    private LocalDate joiningDate;

    private String address;
    private String contact;
    private String gender;
    private String department;
}