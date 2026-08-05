package com.smartexpensemanager.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ExpenseResponse {
    private Long id;
    private String title;
    private BigDecimal amount;
    private String category;
    private String description;
    private LocalDate expenseDate;
    private Long userId;
    private Long version;
    private LocalDateTime createdAt;

    public ExpenseResponse() {}
    public ExpenseResponse(Long id, String title, BigDecimal amount, String category, String description, LocalDate expenseDate, Long userId, Long version, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.amount = amount;
        this.category = category;
        this.description = description;
        this.expenseDate = expenseDate;
        this.userId = userId;
        this.version = version;
        this.createdAt = createdAt;
    }

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
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static ExpenseResponseBuilder builder() { return new ExpenseResponseBuilder(); }
    public static class ExpenseResponseBuilder {
        private Long id;
        private String title;
        private BigDecimal amount;
        private String category;
        private String description;
        private LocalDate expenseDate;
        private Long userId;
        private Long version;
        private LocalDateTime createdAt;

        public ExpenseResponseBuilder id(Long id) { this.id = id; return this; }
        public ExpenseResponseBuilder title(String title) { this.title = title; return this; }
        public ExpenseResponseBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
        public ExpenseResponseBuilder category(String category) { this.category = category; return this; }
        public ExpenseResponseBuilder description(String description) { this.description = description; return this; }
        public ExpenseResponseBuilder expenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; return this; }
        public ExpenseResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public ExpenseResponseBuilder version(Long version) { this.version = version; return this; }
        public ExpenseResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public ExpenseResponse build() { return new ExpenseResponse(id, title, amount, category, description, expenseDate, userId, version, createdAt); }
    }
}
