package com.gt.visitor_pass_service.controller;

import com.gt.visitor_pass_service.dto.CreateUserRequest;
import com.gt.visitor_pass_service.dto.UserResponse;
import com.gt.visitor_pass_service.model.User;
import com.gt.visitor_pass_service.repository.TenantRepository;
import com.gt.visitor_pass_service.repository.UserRepository;
import com.gt.visitor_pass_service.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200", "http://localhost:50827", "http://127.0.0.1:50827"})
public class TestController {

    private static final Logger logger = LoggerFactory.getLogger(TestController.class);

    private final UserService userService;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;

    public TestController(UserService userService, UserRepository userRepository, TenantRepository tenantRepository, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Test controller is working");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/tenants/{tenantId}/users")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<?> createUserSimple(@PathVariable Long tenantId, @RequestBody Map<String, Object> userData) {
        try {
            System.out.println("=== TEST CREATE USER ===");
            System.out.println("Tenant ID: " + tenantId);
            System.out.println("User Data: " + userData);

            // Create a simple CreateUserRequest
            CreateUserRequest request = new CreateUserRequest();
            request.setName((String) userData.get("name"));
            request.setEmail((String) userData.get("email"));
            request.setPassword((String) userData.get("password"));
            request.setRole((String) userData.getOrDefault("role", "ROLE_EMPLOYEE"));
            request.setDepartment((String) userData.get("department"));
            request.setContact((String) userData.get("contact"));
            request.setGender((String) userData.get("gender"));
            request.setAddress((String) userData.get("address"));
            
            // Handle joining date
            String joiningDateStr = (String) userData.get("joiningDate");
            if (joiningDateStr != null && !joiningDateStr.isEmpty()) {
                request.setJoiningDate(LocalDate.parse(joiningDateStr));
            } else {
                request.setJoiningDate(LocalDate.now());
            }

            System.out.println("Parsed request: " + request);

            UserResponse response = userService.createUser(tenantId, request);
            System.out.println("User created successfully: " + response);

            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("Error in test create user: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("type", e.getClass().getSimpleName());
            
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/verify-password")
    public ResponseEntity<Map<String, Object>> verifyPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        logger.info("=== Password Verification Test ===");
        logger.info("Email: {}", email);
        logger.info("Password provided: {}", password != null && !password.isEmpty());

        Map<String, Object> response = new HashMap<>();

        try {
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                logger.error("User not found with email: {}", email);
                response.put("success", false);
                response.put("error", "User not found");
                return ResponseEntity.ok(response);
            }

            User user = userOpt.get();
            logger.info("User found - ID: {}, Active: {}", user.getId(), user.isActive());
            logger.info("Stored password hash: {}", user.getPassword());

            // Test password encoding
            String newHash = passwordEncoder.encode(password);
            logger.info("New hash for same password: {}", newHash);

            // Test password verification
            boolean matches = passwordEncoder.matches(password, user.getPassword());
            logger.info("Password matches: {}", matches);

            response.put("success", true);
            response.put("userFound", true);
            response.put("userId", user.getId());
            response.put("userActive", user.isActive());
            response.put("passwordMatches", matches);
            response.put("storedHash", user.getPassword());
            response.put("newHash", newHash);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error during password verification", e);
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/reset-superadmin-password")
    public ResponseEntity<Map<String, Object>> resetSuperAdminPassword() {
        logger.info("=== Resetting Super Admin Password ===");

        Map<String, Object> response = new HashMap<>();

        try {
            Optional<User> userOpt = userRepository.findByEmail("superadmin@system.com");

            if (userOpt.isEmpty()) {
                response.put("success", false);
                response.put("error", "Super Admin not found");
                return ResponseEntity.ok(response);
            }

            User user = userOpt.get();
            String oldHash = user.getPassword();

            // Reset password to "superadmin123"
            String newPassword = "superadmin123";
            String newHash = passwordEncoder.encode(newPassword);
            user.setPassword(newHash);
            userRepository.save(user);

            logger.info("Password reset completed");
            logger.info("Old hash: {}", oldHash);
            logger.info("New hash: {}", newHash);

            // Verify the new password works
            boolean matches = passwordEncoder.matches(newPassword, newHash);
            logger.info("New password verification: {}", matches);

            response.put("success", true);
            response.put("oldHash", oldHash);
            response.put("newHash", newHash);
            response.put("verification", matches);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error resetting password", e);
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/jwt-debug")
    public ResponseEntity<Map<String, Object>> jwtDebug(HttpServletRequest request) {
        logger.info("=== JWT Debug Endpoint ===");

        Map<String, Object> response = new HashMap<>();

        try {
            // Get Authorization header
            String authHeader = request.getHeader("Authorization");
            logger.info("Authorization header: {}", authHeader);

            response.put("authHeaderPresent", authHeader != null);
            response.put("authHeaderValue", authHeader != null ? "Bearer ***" : null);

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                response.put("tokenLength", token.length());
                response.put("tokenPrefix", token.substring(0, Math.min(10, token.length())) + "...");

                // Try to validate token
                try {
                    boolean isValid = passwordEncoder.matches("test", "$2a$10$test"); // Just to test encoder
                    response.put("passwordEncoderWorking", true);
                } catch (Exception e) {
                    response.put("passwordEncoderWorking", false);
                    response.put("passwordEncoderError", e.getMessage());
                }
            }

            // Get current authentication
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            response.put("authenticationPresent", auth != null);
            response.put("authenticationName", auth != null ? auth.getName() : null);
            response.put("authenticationClass", auth != null ? auth.getClass().getSimpleName() : null);
            response.put("isAuthenticated", auth != null && auth.isAuthenticated());

            response.put("success", true);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error in JWT debug", e);
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/tenant-info/{tenantId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, Object>> getTenantInfo(@PathVariable Long tenantId) {
        logger.info("=== Tenant Info Test ===");
        logger.info("Tenant ID: {}", tenantId);

        Map<String, Object> response = new HashMap<>();

        try {
            // Check if tenant exists
            Optional<com.gt.visitor_pass_service.model.Tenant> tenantOpt = tenantRepository.findById(tenantId);

            if (tenantOpt.isEmpty()) {
                response.put("tenantFound", false);
                return ResponseEntity.ok(response);
            }

            com.gt.visitor_pass_service.model.Tenant tenant = tenantOpt.get();
            response.put("tenantFound", true);
            response.put("tenantId", tenant.getId());
            response.put("tenantName", tenant.getName());
            response.put("locationDetails", tenant.getLocationDetails());

            // Check for admin
            Optional<User> adminOpt = userRepository.findFirstByTenantIdAndRole(tenantId, "ROLE_TENANT_ADMIN");
            response.put("adminFound", adminOpt.isPresent());

            if (adminOpt.isPresent()) {
                User admin = adminOpt.get();
                response.put("adminId", admin.getId());
                response.put("adminName", admin.getName());
                response.put("adminEmail", admin.getEmail());
                response.put("adminActive", admin.isActive());
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error getting tenant info", e);
            response.put("error", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}
