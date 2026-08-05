package com.smartexpensemanager.service;

import com.smartexpensemanager.dto.request.ExpenseRequest;
import com.smartexpensemanager.dto.response.ExpenseResponse;
import com.smartexpensemanager.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface ExpenseService {
    ExpenseResponse createExpense(Long userId, ExpenseRequest request);
    ExpenseResponse updateExpense(Long userId, Long expenseId, ExpenseRequest request);
    void deleteExpense(Long userId, Long expenseId);
    ExpenseResponse getExpenseById(Long userId, Long expenseId);
    PagedResponse<ExpenseResponse> searchExpenses(
            Long userId,
            String category,
            LocalDate from,
            LocalDate to,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            String q,
            Pageable pageable);
}
