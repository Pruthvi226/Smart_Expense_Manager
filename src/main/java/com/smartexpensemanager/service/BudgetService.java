package com.smartexpensemanager.service;

import com.smartexpensemanager.dto.request.BudgetRequest;
import com.smartexpensemanager.dto.response.BudgetCheckResponse;
import com.smartexpensemanager.dto.response.BudgetResponse;

import java.util.List;

public interface BudgetService {
    BudgetResponse createOrUpdateBudget(Long userId, BudgetRequest request);
    List<BudgetResponse> getBudgets(Long userId, Integer month, Integer year);
    BudgetCheckResponse checkBudget(Long userId, String category, Integer month, Integer year);
    void deleteBudget(Long userId, Long budgetId);
}
