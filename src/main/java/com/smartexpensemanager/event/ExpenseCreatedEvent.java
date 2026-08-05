package com.smartexpensemanager.event;

import java.io.Serializable;

public class ExpenseCreatedEvent implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long expenseId;
    private Long userId;
    private String title;
    private String category;
    private Double amount;
    private String expenseDate;

    public ExpenseCreatedEvent() {}

    public ExpenseCreatedEvent(Long expenseId, Long userId, String title, String category, Double amount, String expenseDate) {
        this.expenseId = expenseId;
        this.userId = userId;
        this.title = title;
        this.category = category;
        this.amount = amount;
        this.expenseDate = expenseDate;
    }

    public Long getExpenseId() { return expenseId; }
    public void setExpenseId(Long expenseId) { this.expenseId = expenseId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getExpenseDate() { return expenseDate; }
    public void setExpenseDate(String expenseDate) { this.expenseDate = expenseDate; }
}
