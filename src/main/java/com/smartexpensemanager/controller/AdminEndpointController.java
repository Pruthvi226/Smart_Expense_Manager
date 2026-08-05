package com.smartexpensemanager.controller;

import com.smartexpensemanager.dto.response.ApiResponse;
import com.smartexpensemanager.dto.response.PagedResponse;
import com.smartexpensemanager.dto.response.UserResponse;
import com.smartexpensemanager.entity.User;
import com.smartexpensemanager.exception.ResourceNotFoundException;
import com.smartexpensemanager.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/admin", "/api/admin"})
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin Module", description = "Administrative management APIs (Requires ADMIN role)")
public class AdminEndpointController {

    private final UserRepository userRepository;

    public AdminEndpointController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    @Operation(summary = "List all registered users", description = "Paginated list of system users for administration")
    public ResponseEntity<PagedResponse<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> usersPage = userRepository.findAll(pageable);

        PagedResponse<UserResponse> response = PagedResponse.<UserResponse>builder()
                .content(usersPage.getContent().stream().map(u -> UserResponse.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .role(u.getRole().name())
                        .createdAt(u.getCreatedAt())
                        .build()).toList())
                .pageNumber(usersPage.getNumber())
                .pageSize(usersPage.getSize())
                .totalElements(usersPage.getTotalElements())
                .totalPages(usersPage.getTotalPages())
                .last(usersPage.isLast())
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/users/{userId}/unlock")
    @Operation(summary = "Unlock user account", description = "Unlocks a user account that was locked after failed logins")
    public ResponseEntity<ApiResponse> unlockUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setAccountNonLocked(true);
        user.setFailedLoginAttempts(0);
        user.setLockTime(null);
        userRepository.save(user);
        return ResponseEntity.ok(new ApiResponse(true, "User account unlocked successfully"));
    }
}
