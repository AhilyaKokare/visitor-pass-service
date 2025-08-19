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

@RestController
@RequestMapping("/api/auth")
@Tag(name = "0. Authentication", description = "API for user login to obtain a JWT.")
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
}