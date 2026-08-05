package com.smartexpensemanager.service;

import com.smartexpensemanager.dto.request.ExpenseRequest;
import com.smartexpensemanager.dto.response.ExpenseResponse;
import com.smartexpensemanager.entity.Expense;
import com.smartexpensemanager.entity.User;
import com.smartexpensemanager.kafka.KafkaProducerService;
import com.smartexpensemanager.repository.BudgetRepository;
import com.smartexpensemanager.repository.ExpenseRepository;
import com.smartexpensemanager.repository.UserRepository;
import com.smartexpensemanager.service.impl.ExpenseServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private KafkaProducerService kafkaProducerService;

    @InjectMocks
    private ExpenseServiceImpl expenseService;

    private User sampleUser;
    private Expense sampleExpense;
    private ExpenseRequest sampleRequest;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .name("John Doe")
                .email("john@example.com")
                .password("password123")
                .role(User.Role.USER)
                .build();

        sampleExpense = Expense.builder()
                .id(100L)
                .title("Coffee")
                .amount(new BigDecimal("150.00"))
                .category("Food")
                .description("Morning Espresso")
                .expenseDate(LocalDate.now())
                .user(sampleUser)
                .version(0L)
                .build();

        sampleRequest = ExpenseRequest.builder()
                .title("Coffee")
                .amount(new BigDecimal("150.00"))
                .category("Food")
                .description("Morning Espresso")
                .expenseDate(LocalDate.now())
                .build();
    }

    @Test
    @DisplayName("Should successfully create expense and publish event")
    void createExpense_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(expenseRepository.save(any(Expense.class))).thenReturn(sampleExpense);

        ExpenseResponse response = expenseService.createExpense(1L, sampleRequest);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("Coffee", response.getTitle());
        assertEquals(new BigDecimal("150.00"), response.getAmount());
        assertEquals("Food", response.getCategory());

        verify(expenseRepository, times(1)).save(any(Expense.class));
        verify(kafkaProducerService, times(1)).publishExpenseCreated(any());
    }

    @Test
    @DisplayName("Should throw Exception when User not found")
    void createExpense_UserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> expenseService.createExpense(99L, sampleRequest));
    }
}
