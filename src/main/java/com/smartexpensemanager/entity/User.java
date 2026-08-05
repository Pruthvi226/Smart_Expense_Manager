package com.smartexpensemanager.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_email", columnList = "email")
})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @Column(name = "failed_login_attempts", nullable = false)
    private Integer failedLoginAttempts = 0;

    @Column(name = "account_non_locked", nullable = false)
    private Boolean accountNonLocked = true;

    @Column(name = "lock_time")
    private LocalDateTime lockTime;

    @Column(name = "reset_password_token", length = 128, unique = true)
    private String resetPasswordToken;

    @Column(name = "reset_password_token_expires_at")
    private LocalDateTime resetPasswordTokenExpiresAt;

    @Version
    @Column(nullable = false)
    private Long version = 0L;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public User() {}

    public User(Long id, String name, String email, String password, Role role, Integer failedLoginAttempts,
                Boolean accountNonLocked, LocalDateTime lockTime, String resetPasswordToken,
                LocalDateTime resetPasswordTokenExpiresAt, Long version, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role != null ? role : Role.USER;
        this.failedLoginAttempts = failedLoginAttempts != null ? failedLoginAttempts : 0;
        this.accountNonLocked = accountNonLocked != null ? accountNonLocked : true;
        this.lockTime = lockTime;
        this.resetPasswordToken = resetPasswordToken;
        this.resetPasswordTokenExpiresAt = resetPasswordTokenExpiresAt;
        this.version = version != null ? version : 0L;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum Role {
        USER, ADMIN
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Integer getFailedLoginAttempts() { return failedLoginAttempts; }
    public void setFailedLoginAttempts(Integer failedLoginAttempts) { this.failedLoginAttempts = failedLoginAttempts; }

    public Boolean getAccountNonLocked() { return accountNonLocked; }
    public void setAccountNonLocked(Boolean accountNonLocked) { this.accountNonLocked = accountNonLocked; }

    public LocalDateTime getLockTime() { return lockTime; }
    public void setLockTime(LocalDateTime lockTime) { this.lockTime = lockTime; }

    public String getResetPasswordToken() { return resetPasswordToken; }
    public void setResetPasswordToken(String resetPasswordToken) { this.resetPasswordToken = resetPasswordToken; }

    public LocalDateTime getResetPasswordTokenExpiresAt() { return resetPasswordTokenExpiresAt; }
    public void setResetPasswordTokenExpiresAt(LocalDateTime resetPasswordTokenExpiresAt) { this.resetPasswordTokenExpiresAt = resetPasswordTokenExpiresAt; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static UserBuilder builder() { return new UserBuilder(); }

    public static class UserBuilder {
        private Long id;
        private String name;
        private String email;
        private String password;
        private Role role = Role.USER;
        private Integer failedLoginAttempts = 0;
        private Boolean accountNonLocked = true;
        private LocalDateTime lockTime;
        private String resetPasswordToken;
        private LocalDateTime resetPasswordTokenExpiresAt;
        private Long version = 0L;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder role(Role role) { this.role = role; return this; }
        public UserBuilder failedLoginAttempts(Integer failedLoginAttempts) { this.failedLoginAttempts = failedLoginAttempts; return this; }
        public UserBuilder accountNonLocked(Boolean accountNonLocked) { this.accountNonLocked = accountNonLocked; return this; }
        public UserBuilder lockTime(LocalDateTime lockTime) { this.lockTime = lockTime; return this; }
        public UserBuilder resetPasswordToken(String resetPasswordToken) { this.resetPasswordToken = resetPasswordToken; return this; }
        public UserBuilder resetPasswordTokenExpiresAt(LocalDateTime resetPasswordTokenExpiresAt) { this.resetPasswordTokenExpiresAt = resetPasswordTokenExpiresAt; return this; }
        public UserBuilder version(Long version) { this.version = version; return this; }
        public UserBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public UserBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public User build() {
            return new User(id, name, email, password, role, failedLoginAttempts, accountNonLocked, lockTime, resetPasswordToken, resetPasswordTokenExpiresAt, version, createdAt, updatedAt);
        }
    }
}
