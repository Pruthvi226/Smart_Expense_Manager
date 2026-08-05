package com.smartexpensemanager.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class IncomeResponse {
    private Long id;
    private String source;
    private BigDecimal amount;
    private String description;
    private LocalDate incomeDate;
    private Long userId;
    private LocalDateTime createdAt;

    public IncomeResponse() {}
    public IncomeResponse(Long id, String source, BigDecimal amount, String description, LocalDate incomeDate, Long userId, LocalDateTime createdAt) {
        this.id = id;
        this.source = source;
        this.amount = amount;
        this.description = description;
        this.incomeDate = incomeDate;
        this.userId = userId;
        this.createdAt = createdAt;
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
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static IncomeResponseBuilder builder() { return new IncomeResponseBuilder(); }
    public static class IncomeResponseBuilder {
        private Long id;
        private String source;
        private BigDecimal amount;
        private String description;
        private LocalDate incomeDate;
        private Long userId;
        private LocalDateTime createdAt;

        public IncomeResponseBuilder id(Long id) { this.id = id; return this; }
        public IncomeResponseBuilder source(String source) { this.source = source; return this; }
        public IncomeResponseBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
        public IncomeResponseBuilder description(String description) { this.description = description; return this; }
        public IncomeResponseBuilder incomeDate(LocalDate incomeDate) { this.incomeDate = incomeDate; return this; }
        public IncomeResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public IncomeResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public IncomeResponse build() { return new IncomeResponse(id, source, amount, description, incomeDate, userId, createdAt); }
    }
}
