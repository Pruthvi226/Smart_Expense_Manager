package com.smartexpensemanager.controller;

import com.smartexpensemanager.dto.request.AiQueryRequest;
import com.smartexpensemanager.dto.response.*;
import com.smartexpensemanager.service.AiService;
import com.smartexpensemanager.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@Tag(name = "AI Features Module", description = "Endpoints for AI merchant categorization, natural language financial queries, executive summaries, and budget optimizations")
public class AiController {

    private final AiService aiService;
    private final SecurityUtil securityUtil;

    public AiController(AiService aiService, SecurityUtil securityUtil) {
        this.aiService = aiService;
        this.securityUtil = securityUtil;
    }

    @PostMapping("/categorize")
    @Operation(summary = "Categorize expense title/merchant", description = "Smartly maps merchant names (e.g. 'Swiggy', 'Uber', 'Netflix') to expense categories")
    public ResponseEntity<AiCategorizationResponse> categorizeExpense(@RequestParam String title) {
        AiCategorizationResponse response = aiService.categorizeExpense(title);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/query")
    @Operation(summary = "Natural Language Financial Query", description = "Answers queries such as 'How much did I spend on food this month?' or 'What is my largest expense?'")
    public ResponseEntity<AiQueryResponse> processNaturalLanguageQuery(@Valid @RequestBody AiQueryRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        AiQueryResponse response = aiService.processNaturalLanguageQuery(userId, request.getQuery());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    @Operation(summary = "Get AI Spending Summary", description = "Generates executive summary of spending trends, YoY changes, and budget warnings")
    public ResponseEntity<AiSummaryResponse> generateSpendingSummary() {
        Long userId = securityUtil.getCurrentUserId();
        AiSummaryResponse response = aiService.generateSpendingSummary(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/budget-suggestions")
    @Operation(summary = "Get AI Budget Suggestions", description = "Generates recommendations to reduce discretionary spending and optimize savings")
    public ResponseEntity<AiBudgetSuggestionResponse> generateBudgetSuggestions() {
        Long userId = securityUtil.getCurrentUserId();
        AiBudgetSuggestionResponse response = aiService.generateBudgetSuggestions(userId);
        return ResponseEntity.ok(response);
    }
}
