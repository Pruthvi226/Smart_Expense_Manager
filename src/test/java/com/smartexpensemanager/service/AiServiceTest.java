package com.smartexpensemanager.service;

import com.smartexpensemanager.dto.response.AiCategorizationResponse;
import com.smartexpensemanager.service.impl.AiServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AiServiceTest {

    private AiServiceImpl aiService;

    @BeforeEach
    void setUp() {
        aiService = new AiServiceImpl(null, null);
    }

    @Test
    @DisplayName("Should categorize Swiggy as Food")
    void testCategorize_Swiggy() {
        AiCategorizationResponse result = aiService.categorizeExpense("Swiggy Order #1234");
        assertNotNull(result);
        assertEquals("Food", result.getSuggestedCategory());
        assertTrue(result.getConfidenceScore() >= 0.90);
    }

    @Test
    @DisplayName("Should categorize Uber as Transport")
    void testCategorize_Uber() {
        AiCategorizationResponse result = aiService.categorizeExpense("Uber Ride Airport");
        assertNotNull(result);
        assertEquals("Transport", result.getSuggestedCategory());
        assertTrue(result.getConfidenceScore() >= 0.90);
    }

    @Test
    @DisplayName("Should categorize Netflix as Entertainment")
    void testCategorize_Netflix() {
        AiCategorizationResponse result = aiService.categorizeExpense("Netflix Monthly Subscription");
        assertNotNull(result);
        assertEquals("Entertainment", result.getSuggestedCategory());
    }
}
