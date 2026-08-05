package com.smartexpensemanager.service.impl;

import com.smartexpensemanager.dto.request.IncomeRequest;
import com.smartexpensemanager.dto.response.IncomeResponse;
import com.smartexpensemanager.dto.response.PagedResponse;
import com.smartexpensemanager.entity.Income;
import com.smartexpensemanager.entity.User;
import com.smartexpensemanager.exception.ResourceNotFoundException;
import com.smartexpensemanager.repository.IncomeRepository;
import com.smartexpensemanager.repository.UserRepository;
import com.smartexpensemanager.service.IncomeService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IncomeServiceImpl implements IncomeService {

    public IncomeServiceImpl(IncomeRepository incomeRepository, UserRepository userRepository) {
        this.incomeRepository = incomeRepository;
        this.userRepository = userRepository;
    }

    private final IncomeRepository incomeRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    @CacheEvict(value = "dashboard", key = "#userId")
    public IncomeResponse createIncome(Long userId, IncomeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Income income = Income.builder()
                .source(request.getSource())
                .amount(request.getAmount())
                .description(request.getDescription())
                .incomeDate(request.getIncomeDate())
                .user(user)
                .build();

        Income saved = incomeRepository.save(income);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "dashboard", key = "#userId")
    public IncomeResponse updateIncome(Long userId, Long incomeId, IncomeRequest request) {
        Income income = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new ResourceNotFoundException("Income", "id", incomeId));

        if (!income.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Income", "id", incomeId);
        }

        income.setSource(request.getSource());
        income.setAmount(request.getAmount());
        income.setDescription(request.getDescription());
        income.setIncomeDate(request.getIncomeDate());

        Income updated = incomeRepository.save(income);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    @CacheEvict(value = "dashboard", key = "#userId")
    public void deleteIncome(Long userId, Long incomeId) {
        Income income = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new ResourceNotFoundException("Income", "id", incomeId));

        if (!income.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Income", "id", incomeId);
        }

        incomeRepository.delete(income);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<IncomeResponse> getIncomes(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Page<Income> page = incomeRepository.findByUser(user, pageable);
        return PagedResponse.<IncomeResponse>builder()
                .content(page.getContent().stream().map(this::mapToResponse).toList())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    private IncomeResponse mapToResponse(Income income) {
        return IncomeResponse.builder()
                .id(income.getId())
                .source(income.getSource())
                .amount(income.getAmount())
                .description(income.getDescription())
                .incomeDate(income.getIncomeDate())
                .userId(income.getUser().getId())
                .createdAt(income.getCreatedAt())
                .build();
    }
}
