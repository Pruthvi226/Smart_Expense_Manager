package com.smartexpensemanager.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses", indexes = {
    @Index(name = "idx_expenses_user_id", columnList = "user_id"),
    @Index(name = "idx_expenses_category", columnList = "category"),
    @Index(name = "idx_expenses_expense_date", columnList = "expense_date"),
    @Index(name = "idx_expenses_user_date", columnList = "user_id, expense_date")
})
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String category;

    @Column(length = 500)
    private String description;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

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

    public Expense() {}

    public Expense(Long id, String title, BigDecimal amount, String category, String description,
                   LocalDate expenseDate, User user, Long version, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.amount = amount;
        this.category = category;
        this.description = description;
        this.expenseDate = expenseDate;
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

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static ExpenseBuilder builder() { return new ExpenseBuilder(); }

    public static class ExpenseBuilder {
        private Long id;
        private String title;
        private BigDecimal amount;
        private String category;
        private String description;
        private LocalDate expenseDate;
        private User user;
        private Long version = 0L;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public ExpenseBuilder id(Long id) { this.id = id; return this; }
        public ExpenseBuilder title(String title) { this.title = title; return this; }
        public ExpenseBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
        public ExpenseBuilder category(String category) { this.category = category; return this; }
        public ExpenseBuilder description(String description) { this.description = description; return this; }
        public ExpenseBuilder expenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; return this; }
        public ExpenseBuilder user(User user) { this.user = user; return this; }
        public ExpenseBuilder version(Long version) { this.version = version; return this; }
        public ExpenseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ExpenseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Expense build() {
            return new Expense(id, title, amount, category, description, expenseDate, user, version, createdAt, updatedAt);
        }
    }
}
