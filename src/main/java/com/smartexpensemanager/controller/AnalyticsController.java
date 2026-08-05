package com.smartexpensemanager.controller;

import com.smartexpensemanager.dto.response.AnalyticsResponse;
import com.smartexpensemanager.service.AnalyticsService;
import com.smartexpensemanager.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@Tag(name = "Analytics Module", description = "Endpoints for advanced financial analytics, moving averages, YoY growth, expense heatmaps, spending velocity, and next month forecasting")
public class AnalyticsController {

    public AnalyticsController(AnalyticsService analyticsService, SecurityUtil securityUtil) {
        this.analyticsService = analyticsService;
        this.securityUtil = securityUtil;
    }

    private final AnalyticsService analyticsService;
    private final SecurityUtil securityUtil;

    @GetMapping
    @Operation(summary = "Get advanced financial analytics", description = "Returns heatmaps, velocity, moving averages, category growth rates, and next month spending forecast")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @RequestParam(defaultValue = "6") Integer months) {
        Long userId = securityUtil.getCurrentUserId();
        AnalyticsResponse response = analyticsService.getAnalytics(userId, months);
        return ResponseEntity.ok(response);
    }
}
