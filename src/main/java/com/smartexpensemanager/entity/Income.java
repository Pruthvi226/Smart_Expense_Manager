package com.smartexpensemanager.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "incomes", indexes = {
    @Index(name = "idx_incomes_user_id", columnList = "user_id"),
    @Index(name = "idx_incomes_income_date", columnList = "income_date")
})
public class Income {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(length = 500)
    private String description;

    @Column(name = "income_date", nullable = false)
    private LocalDate incomeDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Version
    @Column(nullable = false)
    private Long version = 0L;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Income() {}

    public Income(Long id, String source, BigDecimal amount, String description, LocalDate incomeDate, User user, Long version, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.source = source;
        this.amount = amount;
        this.description = description;
        this.incomeDate = incomeDate;
        this.user = user;
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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getIncomeDate() { return incomeDate; }
    public void setIncomeDate(LocalDate incomeDate) { this.incomeDate = incomeDate; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static IncomeBuilder builder() { return new IncomeBuilder(); }

    public static class IncomeBuilder {
        private Long id;
        private String source;
        private BigDecimal amount;
        private String description;
        private LocalDate incomeDate;
        private User user;
        private Long version = 0L;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public IncomeBuilder id(Long id) { this.id = id; return this; }
        public IncomeBuilder source(String source) { this.source = source; return this; }
        public IncomeBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
        public IncomeBuilder description(String description) { this.description = description; return this; }
        public IncomeBuilder incomeDate(LocalDate incomeDate) { this.incomeDate = incomeDate; return this; }
        public IncomeBuilder user(User user) { this.user = user; return this; }
        public IncomeBuilder version(Long version) { this.version = version; return this; }
        public IncomeBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public IncomeBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Income build() {
            return new Income(id, source, amount, description, incomeDate, user, version, createdAt, updatedAt);
        }
    }
}
