package com.smartexpensemanager.event;

import java.io.Serializable;

public class BudgetExceededEvent implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long userId;
    private String userEmail;
    private String category;
    private Double limitAmount;
    private Double spentAmount;
    private Integer month;
    private Integer year;

    public BudgetExceededEvent() {}

    public BudgetExceededEvent(Long userId, String userEmail, String category, Double limitAmount, Double spentAmount, Integer month, Integer year) {
        this.userId = userId;
        this.userEmail = userEmail;
        this.category = category;
        this.limitAmount = limitAmount;
        this.spentAmount = spentAmount;
        this.month = month;
        this.year = year;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Double getLimitAmount() { return limitAmount; }
    public void setLimitAmount(Double limitAmount) { this.limitAmount = limitAmount; }
    public Double getSpentAmount() { return spentAmount; }
    public void setSpentAmount(Double spentAmount) { this.spentAmount = spentAmount; }
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
}
