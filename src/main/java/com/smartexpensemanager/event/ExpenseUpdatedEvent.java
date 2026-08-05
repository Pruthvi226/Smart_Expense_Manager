package com.smartexpensemanager.event;

import java.io.Serializable;

public class ExpenseUpdatedEvent implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long expenseId;
    private Long userId;
    private Double oldAmount;
    private Double newAmount;
    private String category;

    public ExpenseUpdatedEvent() {}

    public ExpenseUpdatedEvent(Long expenseId, Long userId, Double oldAmount, Double newAmount, String category) {
        this.expenseId = expenseId;
        this.userId = userId;
        this.oldAmount = oldAmount;
        this.newAmount = newAmount;
        this.category = category;
    }

    public Long getExpenseId() { return expenseId; }
    public void setExpenseId(Long expenseId) { this.expenseId = expenseId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Double getOldAmount() { return oldAmount; }
    public void setOldAmount(Double oldAmount) { this.oldAmount = oldAmount; }
    public Double getNewAmount() { return newAmount; }
    public void setNewAmount(Double newAmount) { this.newAmount = newAmount; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
