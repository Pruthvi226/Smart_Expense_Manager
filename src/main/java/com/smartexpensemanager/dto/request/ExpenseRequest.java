package com.smartexpensemanager.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotBlank(message = "Category is required")
    private String category;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;

    public ExpenseRequest() {}

    public ExpenseRequest(String title, BigDecimal amount, String category, String description, LocalDate expenseDate) {
        this.title = title;
        this.amount = amount;
        this.category = category;
        this.description = description;
        this.expenseDate = expenseDate;
    }

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

    public static ExpenseRequestBuilder builder() { return new ExpenseRequestBuilder(); }

    public static class ExpenseRequestBuilder {
        private String title;
        private BigDecimal amount;
        private String category;
        private String description;
        private LocalDate expenseDate;

        public ExpenseRequestBuilder title(String title) { this.title = title; return this; }
        public ExpenseRequestBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
        public ExpenseRequestBuilder category(String category) { this.category = category; return this; }
        public ExpenseRequestBuilder description(String description) { this.description = description; return this; }
        public ExpenseRequestBuilder expenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; return this; }

        public ExpenseRequest build() {
            return new ExpenseRequest(title, amount, category, description, expenseDate);
        }
    }
}
