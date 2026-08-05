package com.smartexpensemanager.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "idempotency_keys", uniqueConstraints = {
    @UniqueConstraint(name = "uk_user_idempotency", columnNames = {"user_id", "idempotency_key"})
})
public class IdempotencyKey {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "idempotency_key", nullable = false, length = 128)
    private String idempotencyKey;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "request_hash", nullable = false, length = 64)
    private String requestHash;

    @Column(name = "response_status", nullable = false)
    private Integer responseStatus;

    @Column(name = "response_body", columnDefinition = "TEXT")
    private String responseBody;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public IdempotencyKey() {}

    public IdempotencyKey(Long id, String idempotencyKey, Long userId, String requestHash, Integer responseStatus, String responseBody, LocalDateTime expiresAt, LocalDateTime createdAt) {
        this.id = id;
        this.idempotencyKey = idempotencyKey;
        this.userId = userId;
        this.requestHash = requestHash;
        this.responseStatus = responseStatus;
        this.responseBody = responseBody;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getRequestHash() { return requestHash; }
    public void setRequestHash(String requestHash) { this.requestHash = requestHash; }

    public Integer getResponseStatus() { return responseStatus; }
    public void setResponseStatus(Integer responseStatus) { this.responseStatus = responseStatus; }

    public String getResponseBody() { return responseBody; }
    public void setResponseBody(String responseBody) { this.responseBody = responseBody; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static IdempotencyKeyBuilder builder() { return new IdempotencyKeyBuilder(); }

    public static class IdempotencyKeyBuilder {
        private Long id;
        private String idempotencyKey;
        private Long userId;
        private String requestHash;
        private Integer responseStatus;
        private String responseBody;
        private LocalDateTime expiresAt;
        private LocalDateTime createdAt = LocalDateTime.now();

        public IdempotencyKeyBuilder id(Long id) { this.id = id; return this; }
        public IdempotencyKeyBuilder idempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; return this; }
        public IdempotencyKeyBuilder userId(Long userId) { this.userId = userId; return this; }
        public IdempotencyKeyBuilder requestHash(String requestHash) { this.requestHash = requestHash; return this; }
        public IdempotencyKeyBuilder responseStatus(Integer responseStatus) { this.responseStatus = responseStatus; return this; }
        public IdempotencyKeyBuilder responseBody(String responseBody) { this.responseBody = responseBody; return this; }
        public IdempotencyKeyBuilder expiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; return this; }
        public IdempotencyKeyBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public IdempotencyKey build() {
            return new IdempotencyKey(id, idempotencyKey, userId, requestHash, responseStatus, responseBody, expiresAt, createdAt);
        }
    }
}
