package com.gt.visitor_pass_service.service;

import com.gt.visitor_pass_service.config.security.JwtTokenProvider;
import com.gt.visitor_pass_service.dto.LoginRequest;
import com.gt.visitor_pass_service.exception.ResourceNotFoundException;
import com.gt.visitor_pass_service.model.User;
import com.gt.visitor_pass_service.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
    }

    /**
     * Authenticates a user based on login credentials and generates a JWT.
     * @param loginRequest DTO containing the username (email) and password.
     * @return A JWT string if authentication is successful.
     */
    public String loginAndGetToken(LoginRequest loginRequest) {
        // Step 1: Use Spring Security's AuthenticationManager to validate the credentials.
        // This will automatically use your CustomUserDetailsService to find the user
        // and BCryptPasswordEncoder to compare the passwords.
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        // Step 2: If authentication is successful, set the authentication object in the security context.
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Step 3: Fetch the full User object to include its details (like ID, tenantId) in the token.
        User user = userRepository.findByEmail(loginRequest.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", loginRequest.getUsername()));

        // Step 4: Generate the JWT using the authenticated principal and the full user object.
        return tokenProvider.generateToken(authentication, user);
    }
}