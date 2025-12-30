package com.fullstack.Salonms.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reception")
public class Reception {
    @Id
    private String id;
    private String name;
    private String email;
    private String phone;
    private String shift; // Morning, Evening, Full-day

    // ADD THIS FIELD - Role is always "RECEPTION" for reception collection
    private String role = "RECEPTION"; // This ensures role is always present

    // AUTH SYSTEM (SAME AS STAFF)
    private String status; // PENDING, ACTIVE, INACTIVE
    private String passwordHash; // null initially
    private Boolean hasActivated = false;
    private Date activatedAt;
    private Date lastLogin;

    // Your existing getters/setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getShift() {
        return shift;
    }

    public void setShift(String shift) {
        this.shift = shift;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Boolean getHasActivated() {
        return hasActivated;
    }

    public void setHasActivated(Boolean hasActivated) {
        this.hasActivated = hasActivated;
    }

    public Date getActivatedAt() {
        return activatedAt;
    }

    public void setActivatedAt(Date activatedAt) {
        this.activatedAt = activatedAt;
    }

    public Date getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(Date lastLogin) {
        this.lastLogin = lastLogin;
    }
}