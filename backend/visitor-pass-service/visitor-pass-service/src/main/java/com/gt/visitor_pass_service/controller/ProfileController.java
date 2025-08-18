package com.gt.visitor_pass_service.controller;

import com.gt.visitor_pass_service.dto.UpdateProfileRequest;
import com.gt.visitor_pass_service.dto.UserResponse;
import com.gt.visitor_pass_service.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Retrieves the profile of the currently authenticated user.
     * @param authentication The security principal provided by Spring Security.
     * @return The full profile details of the logged-in user.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getMyProfile(Authentication authentication) {
        String userEmail = authentication.getName();
        UserResponse userProfile = userService.getCurrentUserProfile(userEmail);
        return ResponseEntity.ok(userProfile);
    }

    /**
     * Updates the profile of the currently authenticated user.
     * Only allows changes to contact, email, and address.
     * @param authentication The security principal.
     * @param request The DTO containing the fields to update.
     * @return The updated full profile details.
     */
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> updateMyProfile(Authentication authentication, @Valid @RequestBody UpdateProfileRequest request) {
        String userEmail = authentication.getName();
        UserResponse updatedProfile = userService.updateUserProfile(userEmail, request);
        return ResponseEntity.ok(updatedProfile);
    }
}