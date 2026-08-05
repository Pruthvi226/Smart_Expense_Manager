package com.smartexpensemanager.controller;

import com.smartexpensemanager.dto.request.BudgetRequest;
import com.smartexpensemanager.dto.response.BudgetCheckResponse;
import com.smartexpensemanager.dto.response.BudgetResponse;
import com.smartexpensemanager.service.BudgetService;
import com.smartexpensemanager.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/budgets", "/api/budgets"})
@Tag(name = "Budget Module", description = "Endpoints for managing monthly/category budgets, status tracking, remaining budget checks, and alerts")
public class BudgetController {

    public BudgetController(BudgetService budgetService, SecurityUtil securityUtil) {
        this.budgetService = budgetService;
        this.securityUtil = securityUtil;
    }

    private final BudgetService budgetService;
    private final SecurityUtil securityUtil;

    @PostMapping
    @Operation(summary = "Set or update budget", description = "Sets monthly category budget limit and evaluates utilization")
    public ResponseEntity<BudgetResponse> createOrUpdateBudget(@Valid @RequestBody BudgetRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        BudgetResponse response = budgetService.createOrUpdateBudget(userId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get user budgets", description = "Retrieves active budgets for user, optionally filtered by month and year")
    public ResponseEntity<List<BudgetResponse>> getBudgets(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        Long userId = securityUtil.getCurrentUserId();
        List<BudgetResponse> response = budgetService.getBudgets(userId, month, year);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check")
    @Operation(summary = "Check budget status for category", description = "Evaluates current spending vs limit for specified category and period")
    public ResponseEntity<BudgetCheckResponse> checkBudget(
            @RequestParam String category,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        Long userId = securityUtil.getCurrentUserId();
        BudgetCheckResponse response = budgetService.checkBudget(userId, category, month, year);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete budget", description = "Deletes budget configuration by ID")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        Long userId = securityUtil.getCurrentUserId();
        budgetService.deleteBudget(userId, id);
        return ResponseEntity.noContent().build();
    }
}
