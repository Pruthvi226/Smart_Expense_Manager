package com.smartexpensemanager.service;

import com.smartexpensemanager.dto.request.IncomeRequest;
import com.smartexpensemanager.dto.response.IncomeResponse;
import com.smartexpensemanager.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

public interface IncomeService {
    IncomeResponse createIncome(Long userId, IncomeRequest request);
    IncomeResponse updateIncome(Long userId, Long incomeId, IncomeRequest request);
    void deleteIncome(Long userId, Long incomeId);
    PagedResponse<IncomeResponse> getIncomes(Long userId, Pageable pageable);
}
