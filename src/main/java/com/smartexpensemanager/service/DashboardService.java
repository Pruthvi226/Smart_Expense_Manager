package com.smartexpensemanager.service;

import com.smartexpensemanager.dto.response.DashboardSummaryResponse;
import com.smartexpensemanager.dto.response.MonthlyReportResponse;

public interface DashboardService {
    DashboardSummaryResponse getDashboardSummary(Long userId);
    MonthlyReportResponse getMonthlyReport(Long userId, Integer month, Integer year);
}
