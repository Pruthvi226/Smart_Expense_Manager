package com.smartexpensemanager.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public class BudgetRequest {
    @NotBlank(message = "Category is required")
    @jakarta.validation.constraints.Size(max = 100, message = "Category cannot exceed 100 characters")
    private String category;

    @NotNull(message = "Limit amount is required")
    @Positive(message = "Limit amount must be greater than zero")
    @jakarta.validation.constraints.Digits(integer = 10, fraction = 2, message = "Limit supports up to 10 integer digits and 2 decimal places")
    private BigDecimal limitAmount;

    @NotNull(message = "Month is required")
    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    private Integer month;

    @NotNull(message = "Year is required")
    @Min(value = 2000, message = "Year must be valid")
    @Max(value = 9999, message = "Year must not exceed 9999")
    private Integer year;

    public BudgetRequest() {}

    public BudgetRequest(String category, BigDecimal limitAmount, Integer month, Integer year) {
        this.category = category;
        this.limitAmount = limitAmount;
        this.month = month;
        this.year = year;
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getLimitAmount() { return limitAmount; }
    public void setLimitAmount(BigDecimal limitAmount) { this.limitAmount = limitAmount; }

    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public static BudgetRequestBuilder builder() { return new BudgetRequestBuilder(); }

    public static class BudgetRequestBuilder {
        private String category;
        private BigDecimal limitAmount;
        private Integer month;
        private Integer year;

        public BudgetRequestBuilder category(String category) { this.category = category; return this; }
        public BudgetRequestBuilder limitAmount(BigDecimal limitAmount) { this.limitAmount = limitAmount; return this; }
        public BudgetRequestBuilder month(Integer month) { this.month = month; return this; }
        public BudgetRequestBuilder year(Integer year) { this.year = year; return this; }

        public BudgetRequest build() {
            return new BudgetRequest(category, limitAmount, month, year);
        }
    }
}
