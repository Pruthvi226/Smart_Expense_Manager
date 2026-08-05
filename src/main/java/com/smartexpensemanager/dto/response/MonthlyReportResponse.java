package com.smartexpensemanager.dto.response;

import java.math.BigDecimal;
import java.util.Map;

public class MonthlyReportResponse {
    private Integer month;
    private Integer year;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netSavings;
    private Map<String, BigDecimal> categoryBreakdown;

    public MonthlyReportResponse() {}
    public MonthlyReportResponse(Integer month, Integer year, BigDecimal totalIncome, BigDecimal totalExpenses, BigDecimal netSavings, Map<String, BigDecimal> categoryBreakdown) {
        this.month = month;
        this.year = year;
        this.totalIncome = totalIncome;
        this.totalExpenses = totalExpenses;
        this.netSavings = netSavings;
        this.categoryBreakdown = categoryBreakdown;
    }

    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public BigDecimal getTotalIncome() { return totalIncome; }
    public void setTotalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; }
    public BigDecimal getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }
    public BigDecimal getNetSavings() { return netSavings; }
    public void setNetSavings(BigDecimal netSavings) { this.netSavings = netSavings; }
    public Map<String, BigDecimal> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(Map<String, BigDecimal> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }

    public static MonthlyReportResponseBuilder builder() { return new MonthlyReportResponseBuilder(); }
    public static class MonthlyReportResponseBuilder {
        private Integer month;
        private Integer year;
        private BigDecimal totalIncome;
        private BigDecimal totalExpenses;
        private BigDecimal netSavings;
        private Map<String, BigDecimal> categoryBreakdown;

        public MonthlyReportResponseBuilder month(Integer month) { this.month = month; return this; }
        public MonthlyReportResponseBuilder year(Integer year) { this.year = year; return this; }
        public MonthlyReportResponseBuilder totalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; return this; }
        public MonthlyReportResponseBuilder totalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; return this; }
        public MonthlyReportResponseBuilder netSavings(BigDecimal netSavings) { this.netSavings = netSavings; return this; }
        public MonthlyReportResponseBuilder categoryBreakdown(Map<String, BigDecimal> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; return this; }

        public MonthlyReportResponse build() { return new MonthlyReportResponse(month, year, totalIncome, totalExpenses, netSavings, categoryBreakdown); }
    }
}
