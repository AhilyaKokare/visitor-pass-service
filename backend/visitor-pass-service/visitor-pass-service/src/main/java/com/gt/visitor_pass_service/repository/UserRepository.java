package com.gt.visitor_pass_service.repository;

import com.gt.visitor_pass_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page; // <-- Import Page
import org.springframework.data.domain.Pageable; // <-- Import Pageable

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByPasswordResetToken(String token);
    List<User> findByRole(String role);

    long countByTenantId(Long tenantId);

    Page<User> findByTenantId(Long tenantId, Pageable pageable);
}