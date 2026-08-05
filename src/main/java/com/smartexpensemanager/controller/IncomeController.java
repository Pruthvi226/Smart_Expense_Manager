package com.smartexpensemanager.controller;

import com.smartexpensemanager.dto.request.IncomeRequest;
import com.smartexpensemanager.dto.response.IncomeResponse;
import com.smartexpensemanager.dto.response.PagedResponse;
import com.smartexpensemanager.service.IncomeService;
import com.smartexpensemanager.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/incomes", "/api/incomes"})
@Tag(name = "Income Module", description = "Endpoints for logging, updating, and viewing user income sources")
public class IncomeController {

    public IncomeController(IncomeService incomeService, SecurityUtil securityUtil) {
        this.incomeService = incomeService;
        this.securityUtil = securityUtil;
    }

    private final IncomeService incomeService;
    private final SecurityUtil securityUtil;

    @PostMapping
    @Operation(summary = "Log new income", description = "Records a new income entry")
    public ResponseEntity<IncomeResponse> createIncome(@Valid @RequestBody IncomeRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        IncomeResponse response = incomeService.createIncome(userId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update income entry", description = "Updates an existing income entry")
    public ResponseEntity<IncomeResponse> updateIncome(
            @PathVariable Long id,
            @Valid @RequestBody IncomeRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        IncomeResponse response = incomeService.updateIncome(userId, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete income entry", description = "Deletes an income entry by ID")
    public ResponseEntity<Void> deleteIncome(@PathVariable Long id) {
        Long userId = securityUtil.getCurrentUserId();
        incomeService.deleteIncome(userId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "Get user incomes", description = "Retrieves paginated list of user income entries")
    public ResponseEntity<PagedResponse<IncomeResponse>> getIncomes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = securityUtil.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("incomeDate").descending());
        PagedResponse<IncomeResponse> response = incomeService.getIncomes(userId, pageable);
        return ResponseEntity.ok(response);
    }
}
