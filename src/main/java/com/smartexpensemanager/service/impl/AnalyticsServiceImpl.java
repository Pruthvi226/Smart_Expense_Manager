package com.smartexpensemanager.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.smartexpensemanager.dto.response.AnalyticsResponse;
import com.smartexpensemanager.entity.Expense;
import com.smartexpensemanager.entity.User;
import com.smartexpensemanager.exception.ResourceNotFoundException;
import com.smartexpensemanager.repository.ExpenseRepository;
import com.smartexpensemanager.repository.IncomeRepository;
import com.smartexpensemanager.repository.UserRepository;
import com.smartexpensemanager.service.AnalyticsService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    public AnalyticsServiceImpl(UserRepository userRepository, ExpenseRepository expenseRepository, IncomeRepository incomeRepository) {
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
        this.incomeRepository = incomeRepository;
    }

    private static final Logger log = LoggerFactory.getLogger(AnalyticsServiceImpl.class);

    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "analytics", key = "#userId + '-' + #months", unless = "#result == null")
    public AnalyticsResponse getAnalytics(Long userId, Integer months) {
        if (months == null || months <= 0) {
            months = 6;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(months);

        List<Expense> expenses = expenseRepository.findByUserAndExpenseDateBetween(user, startDate, endDate);

        // Daily spending calculations
        Map<LocalDate, BigDecimal> dailySpendingMap = new TreeMap<>();
        Map<String, Integer> heatmap = new HashMap<>();

        for (Expense e : expenses) {
            dailySpendingMap.merge(e.getExpenseDate(), e.getAmount(), BigDecimal::add);
            heatmap.merge(e.getExpenseDate().toString(), 1, Integer::sum);
        }

        BigDecimal totalPeriodSpending = dailySpendingMap.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalDays = Math.max(1, java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1);
        BigDecimal avgDailySpending = totalPeriodSpending.divide(BigDecimal.valueOf(totalDays), 2, RoundingMode.HALF_UP);

        // Highest & Lowest spending days
        AnalyticsResponse.DaySpendPoint highestDay = null;
        AnalyticsResponse.DaySpendPoint lowestDay = null;

        if (!dailySpendingMap.isEmpty()) {
            Map.Entry<LocalDate, BigDecimal> maxEntry = Collections.max(dailySpendingMap.entrySet(), Map.Entry.comparingByValue());
            Map.Entry<LocalDate, BigDecimal> minEntry = Collections.min(dailySpendingMap.entrySet(), Map.Entry.comparingByValue());

            highestDay = new AnalyticsResponse.DaySpendPoint(maxEntry.getKey(), maxEntry.getValue());
            lowestDay = new AnalyticsResponse.DaySpendPoint(minEntry.getKey(), minEntry.getValue());
        } else {
            highestDay = new AnalyticsResponse.DaySpendPoint(endDate, BigDecimal.ZERO);
            lowestDay = new AnalyticsResponse.DaySpendPoint(endDate, BigDecimal.ZERO);
        }

        // Spending Velocity
        BigDecimal velocity = avgDailySpending;

        // 7-day Moving Average
        List<AnalyticsResponse.MovingAveragePoint> movingAverage = new ArrayList<>();
        List<LocalDate> dates = new ArrayList<>(dailySpendingMap.keySet());
        for (int i = 0; i < dates.size(); i++) {
            LocalDate current = dates.get(i);
            int windowStart = Math.max(0, i - 6);
            BigDecimal windowSum = BigDecimal.ZERO;
            int count = 0;
            for (int j = windowStart; j <= i; j++) {
                windowSum = windowSum.add(dailySpendingMap.get(dates.get(j)));
                count++;
            }
            BigDecimal ma = windowSum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
            movingAverage.add(new AnalyticsResponse.MovingAveragePoint(current, ma));
        }

        // Category Growth vs Previous Period
        LocalDate prevStartDate = startDate.minusMonths(months);
        LocalDate prevEndDate = startDate.minusDays(1);

        List<Object[]> currentCatSummary = expenseRepository.findCategoryExpensesSummary(user, startDate, endDate);
        List<Object[]> prevCatSummary = expenseRepository.findCategoryExpensesSummary(user, prevStartDate, prevEndDate);

        Map<String, BigDecimal> currentCatMap = new HashMap<>();
        for (Object[] row : currentCatSummary) currentCatMap.put((String) row[0], (BigDecimal) row[1]);

        Map<String, BigDecimal> prevCatMap = new HashMap<>();
        for (Object[] row : prevCatSummary) prevCatMap.put((String) row[0], (BigDecimal) row[1]);

        Map<String, Double> categoryGrowth = new HashMap<>();
        for (Map.Entry<String, BigDecimal> entry : currentCatMap.entrySet()) {
            String cat = entry.getKey();
            BigDecimal currVal = entry.getValue();
            BigDecimal prevVal = prevCatMap.getOrDefault(cat, BigDecimal.ZERO);

            if (prevVal.compareTo(BigDecimal.ZERO) == 0) {
                categoryGrowth.put(cat, 100.0);
            } else {
                double growth = currVal.subtract(prevVal)
                        .divide(prevVal, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue();
                categoryGrowth.put(cat, growth);
            }
        }

        // YoY Comparison
        LocalDate currYearStart = endDate.withDayOfYear(1);
        LocalDate prevYearStart = currYearStart.minusYears(1);
        LocalDate prevYearEnd = endDate.minusYears(1);

        BigDecimal currYearSpend = expenseRepository.sumTotalByUserAndExpenseDateBetween(user, currYearStart, endDate);
        if (currYearSpend == null) currYearSpend = BigDecimal.ZERO;

        BigDecimal prevYearSpend = expenseRepository.sumTotalByUserAndExpenseDateBetween(user, prevYearStart, prevYearEnd);
        if (prevYearSpend == null) prevYearSpend = BigDecimal.ZERO;

        double yoyGrowth = 0.0;
        if (prevYearSpend.compareTo(BigDecimal.ZERO) > 0) {
            yoyGrowth = currYearSpend.subtract(prevYearSpend)
                    .divide(prevYearSpend, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
        }

        AnalyticsResponse.YoYComparison yoy = new AnalyticsResponse.YoYComparison(currYearSpend, prevYearSpend, yoyGrowth);

        // Savings Trend & Next Month Forecast (Simple Moving Average / Trend)
        BigDecimal monthlyAvg = totalPeriodSpending.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP);
        BigDecimal forecastNextMonth = monthlyAvg.multiply(BigDecimal.valueOf(1.05)); // 5% projected baseline growth

        return AnalyticsResponse.builder()
                .averageDailySpending(avgDailySpending)
                .highestSpendingDay(highestDay)
                .lowestSpendingDay(lowestDay)
                .spendingVelocity(velocity)
                .movingAverage(movingAverage)
                .categoryGrowth(categoryGrowth)
                .expenseHeatmap(heatmap)
                .yearOverYearComparison(yoy)
                .savingsTrend(new ArrayList<>())
                .forecastNextMonthSpending(forecastNextMonth)
                .build();
    }
}
