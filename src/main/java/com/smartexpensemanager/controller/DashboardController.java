package com.smartexpensemanager.controller;

import com.smartexpensemanager.dto.response.DashboardSummaryResponse;
import com.smartexpensemanager.dto.response.MonthlyReportResponse;
import com.smartexpensemanager.service.DashboardService;
import com.smartexpensemanager.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/dashboard", "/api/dashboard"})
@Tag(name = "Dashboard Module", description = "Endpoints for real-time Redis-cached financial dashboards and monthly breakdown reports")
public class DashboardController {

    public DashboardController(DashboardService dashboardService, SecurityUtil securityUtil) {
        this.dashboardService = dashboardService;
        this.securityUtil = securityUtil;
    }

    private final DashboardService dashboardService;
    private final SecurityUtil securityUtil;

    @GetMapping("/summary")
    @Operation(summary = "Get dashboard summary", description = "Returns Redis-cached summary including current balance, income/expenses, top categories, savings rate, and trends (<100ms response time target)")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        Long userId = securityUtil.getCurrentUserId();
        DashboardSummaryResponse response = dashboardService.getDashboardSummary(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/monthly-report")
    @Operation(summary = "Get monthly financial report", description = "Generates detailed monthly report for specified month and year")
    public ResponseEntity<MonthlyReportResponse> getMonthlyReport(
            @RequestParam Integer month,
            @RequestParam Integer year) {
        Long userId = securityUtil.getCurrentUserId();
        MonthlyReportResponse response = dashboardService.getMonthlyReport(userId, month, year);
        return ResponseEntity.ok(response);
    }
}
