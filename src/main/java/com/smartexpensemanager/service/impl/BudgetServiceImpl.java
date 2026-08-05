package com.smartexpensemanager.service.impl;

import com.smartexpensemanager.dto.request.BudgetRequest;
import com.smartexpensemanager.dto.response.BudgetCheckResponse;
import com.smartexpensemanager.dto.response.BudgetResponse;
import com.smartexpensemanager.entity.Budget;
import com.smartexpensemanager.entity.User;
import com.smartexpensemanager.exception.ResourceNotFoundException;
import com.smartexpensemanager.repository.BudgetRepository;
import com.smartexpensemanager.repository.ExpenseRepository;
import com.smartexpensemanager.repository.UserRepository;
import com.smartexpensemanager.service.BudgetService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class BudgetServiceImpl implements BudgetService {

    public BudgetServiceImpl(BudgetRepository budgetRepository, UserRepository userRepository, ExpenseRepository expenseRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
    }

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "dashboard", key = "#userId")
    public BudgetResponse createOrUpdateBudget(Long userId, BudgetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Optional<Budget> existingOpt = budgetRepository.findByUserAndCategoryAndMonthAndYear(
                user, request.getCategory(), request.getMonth(), request.getYear());

        Budget budget;
        if (existingOpt.isPresent()) {
            budget = existingOpt.get();
            budget.setLimitAmount(request.getLimitAmount());
        } else {
            budget = Budget.builder()
                    .category(request.getCategory())
                    .limitAmount(request.getLimitAmount())
                    .month(request.getMonth())
                    .year(request.getYear())
                    .user(user)
                    .build();
        }

        Budget saved = budgetRepository.save(budget);
        return mapToBudgetResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets(Long userId, Integer month, Integer year) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<Budget> budgets;
        if (month != null && year != null) {
            budgets = budgetRepository.findByUserAndMonthAndYear(user, month, year);
        } else {
            budgets = budgetRepository.findByUser(user);
        }

        return budgets.stream().map(this::mapToBudgetResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetCheckResponse checkBudget(Long userId, String category, Integer month, Integer year) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Optional<Budget> budgetOpt = budgetRepository.findByUserAndCategoryAndMonthAndYear(user, category, month, year);

        if (budgetOpt.isEmpty()) {
            return BudgetCheckResponse.builder()
                    .hasBudget(false)
                    .category(category)
                    .limitAmount(BigDecimal.ZERO)
                    .spentAmount(BigDecimal.ZERO)
                    .remainingAmount(BigDecimal.ZERO)
                    .isExceeded(false)
                    .message("No budget set for category " + category)
                    .build();
        }

        Budget budget = budgetOpt.get();
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);
        BigDecimal spent = expenseRepository.sumTotalByUserAndCategoryAndExpenseDateBetween(user, category, start, end);
        if (spent == null) spent = BigDecimal.ZERO;

        BigDecimal remaining = budget.getLimitAmount().subtract(spent);
        boolean isExceeded = spent.compareTo(budget.getLimitAmount()) > 0;

        return BudgetCheckResponse.builder()
                .hasBudget(true)
                .category(category)
                .limitAmount(budget.getLimitAmount())
                .spentAmount(spent)
                .remainingAmount(remaining)
                .isExceeded(isExceeded)
                .message(isExceeded ? "Budget exceeded!" : "Budget within limit")
                .build();
    }

    @Override
    @Transactional
    public void deleteBudget(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", budgetId));
        if (!budget.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Budget", "id", budgetId);
        }
        budgetRepository.delete(budget);
    }

    private BudgetResponse mapToBudgetResponse(Budget budget) {
        LocalDate start = LocalDate.of(budget.getYear(), budget.getMonth(), 1);
        LocalDate end = start.plusMonths(1).minusDays(1);
        BigDecimal spent = expenseRepository.sumTotalByUserAndCategoryAndExpenseDateBetween(
                budget.getUser(), budget.getCategory(), start, end);
        if (spent == null) spent = BigDecimal.ZERO;

        BigDecimal remaining = budget.getLimitAmount().subtract(spent);

        double utilization = 0.0;
        if (budget.getLimitAmount().compareTo(BigDecimal.ZERO) > 0) {
            utilization = spent.divide(budget.getLimitAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
        }

        String status = "NORMAL";
        if (utilization >= 100.0) {
            status = "EXCEEDED";
        } else if (utilization >= 80.0) {
            status = "WARNING";
        }

        return BudgetResponse.builder()
                .id(budget.getId())
                .category(budget.getCategory())
                .limitAmount(budget.getLimitAmount())
                .spentAmount(spent)
                .remainingAmount(remaining)
                .utilizationPercentage(utilization)
                .status(status)
                .month(budget.getMonth())
                .year(budget.getYear())
                .build();
    }
}
