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
import com.gt.visitor_pass_service.exception.AccessDeniedException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import com.gt.visitor_pass_service.dto.PasswordResetRequestEvent;
import com.gt.visitor_pass_service.config.RabbitMQConfig;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RabbitTemplate rabbitTemplate;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       JwtTokenProvider tokenProvider,
                       PasswordEncoder passwordEncoder,
                       RabbitTemplate rabbitTemplate) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.rabbitTemplate = rabbitTemplate;
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

    @Transactional
    public void initiatePasswordReset(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setPasswordResetToken(token);
            user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(1)); // Token is valid for 1 hour
            userRepository.save(user);

            PasswordResetRequestEvent event = new PasswordResetRequestEvent(
                    user.getName(),
                    user.getEmail(),
                    token,
                    "http://localhost:4200/reset-password" // Your frontend URL
            );

            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY_PASSWORD_RESET, event);
        });
        // Note: We deliberately do nothing if the user is not found.
        // This prevents attackers from checking which emails are registered.
    }

    // --- NEW METHOD 2: COMPLETE PASSWORD RESET ---
    @Transactional
    public void completePasswordReset(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new AccessDeniedException("Invalid or expired password reset token."));

        if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new AccessDeniedException("Invalid or expired password reset token.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        // Invalidate the token after use for security
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);
    }

}