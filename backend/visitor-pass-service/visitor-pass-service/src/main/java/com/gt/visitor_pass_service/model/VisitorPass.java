package com.gt.visitor_pass_service.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "visitor_passes")
public class VisitorPass {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;
    private String visitorName;
    private String visitorEmail;
    private String visitorPhone;
    private String purpose;
    private LocalDateTime visitDateTime;
    private String passCode;
    private String status; // PENDING, APPROVED, REJECTED, CHECKED_IN, CHECKED_OUT
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;
    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}