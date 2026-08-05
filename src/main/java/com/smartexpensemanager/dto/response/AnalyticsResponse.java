package com.smartexpensemanager.dto.response;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class AnalyticsResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private BigDecimal averageDailySpending;
    private DaySpendPoint highestSpendingDay;
    private DaySpendPoint lowestSpendingDay;
    private BigDecimal spendingVelocity;
    private List<MovingAveragePoint> movingAverage;
    private Map<String, Double> categoryGrowth;
    private Map<String, Integer> expenseHeatmap;
    private YoYComparison yearOverYearComparison;
    private List<SavingsTrendPoint> savingsTrend;
    private BigDecimal forecastNextMonthSpending;

    public AnalyticsResponse() {}

    public AnalyticsResponse(BigDecimal averageDailySpending, DaySpendPoint highestSpendingDay, DaySpendPoint lowestSpendingDay,
                             BigDecimal spendingVelocity, List<MovingAveragePoint> movingAverage, Map<String, Double> categoryGrowth,
                             Map<String, Integer> expenseHeatmap, YoYComparison yearOverYearComparison, List<SavingsTrendPoint> savingsTrend,
                             BigDecimal forecastNextMonthSpending) {
        this.averageDailySpending = averageDailySpending;
        this.highestSpendingDay = highestSpendingDay;
        this.lowestSpendingDay = lowestSpendingDay;
        this.spendingVelocity = spendingVelocity;
        this.movingAverage = movingAverage;
        this.categoryGrowth = categoryGrowth;
        this.expenseHeatmap = expenseHeatmap;
        this.yearOverYearComparison = yearOverYearComparison;
        this.savingsTrend = savingsTrend;
        this.forecastNextMonthSpending = forecastNextMonthSpending;
    }

    public BigDecimal getAverageDailySpending() { return averageDailySpending; }
    public void setAverageDailySpending(BigDecimal averageDailySpending) { this.averageDailySpending = averageDailySpending; }

    public DaySpendPoint getHighestSpendingDay() { return highestSpendingDay; }
    public void setHighestSpendingDay(DaySpendPoint highestSpendingDay) { this.highestSpendingDay = highestSpendingDay; }

    public DaySpendPoint getLowestSpendingDay() { return lowestSpendingDay; }
    public void setLowestSpendingDay(DaySpendPoint lowestSpendingDay) { this.lowestSpendingDay = lowestSpendingDay; }

    public BigDecimal getSpendingVelocity() { return spendingVelocity; }
    public void setSpendingVelocity(BigDecimal spendingVelocity) { this.spendingVelocity = spendingVelocity; }

    public List<MovingAveragePoint> getMovingAverage() { return movingAverage; }
    public void setMovingAverage(List<MovingAveragePoint> movingAverage) { this.movingAverage = movingAverage; }

    public Map<String, Double> getCategoryGrowth() { return categoryGrowth; }
    public void setCategoryGrowth(Map<String, Double> categoryGrowth) { this.categoryGrowth = categoryGrowth; }

    public Map<String, Integer> getExpenseHeatmap() { return expenseHeatmap; }
    public void setExpenseHeatmap(Map<String, Integer> expenseHeatmap) { this.expenseHeatmap = expenseHeatmap; }

    public YoYComparison getYearOverYearComparison() { return yearOverYearComparison; }
    public void setYearOverYearComparison(YoYComparison yearOverYearComparison) { this.yearOverYearComparison = yearOverYearComparison; }

    public List<SavingsTrendPoint> getSavingsTrend() { return savingsTrend; }
    public void setSavingsTrend(List<SavingsTrendPoint> savingsTrend) { this.savingsTrend = savingsTrend; }

    public BigDecimal getForecastNextMonthSpending() { return forecastNextMonthSpending; }
    public void setForecastNextMonthSpending(BigDecimal forecastNextMonthSpending) { this.forecastNextMonthSpending = forecastNextMonthSpending; }

    public static AnalyticsResponseBuilder builder() { return new AnalyticsResponseBuilder(); }

    public static class AnalyticsResponseBuilder {
        private BigDecimal averageDailySpending;
        private DaySpendPoint highestSpendingDay;
        private DaySpendPoint lowestSpendingDay;
        private BigDecimal spendingVelocity;
        private List<MovingAveragePoint> movingAverage;
        private Map<String, Double> categoryGrowth;
        private Map<String, Integer> expenseHeatmap;
        private YoYComparison yearOverYearComparison;
        private List<SavingsTrendPoint> savingsTrend;
        private BigDecimal forecastNextMonthSpending;

        public AnalyticsResponseBuilder averageDailySpending(BigDecimal averageDailySpending) { this.averageDailySpending = averageDailySpending; return this; }
        public AnalyticsResponseBuilder highestSpendingDay(DaySpendPoint highestSpendingDay) { this.highestSpendingDay = highestSpendingDay; return this; }
        public AnalyticsResponseBuilder lowestSpendingDay(DaySpendPoint lowestSpendingDay) { this.lowestSpendingDay = lowestSpendingDay; return this; }
        public AnalyticsResponseBuilder spendingVelocity(BigDecimal spendingVelocity) { this.spendingVelocity = spendingVelocity; return this; }
        public AnalyticsResponseBuilder movingAverage(List<MovingAveragePoint> movingAverage) { this.movingAverage = movingAverage; return this; }
        public AnalyticsResponseBuilder categoryGrowth(Map<String, Double> categoryGrowth) { this.categoryGrowth = categoryGrowth; return this; }
        public AnalyticsResponseBuilder expenseHeatmap(Map<String, Integer> expenseHeatmap) { this.expenseHeatmap = expenseHeatmap; return this; }
        public AnalyticsResponseBuilder yearOverYearComparison(YoYComparison yearOverYearComparison) { this.yearOverYearComparison = yearOverYearComparison; return this; }
        public AnalyticsResponseBuilder savingsTrend(List<SavingsTrendPoint> savingsTrend) { this.savingsTrend = savingsTrend; return this; }
        public AnalyticsResponseBuilder forecastNextMonthSpending(BigDecimal forecastNextMonthSpending) { this.forecastNextMonthSpending = forecastNextMonthSpending; return this; }

        public AnalyticsResponse build() {
            return new AnalyticsResponse(averageDailySpending, highestSpendingDay, lowestSpendingDay, spendingVelocity, movingAverage, categoryGrowth, expenseHeatmap, yearOverYearComparison, savingsTrend, forecastNextMonthSpending);
        }
    }

    public static class DaySpendPoint implements Serializable {
        private LocalDate date;
        private BigDecimal amount;

        public DaySpendPoint() {}
        public DaySpendPoint(LocalDate date, BigDecimal amount) {
            this.date = date;
            this.amount = amount;
        }

        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
    }

    public static class MovingAveragePoint implements Serializable {
        private LocalDate date;
        private BigDecimal value;

        public MovingAveragePoint() {}
        public MovingAveragePoint(LocalDate date, BigDecimal value) {
            this.date = date;
            this.value = value;
        }

        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }

        public BigDecimal getValue() { return value; }
        public void setValue(BigDecimal value) { this.value = value; }
    }

    public static class YoYComparison implements Serializable {
        private BigDecimal currentYearSpending;
        private BigDecimal previousYearSpending;
        private Double percentageChange;

        public YoYComparison() {}
        public YoYComparison(BigDecimal currentYearSpending, BigDecimal previousYearSpending, Double percentageChange) {
            this.currentYearSpending = currentYearSpending;
            this.previousYearSpending = previousYearSpending;
            this.percentageChange = percentageChange;
        }

        public BigDecimal getCurrentYearSpending() { return currentYearSpending; }
        public void setCurrentYearSpending(BigDecimal currentYearSpending) { this.currentYearSpending = currentYearSpending; }

        public BigDecimal getPreviousYearSpending() { return previousYearSpending; }
        public void setPreviousYearSpending(BigDecimal previousYearSpending) { this.previousYearSpending = previousYearSpending; }

        public Double getPercentageChange() { return percentageChange; }
        public void setPercentageChange(Double percentageChange) { this.percentageChange = percentageChange; }
    }

    public static class SavingsTrendPoint implements Serializable {
        private String period;
        private BigDecimal savingsAmount;
        private Double savingsRate;

        public SavingsTrendPoint() {}
        public SavingsTrendPoint(String period, BigDecimal savingsAmount, Double savingsRate) {
            this.period = period;
            this.savingsAmount = savingsAmount;
            this.savingsRate = savingsRate;
        }

        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }

        public BigDecimal getSavingsAmount() { return savingsAmount; }
        public void setSavingsAmount(BigDecimal savingsAmount) { this.savingsAmount = savingsAmount; }

        public Double getSavingsRate() { return savingsRate; }
        public void setSavingsRate(Double savingsRate) { this.savingsRate = savingsRate; }
    }
}
