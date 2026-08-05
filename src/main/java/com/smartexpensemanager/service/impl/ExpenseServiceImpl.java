package com.smartexpensemanager.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.smartexpensemanager.dto.request.ExpenseRequest;
import com.smartexpensemanager.dto.response.ExpenseResponse;
import com.smartexpensemanager.dto.response.PagedResponse;
import com.smartexpensemanager.entity.Budget;
import com.smartexpensemanager.entity.Expense;
import com.smartexpensemanager.entity.User;
import com.smartexpensemanager.event.BudgetExceededEvent;
import com.smartexpensemanager.event.ExpenseCreatedEvent;
import com.smartexpensemanager.event.ExpenseDeletedEvent;
import com.smartexpensemanager.event.ExpenseUpdatedEvent;
import com.smartexpensemanager.exception.ResourceNotFoundException;
import com.smartexpensemanager.kafka.KafkaProducerService;
import com.smartexpensemanager.repository.BudgetRepository;
import com.smartexpensemanager.repository.ExpenseRepository;
import com.smartexpensemanager.repository.UserRepository;
import com.smartexpensemanager.service.ExpenseService;
import io.micrometer.core.instrument.MeterRegistry;

import jakarta.persistence.criteria.Predicate;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    private static final Logger log = LoggerFactory.getLogger(ExpenseServiceImpl.class);

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;
    private final KafkaProducerService kafkaProducerService;
    private final MeterRegistry meterRegistry;

    public ExpenseServiceImpl(ExpenseRepository expenseRepository, UserRepository userRepository,
                              BudgetRepository budgetRepository, KafkaProducerService kafkaProducerService,
                              MeterRegistry meterRegistry) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.budgetRepository = budgetRepository;
        this.kafkaProducerService = kafkaProducerService;
        this.meterRegistry = meterRegistry;
    }

    @Override
    @Transactional
    @CacheEvict(value = "dashboard", key = "#userId")
    public ExpenseResponse createExpense(Long userId, ExpenseRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Expense expense = Expense.builder()
                .title(request.getTitle())
                .amount(request.getAmount())
                .category(request.getCategory())
                .description(request.getDescription())
                .expenseDate(request.getExpenseDate())
                .user(user)
                .build();

        Expense saved = expenseRepository.save(expense);

        if (meterRegistry != null) {
            meterRegistry.counter("expenses_created_total", "category", request.getCategory()).increment();
            meterRegistry.counter("expenses_amount_total").increment(request.getAmount().doubleValue());
        }

        checkAndPublishBudgetAlert(user, request.getCategory(), request.getExpenseDate());

        kafkaProducerService.publishExpenseCreated(new ExpenseCreatedEvent(
                saved.getId(), userId, saved.getTitle(), saved.getCategory(),
                saved.getAmount().doubleValue(), saved.getExpenseDate().toString()));

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "dashboard", key = "#userId")
    public ExpenseResponse updateExpense(Long userId, Long expenseId, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", expenseId));

        if (!expense.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Expense", "id", expenseId);
        }

        BigDecimal oldAmount = expense.getAmount();

        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setExpenseDate(request.getExpenseDate());

        Expense updated = expenseRepository.save(expense);

        checkAndPublishBudgetAlert(expense.getUser(), request.getCategory(), request.getExpenseDate());

        kafkaProducerService.publishExpenseUpdated(new ExpenseUpdatedEvent(
                updated.getId(), userId, oldAmount.doubleValue(), updated.getAmount().doubleValue(), updated.getCategory()));

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    @CacheEvict(value = "dashboard", key = "#userId")
    public void deleteExpense(Long userId, Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", expenseId));

        if (!expense.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Expense", "id", expenseId);
        }

        expenseRepository.delete(expense);

        kafkaProducerService.publishExpenseDeleted(new ExpenseDeletedEvent(
                expense.getId(), userId, expense.getAmount().doubleValue(), expense.getCategory()));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ExpenseResponse> searchExpenses(Long userId, String category, LocalDate from, LocalDate to,
                                                         BigDecimal minAmount, BigDecimal maxAmount, String q, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Specification<Expense> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user"), user));

            if (category != null && !category.isBlank()) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("expenseDate"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("expenseDate"), to));
            }
            if (minAmount != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("amount"), minAmount));
            }
            if (maxAmount != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("amount"), maxAmount));
            }
            if (q != null && !q.isBlank()) {
                String pattern = "%" + q.toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), pattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), pattern);
                predicates.add(cb.or(titleMatch, descMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Expense> page = expenseRepository.findAll(spec, pageable);
        List<ExpenseResponse> content = page.getContent().stream().map(this::mapToResponse).toList();

        return PagedResponse.<ExpenseResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(Long userId, Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", expenseId));

        if (!expense.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Expense", "id", expenseId);
        }

        return mapToResponse(expense);
    }

    private void checkAndPublishBudgetAlert(User user, String category, LocalDate expenseDate) {
        int month = expenseDate.getMonthValue();
        int year = expenseDate.getYear();

        Optional<Budget> budgetOpt = budgetRepository.findByUserAndCategoryAndMonthAndYear(user, category, month, year);
        if (budgetOpt.isPresent()) {
            Budget budget = budgetOpt.get();
            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = startDate.plusMonths(1).minusDays(1);

            BigDecimal spentAmount = expenseRepository.sumTotalByUserAndCategoryAndExpenseDateBetween(user, category, startDate, endDate);
            if (spentAmount != null && spentAmount.compareTo(budget.getLimitAmount()) > 0) {
                if (meterRegistry != null) {
                    meterRegistry.counter("budget_exceeded_total", "category", category).increment();
                }
                kafkaProducerService.publishBudgetExceeded(new BudgetExceededEvent(
                        user.getId(), user.getEmail(), category, budget.getLimitAmount().doubleValue(),
                        spentAmount.doubleValue(), month, year));
            }
        }
    }

    private ExpenseResponse mapToResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .title(expense.getTitle())
                .amount(expense.getAmount())
                .category(expense.getCategory())
                .description(expense.getDescription())
                .expenseDate(expense.getExpenseDate())
                .userId(expense.getUser().getId())
                .version(expense.getVersion())
                .createdAt(expense.getCreatedAt())
                .build();
    }
}
