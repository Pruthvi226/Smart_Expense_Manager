package com.smartexpensemanager.dto.response;

import java.math.BigDecimal;

public class BudgetResponse {
    private Long id;
    private String category;
    private BigDecimal limitAmount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private Double utilizationPercentage;
    private String status;
    private Integer month;
    private Integer year;

    public BudgetResponse() {}
    public BudgetResponse(Long id, String category, BigDecimal limitAmount, BigDecimal spentAmount, BigDecimal remainingAmount, Double utilizationPercentage, String status, Integer month, Integer year) {
        this.id = id;
        this.category = category;
        this.limitAmount = limitAmount;
        this.spentAmount = spentAmount;
        this.remainingAmount = remainingAmount;
        this.utilizationPercentage = utilizationPercentage;
        this.status = status;
        this.month = month;
        this.year = year;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public BigDecimal getLimitAmount() { return limitAmount; }
    public void setLimitAmount(BigDecimal limitAmount) { this.limitAmount = limitAmount; }
    public BigDecimal getSpentAmount() { return spentAmount; }
    public void setSpentAmount(BigDecimal spentAmount) { this.spentAmount = spentAmount; }
    public BigDecimal getRemainingAmount() { return remainingAmount; }
    public void setRemainingAmount(BigDecimal remainingAmount) { this.remainingAmount = remainingAmount; }
    public Double getUtilizationPercentage() { return utilizationPercentage; }
    public void setUtilizationPercentage(Double utilizationPercentage) { this.utilizationPercentage = utilizationPercentage; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public static BudgetResponseBuilder builder() { return new BudgetResponseBuilder(); }
    public static class BudgetResponseBuilder {
        private Long id;
        private String category;
        private BigDecimal limitAmount;
        private BigDecimal spentAmount;
        private BigDecimal remainingAmount;
        private Double utilizationPercentage;
        private String status;
        private Integer month;
        private Integer year;

        public BudgetResponseBuilder id(Long id) { this.id = id; return this; }
        public BudgetResponseBuilder category(String category) { this.category = category; return this; }
        public BudgetResponseBuilder limitAmount(BigDecimal limitAmount) { this.limitAmount = limitAmount; return this; }
        public BudgetResponseBuilder spentAmount(BigDecimal spentAmount) { this.spentAmount = spentAmount; return this; }
        public BudgetResponseBuilder remainingAmount(BigDecimal remainingAmount) { this.remainingAmount = remainingAmount; return this; }
        public BudgetResponseBuilder utilizationPercentage(Double utilizationPercentage) { this.utilizationPercentage = utilizationPercentage; return this; }
        public BudgetResponseBuilder status(String status) { this.status = status; return this; }
        public BudgetResponseBuilder month(Integer month) { this.month = month; return this; }
        public BudgetResponseBuilder year(Integer year) { this.year = year; return this; }

        public BudgetResponse build() { return new BudgetResponse(id, category, limitAmount, spentAmount, remainingAmount, utilizationPercentage, status, month, year); }
    }
}
