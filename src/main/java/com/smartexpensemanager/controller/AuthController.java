package com.smartexpensemanager.controller;

import com.smartexpensemanager.dto.request.*;
import com.smartexpensemanager.dto.response.ApiResponse;
import com.smartexpensemanager.dto.response.AuthResponse;
import com.smartexpensemanager.dto.response.TokenRefreshResponse;
import com.smartexpensemanager.service.AuthService;
import com.smartexpensemanager.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/auth", "/api/auth"})
@Tag(name = "Authentication Module", description = "User registration, login, JWT token refresh, logout, and password recovery endpoints")
public class AuthController {

    public AuthController(AuthService authService, SecurityUtil securityUtil) {
        this.authService = authService;
        this.securityUtil = securityUtil;
    }

    private final AuthService authService;
    private final SecurityUtil securityUtil;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account with BCrypt encoded password and returns JWT access & refresh tokens")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticates user credentials and returns JWT access & refresh tokens. Locks account after 5 failed attempts.")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Rotates refresh token and generates a fresh JWT access token")
    public ResponseEntity<TokenRefreshResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        TokenRefreshResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Revokes current refresh token and logs out the user")
    public ResponseEntity<ApiResponse> logout() {
        Long userId = securityUtil.getCurrentUserId();
        ApiResponse response = authService.logout(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset token", description = "Generates password reset token and dispatches reset instructions")
    public ResponseEntity<ApiResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        ApiResponse response = authService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using token", description = "Resets user password with valid reset token")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        ApiResponse response = authService.resetPassword(request);
        return ResponseEntity.ok(response);
    }
}
