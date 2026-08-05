package com.smartexpensemanager.dto.response;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardSummaryResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private BigDecimal currentBalance;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal budgetRemaining;
    private Double savingsRate;
    private BigDecimal cashFlow;

    private List<CategorySpend> topSpendingCategories;
    private List<MonthlyTrendPoint> monthlyTrend;
    private List<WeeklyTrendPoint> weeklyTrend;
    private List<ExpenseResponse> recentTransactions;
    private Map<String, BigDecimal> expenseDistribution;

    public DashboardSummaryResponse() {}

    public DashboardSummaryResponse(BigDecimal currentBalance, BigDecimal totalIncome, BigDecimal totalExpenses,
                                    BigDecimal budgetRemaining, Double savingsRate, BigDecimal cashFlow,
                                    List<CategorySpend> topSpendingCategories, List<MonthlyTrendPoint> monthlyTrend,
                                    List<WeeklyTrendPoint> weeklyTrend, List<ExpenseResponse> recentTransactions,
                                    Map<String, BigDecimal> expenseDistribution) {
        this.currentBalance = currentBalance;
        this.totalIncome = totalIncome;
        this.totalExpenses = totalExpenses;
        this.budgetRemaining = budgetRemaining;
        this.savingsRate = savingsRate;
        this.cashFlow = cashFlow;
        this.topSpendingCategories = topSpendingCategories;
        this.monthlyTrend = monthlyTrend;
        this.weeklyTrend = weeklyTrend;
        this.recentTransactions = recentTransactions;
        this.expenseDistribution = expenseDistribution;
    }

    public BigDecimal getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(BigDecimal currentBalance) { this.currentBalance = currentBalance; }

    public BigDecimal getTotalIncome() { return totalIncome; }
    public void setTotalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; }

    public BigDecimal getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }

    public BigDecimal getBudgetRemaining() { return budgetRemaining; }
    public void setBudgetRemaining(BigDecimal budgetRemaining) { this.budgetRemaining = budgetRemaining; }

    public Double getSavingsRate() { return savingsRate; }
    public void setSavingsRate(Double savingsRate) { this.savingsRate = savingsRate; }

    public BigDecimal getCashFlow() { return cashFlow; }
    public void setCashFlow(BigDecimal cashFlow) { this.cashFlow = cashFlow; }

    public List<CategorySpend> getTopSpendingCategories() { return topSpendingCategories; }
    public void setTopSpendingCategories(List<CategorySpend> topSpendingCategories) { this.topSpendingCategories = topSpendingCategories; }

    public List<MonthlyTrendPoint> getMonthlyTrend() { return monthlyTrend; }
    public void setMonthlyTrend(List<MonthlyTrendPoint> monthlyTrend) { this.monthlyTrend = monthlyTrend; }

    public List<WeeklyTrendPoint> getWeeklyTrend() { return weeklyTrend; }
    public void setWeeklyTrend(List<WeeklyTrendPoint> weeklyTrend) { this.weeklyTrend = weeklyTrend; }

    public List<ExpenseResponse> getRecentTransactions() { return recentTransactions; }
    public void setRecentTransactions(List<ExpenseResponse> recentTransactions) { this.recentTransactions = recentTransactions; }

    public Map<String, BigDecimal> getExpenseDistribution() { return expenseDistribution; }
    public void setExpenseDistribution(Map<String, BigDecimal> expenseDistribution) { this.expenseDistribution = expenseDistribution; }

    public static DashboardSummaryResponseBuilder builder() { return new DashboardSummaryResponseBuilder(); }

    public static class DashboardSummaryResponseBuilder {
        private BigDecimal currentBalance;
        private BigDecimal totalIncome;
        private BigDecimal totalExpenses;
        private BigDecimal budgetRemaining;
        private Double savingsRate;
        private BigDecimal cashFlow;
        private List<CategorySpend> topSpendingCategories;
        private List<MonthlyTrendPoint> monthlyTrend;
        private List<WeeklyTrendPoint> weeklyTrend;
        private List<ExpenseResponse> recentTransactions;
        private Map<String, BigDecimal> expenseDistribution;

        public DashboardSummaryResponseBuilder currentBalance(BigDecimal currentBalance) { this.currentBalance = currentBalance; return this; }
        public DashboardSummaryResponseBuilder totalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; return this; }
        public DashboardSummaryResponseBuilder totalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; return this; }
        public DashboardSummaryResponseBuilder budgetRemaining(BigDecimal budgetRemaining) { this.budgetRemaining = budgetRemaining; return this; }
        public DashboardSummaryResponseBuilder savingsRate(Double savingsRate) { this.savingsRate = savingsRate; return this; }
        public DashboardSummaryResponseBuilder cashFlow(BigDecimal cashFlow) { this.cashFlow = cashFlow; return this; }
        public DashboardSummaryResponseBuilder topSpendingCategories(List<CategorySpend> topSpendingCategories) { this.topSpendingCategories = topSpendingCategories; return this; }
        public DashboardSummaryResponseBuilder monthlyTrend(List<MonthlyTrendPoint> monthlyTrend) { this.monthlyTrend = monthlyTrend; return this; }
        public DashboardSummaryResponseBuilder weeklyTrend(List<WeeklyTrendPoint> weeklyTrend) { this.weeklyTrend = weeklyTrend; return this; }
        public DashboardSummaryResponseBuilder recentTransactions(List<ExpenseResponse> recentTransactions) { this.recentTransactions = recentTransactions; return this; }
        public DashboardSummaryResponseBuilder expenseDistribution(Map<String, BigDecimal> expenseDistribution) { this.expenseDistribution = expenseDistribution; return this; }

        public DashboardSummaryResponse build() {
            return new DashboardSummaryResponse(currentBalance, totalIncome, totalExpenses, budgetRemaining, savingsRate, cashFlow, topSpendingCategories, monthlyTrend, weeklyTrend, recentTransactions, expenseDistribution);
        }
    }

    public static class CategorySpend implements Serializable {
        private String category;
        private BigDecimal amount;
        private Double percentage;

        public CategorySpend() {}
        public CategorySpend(String category, BigDecimal amount, Double percentage) {
            this.category = category;
            this.amount = amount;
            this.percentage = percentage;
        }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public Double getPercentage() { return percentage; }
        public void setPercentage(Double percentage) { this.percentage = percentage; }
    }

    public static class MonthlyTrendPoint implements Serializable {
        private String month;
        private BigDecimal income;
        private BigDecimal expenses;

        public MonthlyTrendPoint() {}
        public MonthlyTrendPoint(String month, BigDecimal income, BigDecimal expenses) {
            this.month = month;
            this.income = income;
            this.expenses = expenses;
        }

        public String getMonth() { return month; }
        public void setMonth(String month) { this.month = month; }

        public BigDecimal getIncome() { return income; }
        public void setIncome(BigDecimal income) { this.income = income; }

        public BigDecimal getExpenses() { return expenses; }
        public void setExpenses(BigDecimal expenses) { this.expenses = expenses; }
    }

    public static class WeeklyTrendPoint implements Serializable {
        private String dayOfWeek;
        private BigDecimal amount;

        public WeeklyTrendPoint() {}
        public WeeklyTrendPoint(String dayOfWeek, BigDecimal amount) {
            this.dayOfWeek = dayOfWeek;
            this.amount = amount;
        }

        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
    }
}
