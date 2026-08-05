package com.smartexpensemanager.service;

import com.smartexpensemanager.dto.response.AnalyticsResponse;

public interface AnalyticsService {
    AnalyticsResponse getAnalytics(Long userId, Integer months);
}
