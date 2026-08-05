package com.smartexpensemanager.dto.response;

import java.math.BigDecimal;

public class BudgetCheckResponse {
    private boolean hasBudget;
    private String category;
    private BigDecimal limitAmount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private boolean isExceeded;
    private String message;

    public BudgetCheckResponse() {}
    public BudgetCheckResponse(boolean hasBudget, String category, BigDecimal limitAmount, BigDecimal spentAmount, BigDecimal remainingAmount, boolean isExceeded, String message) {
        this.hasBudget = hasBudget;
        this.category = category;
        this.limitAmount = limitAmount;
        this.spentAmount = spentAmount;
        this.remainingAmount = remainingAmount;
        this.isExceeded = isExceeded;
        this.message = message;
    }

    public boolean isHasBudget() { return hasBudget; }
    public void setHasBudget(boolean hasBudget) { this.hasBudget = hasBudget; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public BigDecimal getLimitAmount() { return limitAmount; }
    public void setLimitAmount(BigDecimal limitAmount) { this.limitAmount = limitAmount; }
    public BigDecimal getSpentAmount() { return spentAmount; }
    public void setSpentAmount(BigDecimal spentAmount) { this.spentAmount = spentAmount; }
    public BigDecimal getRemainingAmount() { return remainingAmount; }
    public void setRemainingAmount(BigDecimal remainingAmount) { this.remainingAmount = remainingAmount; }
    public boolean isExceeded() { return isExceeded; }
    public void setExceeded(boolean isExceeded) { this.isExceeded = isExceeded; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public static BudgetCheckResponseBuilder builder() { return new BudgetCheckResponseBuilder(); }
    public static class BudgetCheckResponseBuilder {
        private boolean hasBudget;
        private String category;
        private BigDecimal limitAmount;
        private BigDecimal spentAmount;
        private BigDecimal remainingAmount;
        private boolean isExceeded;
        private String message;

        public BudgetCheckResponseBuilder hasBudget(boolean hasBudget) { this.hasBudget = hasBudget; return this; }
        public BudgetCheckResponseBuilder category(String category) { this.category = category; return this; }
        public BudgetCheckResponseBuilder limitAmount(BigDecimal limitAmount) { this.limitAmount = limitAmount; return this; }
        public BudgetCheckResponseBuilder spentAmount(BigDecimal spentAmount) { this.spentAmount = spentAmount; return this; }
        public BudgetCheckResponseBuilder remainingAmount(BigDecimal remainingAmount) { this.remainingAmount = remainingAmount; return this; }
        public BudgetCheckResponseBuilder isExceeded(boolean isExceeded) { this.isExceeded = isExceeded; return this; }
        public BudgetCheckResponseBuilder message(String message) { this.message = message; return this; }

        public BudgetCheckResponse build() { return new BudgetCheckResponse(hasBudget, category, limitAmount, spentAmount, remainingAmount, isExceeded, message); }
    }
}
