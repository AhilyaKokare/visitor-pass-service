package com.gt.visitor_pass_service.service;

import com.gt.visitor_pass_service.model.Tenant;
import com.gt.visitor_pass_service.model.User;
import com.gt.visitor_pass_service.repository.TenantRepository;
import com.gt.visitor_pass_service.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID; // <-- IMPORT THIS

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(TenantRepository tenantRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("=== DataSeeder.run() called ===");

        // Check if the Super Admin already exists
        logger.info("Checking if Super Admin exists...");
        if (userRepository.findByEmail("superadmin@system.com").isEmpty()) {
            logger.info("No Super Admin found. Seeding initial data...");

            // 1. Create a global/default tenant for the super admin
            logger.info("Creating global tenant...");
            Tenant globalTenant = new Tenant();
            globalTenant.setName("Global Administration");
            globalTenant.setLocationDetails("System-wide access");
            tenantRepository.save(globalTenant);
            logger.info("Global tenant created with ID: " + globalTenant.getId());

            // 2. Create the Super Admin user
            logger.info("Creating Super Admin user...");
            User superAdmin = new User();

            // VVV THIS IS THE FIX: SET THE UNIQUE ID FOR THE SUPER ADMIN VVV
            superAdmin.setUniqueId(UUID.randomUUID().toString());

            superAdmin.setName("Super Admin");
            superAdmin.setEmail("superadmin@system.com");
            String encodedPassword = passwordEncoder.encode("superadmin123");
            logger.info("Encoded password length: " + encodedPassword.length());
            superAdmin.setPassword(encodedPassword);
            superAdmin.setRole("ROLE_SUPER_ADMIN");
            superAdmin.setTenant(globalTenant);
            superAdmin.setActive(true);
            // The other new fields (department, gender, etc.) can be null for the Super Admin

            User savedUser = userRepository.save(superAdmin); // This line was line 47 in your stack trace
            logger.info("Super Admin saved with ID: " + savedUser.getId());

            logger.info("************************************************************");
            logger.info("Super Admin created successfully.");
            logger.info("Email: superadmin@system.com | Password: superadmin123");
            logger.info("Encoded Password: " + encodedPassword);
            logger.info("************************************************************");
        } else {
            logger.info("Super Admin already exists. Skipping data seeding.");
            // Let's also log the existing user details for debugging
            User existingUser = userRepository.findByEmail("superadmin@system.com").get();
            logger.info("Existing Super Admin details:");
            logger.info("ID: " + existingUser.getId());
            logger.info("Email: " + existingUser.getEmail());
            logger.info("Role: " + existingUser.getRole());
            logger.info("Active: " + existingUser.isActive());
            logger.info("Password hash: " + existingUser.getPassword());
        }
        logger.info("=== DataSeeder.run() completed ===");
    }
}