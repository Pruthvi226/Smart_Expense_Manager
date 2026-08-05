package com.smartexpensemanager.controller;

import com.smartexpensemanager.dto.request.UpdateProfileRequest;
import com.smartexpensemanager.dto.response.ApiResponse;
import com.smartexpensemanager.dto.response.UserResponse;
import com.smartexpensemanager.service.UserService;
import com.smartexpensemanager.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "User", description = "User profile management endpoints")
public class UserController {

    private UserService userService;
    private SecurityUtil securityUtil;

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile() {
        Long userId = securityUtil.getCurrentUserId();
        UserResponse response = userService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        UserResponse response = userService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }
}
