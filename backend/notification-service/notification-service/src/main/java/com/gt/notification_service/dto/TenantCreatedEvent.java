package com.gt.notification_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

/**
 * Event published to RabbitMQ when a new tenant and admin are created by a Super Admin.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TenantCreatedEvent implements Serializable {
    private String adminName;
    private String adminEmail;
    private String adminContact;
    private String tenantName;
    private String tenantLocationDetails;
    private String adminPassword; // Temporary password for the admin
    private String createdBy; // Name of the Super Admin who created it
    private String loginUrl; // URL to the frontend login page
}
