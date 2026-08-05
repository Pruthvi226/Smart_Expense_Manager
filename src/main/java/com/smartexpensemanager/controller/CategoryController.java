package com.smartexpensemanager.controller;

import com.smartexpensemanager.dto.request.CategoryRequest;
import com.smartexpensemanager.dto.response.CategoryResponse;
import com.smartexpensemanager.service.CategoryService;
import com.smartexpensemanager.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/categories", "/api/categories"})
@Tag(name = "Category Module", description = "Endpoints for managing default and custom user categories")
public class CategoryController {

    public CategoryController(CategoryService categoryService, SecurityUtil securityUtil) {
        this.categoryService = categoryService;
        this.securityUtil = securityUtil;
    }

    private final CategoryService categoryService;
    private final SecurityUtil securityUtil;

    @PostMapping
    @Operation(summary = "Create custom category", description = "Creates a custom user category")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        CategoryResponse response = categoryService.createCategory(userId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get user categories", description = "Retrieves all default system categories and user-defined categories")
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        Long userId = securityUtil.getCurrentUserId();
        List<CategoryResponse> response = categoryService.getCategories(userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete custom category", description = "Deletes user-defined custom category")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        Long userId = securityUtil.getCurrentUserId();
        categoryService.deleteCategory(userId, id);
        return ResponseEntity.noContent().build();
    }
}
