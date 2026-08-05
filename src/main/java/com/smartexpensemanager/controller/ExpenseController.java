package com.smartexpensemanager.controller;

import com.smartexpensemanager.dto.request.ExpenseRequest;
import com.smartexpensemanager.dto.response.ExpenseResponse;
import com.smartexpensemanager.dto.response.PagedResponse;
import com.smartexpensemanager.service.ExpenseService;
import com.smartexpensemanager.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping({"/api/v1/expenses", "/api/expenses"})
@Tag(name = "Expense Module", description = "Endpoints for creating, updating, deleting, searching, filtering, and paginating expenses")
public class ExpenseController {

    public ExpenseController(ExpenseService expenseService, SecurityUtil securityUtil) {
        this.expenseService = expenseService;
        this.securityUtil = securityUtil;
    }

    private final ExpenseService expenseService;
    private final SecurityUtil securityUtil;

    @PostMapping
    @Operation(summary = "Create expense", description = "Creates a new expense record. Supports 'Idempotency-Key' header to prevent duplicate creations.")
    public ResponseEntity<ExpenseResponse> createExpense(@Valid @RequestBody ExpenseRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        ExpenseResponse response = expenseService.createExpense(userId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update expense", description = "Updates an existing expense record with optimistic locking protection")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        ExpenseResponse response = expenseService.updateExpense(userId, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete expense", description = "Deletes an expense record by ID")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        Long userId = securityUtil.getCurrentUserId();
        expenseService.deleteExpense(userId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "View expense details", description = "Retrieves specific expense details by ID")
    public ResponseEntity<ExpenseResponse> getExpenseById(@PathVariable Long id) {
        Long userId = securityUtil.getCurrentUserId();
        ExpenseResponse response = expenseService.getExpenseById(userId, id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Search and filter expenses", description = "Advanced multi-criteria search for expenses supporting pagination, sorting, category filtering, date range, amount range, and keyword search")
    public ResponseEntity<PagedResponse<ExpenseResponse>> searchExpenses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "expenseDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) String q) {

        Long userId = securityUtil.getCurrentUserId();
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<ExpenseResponse> response = expenseService.searchExpenses(
                userId, category, from, to, minAmount, maxAmount, q, pageable);

        return ResponseEntity.ok(response);
    }
}
