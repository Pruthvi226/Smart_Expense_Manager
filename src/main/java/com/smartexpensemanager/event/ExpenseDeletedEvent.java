package com.smartexpensemanager.event;

import java.io.Serializable;

public class ExpenseDeletedEvent implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long expenseId;
    private Long userId;
    private Double amount;
    private String category;

    public ExpenseDeletedEvent() {}

    public ExpenseDeletedEvent(Long expenseId, Long userId, Double amount, String category) {
        this.expenseId = expenseId;
        this.userId = userId;
        this.amount = amount;
        this.category = category;
    }

    public Long getExpenseId() { return expenseId; }
    public void setExpenseId(Long expenseId) { this.expenseId = expenseId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
