package com.gt.visitor_pass_service.controller;

import com.gt.visitor_pass_service.dto.JwtAuthenticationResponse;
import com.gt.visitor_pass_service.dto.LoginRequest;
import com.gt.visitor_pass_service.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import com.gt.visitor_pass_service.dto.ForgotPasswordRequest;
import com.gt.visitor_pass_service.dto.ResetPasswordRequest;
import com.gt.visitor_pass_service.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "0. Authentication", description = "APIs for user login and password management.")
public class AuthController {

    // VVV INJECT AuthService INSTEAD OF THE OTHER COMPONENTS VVV
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate User", description = "Authenticates a user with email and password, returning a JWT if successful.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Authentication successful",
                    content = { @Content(mediaType = "application/json",
                            schema = @Schema(implementation = JwtAuthenticationResponse.class)) }),
            @ApiResponse(responseCode = "401", description = "Invalid credentials", content = @Content)
    })
    public ResponseEntity<JwtAuthenticationResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        // VVV THE LOGIC IS NOW A SIMPLE, SINGLE CALL TO THE SERVICE VVV
        String jwt = authService.loginAndGetToken(loginRequest);
        return ResponseEntity.ok(new JwtAuthenticationResponse(jwt));
    }

    // --- NEW ENDPOINT 1: FORGOT PASSWORD ---
    @PostMapping("/forgot-password")
    @Operation(summary = "Initiate Password Reset", description = "Sends a password reset link to the user's email if the account exists.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "If an account with this email exists, a reset link will be sent."),
            @ApiResponse(responseCode = "400", description = "Invalid email format")
    })
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.initiatePasswordReset(request.getEmail());
        return ResponseEntity.ok().build(); // Always return 200 OK for security
    }

    // --- NEW ENDPOINT 2: RESET PASSWORD ---
    @PostMapping("/reset-password")
    @Operation(summary = "Reset User Password", description = "Sets a new password for the user using a valid reset token.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Password has been reset successfully."),
            @ApiResponse(responseCode = "400", description = "Invalid request data (e.g., weak password)"),
            @ApiResponse(responseCode = "403", description = "Invalid or expired token")
    })
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.completePasswordReset(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}