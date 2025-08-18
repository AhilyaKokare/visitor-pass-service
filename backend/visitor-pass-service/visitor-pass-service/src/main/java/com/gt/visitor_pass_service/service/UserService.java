package com.gt.visitor_pass_service.service;

import com.gt.visitor_pass_service.dto.*;
import com.gt.visitor_pass_service.exception.AccessDeniedException;
import com.gt.visitor_pass_service.exception.ResourceNotFoundException;
import com.gt.visitor_pass_service.model.Tenant;
import com.gt.visitor_pass_service.model.User;
import com.gt.visitor_pass_service.repository.TenantRepository;
import com.gt.visitor_pass_service.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import com.gt.visitor_pass_service.dto.UserCreatedEvent;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Map;

@Service
public class UserService { // Renamed from AdminService

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final RabbitTemplate rabbitTemplate;


    public UserService(TenantRepository tenantRepository, UserRepository userRepository, PasswordEncoder passwordEncoder, AuditService auditService, RabbitTemplate rabbitTemplate) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Transactional
    public TenantDashboardInfo createTenantAndAdmin(CreateTenantAndAdminRequest request, String creatorName) {
        // Step 1: Create and save the Tenant
        Tenant tenant = new Tenant();
        tenant.setName(request.getTenantName());
        tenant.setLocationDetails(request.getLocationDetails());
        tenant.setCreatedAt(LocalDateTime.now());
        tenant.setCreatedBy(creatorName);
        Tenant savedTenant = tenantRepository.save(tenant);

        // Step 2: Create and save the Tenant Admin User
        User tenantAdmin = new User();
        tenantAdmin.setUniqueId(UUID.randomUUID().toString());
        tenantAdmin.setName(request.getAdminName());
        tenantAdmin.setEmail(request.getAdminEmail());
        tenantAdmin.setPassword(passwordEncoder.encode(request.getAdminPassword()));
        tenantAdmin.setContact(request.getAdminContact());
        tenantAdmin.setRole("ROLE_TENANT_ADMIN");
        tenantAdmin.setActive(true);
        tenantAdmin.setTenant(savedTenant); // Assign to the newly created tenant
        User savedAdmin = userRepository.save(tenantAdmin);

        auditService.logEvent("TENANT_CREATED", null, savedTenant.getId(), null);
        auditService.logEvent("TENANT_ADMIN_CREATED", savedAdmin.getId(), savedTenant.getId(), null);

        // Step 3: Return a DTO representing the combined result
        return mapToTenantDashboardInfo(savedTenant, savedAdmin);
    }

    // --- NEW Method for Super Admin Dashboard ---
    public List<TenantDashboardInfo> getTenantDashboardInfo() {
        List<Tenant> tenants = tenantRepository.findAll();

        // Find all tenant admins to avoid N+1 queries
        List<User> tenantAdmins = userRepository.findByRole("ROLE_TENANT_ADMIN");
        Map<Long, User> tenantIdToAdminMap = tenantAdmins.stream()
                .filter(user -> user.getTenant() != null)
                .collect(Collectors.toMap(user -> user.getTenant().getId(), user -> user, (existing, replacement) -> existing)); // handle duplicates if any

        return tenants.stream()
                .filter(tenant -> !"Global Administration".equals(tenant.getName())) // Exclude the system tenant
                .map(tenant -> {
                    User admin = tenantIdToAdminMap.get(tenant.getId());
                    return mapToTenantDashboardInfo(tenant, admin);
                })
                .collect(Collectors.toList());
    }

    // --- Admin Functions (Moved from AdminService) ---

    public Tenant createTenant(CreateTenantRequest request) {
        Tenant tenant = new Tenant();
        tenant.setName(request.getName());
        tenant.setLocationDetails(request.getLocationDetails());
        return tenantRepository.save(tenant);
    }

    public UserResponse createTenantAdmin(Long tenantId, CreateUserRequest request) {
        request.setRole("ROLE_TENANT_ADMIN");
        return createUser(tenantId, request);
    }

    public UserResponse createUser(Long tenantId, CreateUserRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", "id", tenantId));

        User user = new User();
        // Generate a unique ID for the user
        user.setUniqueId(UUID.randomUUID().toString());

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setContact(request.getContact());
        user.setRole(request.getRole());
        user.setTenant(tenant);
        user.setActive(true);

        // Set new fields
        user.setJoiningDate(request.getJoiningDate());
        user.setAddress(request.getAddress());
        user.setGender(request.getGender());
        user.setDepartment(request.getDepartment());

        User savedUser = userRepository.save(user);
        auditService.logEvent("USER_CREATED", savedUser.getId(), tenantId, null);

        UserCreatedEvent event = new UserCreatedEvent(
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                tenant.getName(),
                "http://localhost:4200/login" // Your frontend login URL
        );

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY_USER_CREATED, event);

        return mapToUserResponse(savedUser);
    }

    public List<UserResponse> getUsersByTenant(Long tenantId) {
        return userRepository.findAll().stream()
                .filter(user -> user.getTenant() != null && user.getTenant().getId().equals(tenantId))
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public UserResponse updateUserStatus(Long userId, Long tenantId, boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getTenant() == null || !user.getTenant().getId().equals(tenantId)) {
            throw new AccessDeniedException("User does not belong to the specified tenant.");
        }

        user.setActive(isActive);
        User savedUser = userRepository.save(user);
        auditService.logEvent(isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED", savedUser.getId(), tenantId, null);
        return mapToUserResponse(savedUser);
    }

    // --- NEW Profile Management Functions ---

    public UserResponse getCurrentUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return mapToUserResponse(user);
    }

    public UserResponse updateUserProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        // Update only the allowed fields
        user.setContact(request.getContact());
        user.setEmail(request.getEmail());
        user.setAddress(request.getAddress());

        User updatedUser = userRepository.save(user);
        auditService.logEvent("PROFILE_UPDATED", user.getId(), user.getTenant().getId(), null);
        return mapToUserResponse(updatedUser);
    }

    private TenantDashboardInfo mapToTenantDashboardInfo(Tenant tenant, User admin) {
        return TenantDashboardInfo.builder()
                .tenantId(tenant.getId())
                .tenantName(tenant.getName())
                .locationDetails(tenant.getLocationDetails())
                .createdAt(tenant.getCreatedAt())
                .createdBy(tenant.getCreatedBy())
                .adminName(admin != null ? admin.getName() : "N/A")
                .adminEmail(admin != null ? admin.getEmail() : "N/A")
                .adminContact(admin != null ? admin.getContact() : "N/A")
                .adminIsActive(admin != null && admin.isActive())
                .build();
    }

    // --- Updated Helper Method ---
    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUniqueId(user.getUniqueId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setContact(user.getContact());
        response.setRole(user.getRole());
        response.setActive(user.isActive());
        response.setTenantId(user.getTenant().getId());
        response.setJoiningDate(user.getJoiningDate());
        response.setAddress(user.getAddress());
        response.setGender(user.getGender());
        response.setDepartment(user.getDepartment());
        return response;
    }
}