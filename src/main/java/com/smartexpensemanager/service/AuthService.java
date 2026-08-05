package com.smartexpensemanager.service;

import com.smartexpensemanager.dto.request.ForgotPasswordRequest;
import com.smartexpensemanager.dto.request.LoginRequest;
import com.smartexpensemanager.dto.request.RefreshTokenRequest;
import com.smartexpensemanager.dto.request.RegisterRequest;
import com.smartexpensemanager.dto.request.ResetPasswordRequest;
import com.smartexpensemanager.dto.response.ApiResponse;
import com.smartexpensemanager.dto.response.AuthResponse;
import com.smartexpensemanager.dto.response.TokenRefreshResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    TokenRefreshResponse refreshToken(RefreshTokenRequest request);
    ApiResponse logout(Long userId);
    ApiResponse forgotPassword(ForgotPasswordRequest request);
    ApiResponse resetPassword(ResetPasswordRequest request);
}
