package com.smartexpensemanager.service.impl;

import com.smartexpensemanager.dto.request.CategoryRequest;
import com.smartexpensemanager.dto.response.CategoryResponse;
import com.smartexpensemanager.entity.Category;
import com.smartexpensemanager.entity.User;
import com.smartexpensemanager.exception.ResourceNotFoundException;
import com.smartexpensemanager.repository.CategoryRepository;
import com.smartexpensemanager.repository.UserRepository;
import com.smartexpensemanager.service.CategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    public CategoryServiceImpl(CategoryRepository categoryRepository, UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CategoryResponse createCategory(Long userId, CategoryRequest request) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        }

        Category category = Category.builder()
                .name(request.getName())
                .type(request.getType() != null ? request.getType() : "EXPENSE")
                .icon(request.getIcon())
                .color(request.getColor())
                .isDefault(userId == null)
                .user(user)
                .build();

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories(Long userId) {
        List<Category> categories = categoryRepository.findByIsDefaultTrueOrUserId(userId);
        return categories.stream().map(this::mapToResponse).toList();
    }

    @Override
    @Transactional
    public void deleteCategory(Long userId, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
        if (category.getIsDefault() || category.getUser() == null || !category.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Category", "id", categoryId);
        }
        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .icon(category.getIcon())
                .color(category.getColor())
                .isDefault(category.getIsDefault())
                .userId(category.getUser() != null ? category.getUser().getId() : null)
                .build();
    }
}
