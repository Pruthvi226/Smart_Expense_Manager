package com.smartexpensemanager.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "budgets", indexes = {
    @Index(name = "idx_budgets_user_id", columnList = "user_id"),
    @Index(name = "idx_budgets_user_month_year", columnList = "user_id, month, year")
})
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String category;

    @Column(name = "limit_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal limitAmount;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

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

    public Budget() {}

    public Budget(Long id, String category, BigDecimal limitAmount, Integer month, Integer year, User user, Long version, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.category = category;
        this.limitAmount = limitAmount;
        this.month = month;
        this.year = year;
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

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getLimitAmount() { return limitAmount; }
    public void setLimitAmount(BigDecimal limitAmount) { this.limitAmount = limitAmount; }

    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static BudgetBuilder builder() { return new BudgetBuilder(); }

    public static class BudgetBuilder {
        private Long id;
        private String category;
        private BigDecimal limitAmount;
        private Integer month;
        private Integer year;
        private User user;
        private Long version = 0L;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public BudgetBuilder id(Long id) { this.id = id; return this; }
        public BudgetBuilder category(String category) { this.category = category; return this; }
        public BudgetBuilder limitAmount(BigDecimal limitAmount) { this.limitAmount = limitAmount; return this; }
        public BudgetBuilder month(Integer month) { this.month = month; return this; }
        public BudgetBuilder year(Integer year) { this.year = year; return this; }
        public BudgetBuilder user(User user) { this.user = user; return this; }
        public BudgetBuilder version(Long version) { this.version = version; return this; }
        public BudgetBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public BudgetBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Budget build() {
            return new Budget(id, category, limitAmount, month, year, user, version, createdAt, updatedAt);
        }
    }
}
