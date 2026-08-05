package com.smartexpensemanager.service;

import com.smartexpensemanager.dto.request.BudgetRequest;
import com.smartexpensemanager.dto.response.BudgetCheckResponse;
import com.smartexpensemanager.dto.response.BudgetResponse;
import com.smartexpensemanager.entity.Budget;
import com.smartexpensemanager.entity.User;
import com.smartexpensemanager.kafka.KafkaProducerService;
import com.smartexpensemanager.repository.BudgetRepository;
import com.smartexpensemanager.repository.ExpenseRepository;
import com.smartexpensemanager.repository.UserRepository;
import com.smartexpensemanager.service.impl.BudgetServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BudgetGreyboxTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private KafkaProducerService kafkaProducerService;

    @InjectMocks
    private BudgetServiceImpl budgetService;

    private User sampleUser;
    private Budget sampleBudget;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .name("Bob Manager")
                .email("bob@example.com")
                .role(User.Role.USER)
                .build();

        sampleBudget = Budget.builder()
                .id(10L)
                .category("Food")
                .limitAmount(new BigDecimal("1000.00"))
                .month(8)
                .year(2026)
                .user(sampleUser)
                .build();
    }

    @Test
    @DisplayName("Greybox Test: Verify budget utilization calculation and mapping logic")
    void testSetBudget_UtilizationCalculation() {
        BudgetRequest request = new BudgetRequest("Transport", new BigDecimal("500.00"), 8, 2026);

        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(sampleUser));
        when(budgetRepository.findByUserAndCategoryAndMonthAndYear(sampleUser, "Transport", 8, 2026))
                .thenReturn(java.util.Optional.empty());
        when(budgetRepository.save(any(Budget.class))).thenReturn(Budget.builder()
                .id(11L)
                .category("Transport")
                .limitAmount(new BigDecimal("500.00"))
                .month(8)
                .year(2026)
                .user(sampleUser)
                .build());
        when(expenseRepository.sumTotalByUserAndCategoryAndExpenseDateBetween(any(), eq("Transport"), any(), any()))
                .thenReturn(new BigDecimal("250.00"));

        BudgetResponse response = budgetService.createOrUpdateBudget(1L, request);

        assertNotNull(response);
        assertEquals(50.0, response.getUtilizationPercentage());
        assertEquals("NORMAL", response.getStatus());
    }
}
