package com.smartexpensemanager.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.smartexpensemanager.dto.response.DashboardSummaryResponse;
import com.smartexpensemanager.dto.response.ExpenseResponse;
import com.smartexpensemanager.dto.response.MonthlyReportResponse;
import com.smartexpensemanager.entity.Budget;
import com.smartexpensemanager.entity.Expense;
import com.smartexpensemanager.entity.User;
import com.smartexpensemanager.exception.ResourceNotFoundException;
import com.smartexpensemanager.repository.BudgetRepository;
import com.smartexpensemanager.repository.ExpenseRepository;
import com.smartexpensemanager.repository.IncomeRepository;
import com.smartexpensemanager.repository.UserRepository;
import com.smartexpensemanager.service.DashboardService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    public DashboardServiceImpl(UserRepository userRepository, ExpenseRepository expenseRepository, IncomeRepository incomeRepository, BudgetRepository budgetRepository) {
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
        this.incomeRepository = incomeRepository;
        this.budgetRepository = budgetRepository;
    }

    private static final Logger log = LoggerFactory.getLogger(DashboardServiceImpl.class);

    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final BudgetRepository budgetRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "dashboard", key = "#userId", unless = "#result == null")
    public DashboardSummaryResponse getDashboardSummary(Long userId) {
        log.info("Calculating Dashboard summary (Cache miss for userId: {})", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        BigDecimal totalIncome = incomeRepository.sumTotalByUserAndIncomeDateBetween(user, startOfMonth, endOfMonth);
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;

        BigDecimal totalExpenses = expenseRepository.sumTotalByUserAndExpenseDateBetween(user, startOfMonth, endOfMonth);
        if (totalExpenses == null) totalExpenses = BigDecimal.ZERO;

        BigDecimal currentBalance = totalIncome.subtract(totalExpenses);

        List<Budget> budgets = budgetRepository.findByUserAndMonthAndYear(user, now.getMonthValue(), now.getYear());
        BigDecimal totalBudgetLimit = budgets.stream()
                .map(Budget::getLimitAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal budgetRemaining = totalBudgetLimit.subtract(totalExpenses);
        if (budgetRemaining.compareTo(BigDecimal.ZERO) < 0) {
            budgetRemaining = BigDecimal.ZERO;
        }

        double savingsRate = 0.0;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = currentBalance.divide(totalIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
        }

        // Top Spending Categories
        List<Object[]> catSummary = expenseRepository.findCategoryExpensesSummary(user, startOfMonth, endOfMonth);
        List<DashboardSummaryResponse.CategorySpend> topCategories = new ArrayList<>();
        Map<String, BigDecimal> distribution = new LinkedHashMap<>();

        for (Object[] row : catSummary) {
            String category = (String) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            double pct = 0.0;
            if (totalExpenses.compareTo(BigDecimal.ZERO) > 0) {
                pct = amount.divide(totalExpenses, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
            }
            topCategories.add(new DashboardSummaryResponse.CategorySpend(category, amount, pct));
            distribution.put(category, amount);
        }

        // Monthly Trend (Past 6 months)
        List<DashboardSummaryResponse.MonthlyTrendPoint> monthlyTrend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate mStart = now.minusMonths(i).withDayOfMonth(1);
            LocalDate mEnd = mStart.withDayOfMonth(mStart.lengthOfMonth());
            BigDecimal mInc = incomeRepository.sumTotalByUserAndIncomeDateBetween(user, mStart, mEnd);
            BigDecimal mExp = expenseRepository.sumTotalByUserAndExpenseDateBetween(user, mStart, mEnd);
            monthlyTrend.add(new DashboardSummaryResponse.MonthlyTrendPoint(
                    mStart.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + mStart.getYear(),
                    mInc != null ? mInc : BigDecimal.ZERO,
                    mExp != null ? mExp : BigDecimal.ZERO));
        }

        // Weekly Trend (Past 7 days)
        List<DashboardSummaryResponse.WeeklyTrendPoint> weeklyTrend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = now.minusDays(i);
            BigDecimal dayExp = expenseRepository.sumTotalByUserAndExpenseDateBetween(user, day, day);
            weeklyTrend.add(new DashboardSummaryResponse.WeeklyTrendPoint(
                    day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    dayExp != null ? dayExp : BigDecimal.ZERO));
        }

        // Recent Transactions (Top 5)
        List<Expense> recent = expenseRepository.findTop5ByUserOrderByExpenseDateDescCreatedAtDesc(user);
        List<ExpenseResponse> recentResponses = recent.stream().map(e -> ExpenseResponse.builder()
                .id(e.getId())
                .title(e.getTitle())
                .amount(e.getAmount())
                .category(e.getCategory())
                .description(e.getDescription())
                .expenseDate(e.getExpenseDate())
                .userId(userId)
                .version(e.getVersion())
                .createdAt(e.getCreatedAt())
                .build()).collect(Collectors.toList());

        return DashboardSummaryResponse.builder()
                .currentBalance(currentBalance)
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .budgetRemaining(budgetRemaining)
                .savingsRate(savingsRate)
                .cashFlow(currentBalance)
                .topSpendingCategories(topCategories)
                .monthlyTrend(monthlyTrend)
                .weeklyTrend(weeklyTrend)
                .recentTransactions(recentResponses)
                .expenseDistribution(distribution)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public MonthlyReportResponse getMonthlyReport(Long userId, Integer month, Integer year) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        BigDecimal totalIncome = incomeRepository.sumTotalByUserAndIncomeDateBetween(user, start, end);
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;

        BigDecimal totalExpenses = expenseRepository.sumTotalByUserAndExpenseDateBetween(user, start, end);
        if (totalExpenses == null) totalExpenses = BigDecimal.ZERO;

        BigDecimal netSavings = totalIncome.subtract(totalExpenses);

        List<Object[]> catSummary = expenseRepository.findCategoryExpensesSummary(user, start, end);
        Map<String, BigDecimal> categoryBreakdown = new LinkedHashMap<>();
        for (Object[] row : catSummary) {
            categoryBreakdown.put((String) row[0], (BigDecimal) row[1]);
        }

        return MonthlyReportResponse.builder()
                .month(month)
                .year(year)
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netSavings(netSavings)
                .categoryBreakdown(categoryBreakdown)
                .build();
    }
}
