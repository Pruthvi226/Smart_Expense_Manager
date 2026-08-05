package com.smartexpensemanager.service;

import com.smartexpensemanager.dto.request.CategoryRequest;
import com.smartexpensemanager.dto.response.CategoryResponse;
import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(Long userId, CategoryRequest request);
    List<CategoryResponse> getCategories(Long userId);
    void deleteCategory(Long userId, Long categoryId);
}
