package com.smartexpensemanager.service;

import com.smartexpensemanager.dto.response.AiBudgetSuggestionResponse;
import com.smartexpensemanager.dto.response.AiCategorizationResponse;
import com.smartexpensemanager.dto.response.AiQueryResponse;
import com.smartexpensemanager.dto.response.AiSummaryResponse;

public interface AiService {
    AiCategorizationResponse categorizeExpense(String merchantOrTitle);
    AiQueryResponse processNaturalLanguageQuery(Long userId, String queryText);
    AiSummaryResponse generateSpendingSummary(Long userId);
    AiBudgetSuggestionResponse generateBudgetSuggestions(Long userId);
}
