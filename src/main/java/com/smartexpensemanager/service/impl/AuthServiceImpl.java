package com.smartexpensemanager.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.smartexpensemanager.dto.request.*;
import com.smartexpensemanager.dto.response.*;
import com.smartexpensemanager.entity.RefreshToken;
import com.smartexpensemanager.entity.User;
import com.smartexpensemanager.event.UserRegisteredEvent;
import com.smartexpensemanager.exception.DuplicateEmailException;
import com.smartexpensemanager.exception.InvalidCredentialsException;
import com.smartexpensemanager.exception.ResourceNotFoundException;
import com.smartexpensemanager.exception.TokenRefreshException;
import com.smartexpensemanager.kafka.KafkaProducerService;
import com.smartexpensemanager.repository.UserRepository;
import com.smartexpensemanager.security.JwtTokenProvider;
import com.smartexpensemanager.service.AuthService;
import com.smartexpensemanager.service.RefreshTokenService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider, RefreshTokenService refreshTokenService, KafkaProducerService kafkaProducerService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenService = refreshTokenService;
        this.kafkaProducerService = kafkaProducerService;
    }

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final KafkaProducerService kafkaProducerService;

    private static final int MAX_FAILED_ATTEMPTS = 5;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email is already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .failedLoginAttempts(0)
                .accountNonLocked(true)
                .build();

        User savedUser = userRepository.save(user);

        kafkaProducerService.publishUserRegistered(new UserRegisteredEvent(
                savedUser.getId(), savedUser.getName(), savedUser.getEmail()));

        String accessToken = jwtTokenProvider.generateTokenFromUserId(savedUser.getId(), savedUser.getEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser.getId());

        UserResponse userResponse = UserResponse.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .createdAt(savedUser.getCreatedAt())
                .build();

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken.getToken())
                .user(userResponse)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (Boolean.FALSE.equals(user.getAccountNonLocked())) {
            if (user.getLockTime() != null && user.getLockTime().plusMinutes(15).isBefore(LocalDateTime.now())) {
                user.setAccountNonLocked(true);
                user.setFailedLoginAttempts(0);
                user.setLockTime(null);
            } else {
                throw new InvalidCredentialsException("Account is locked due to 5 failed login attempts. Please try again after 15 minutes.");
            }
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            int newAttempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(newAttempts);
            if (newAttempts >= MAX_FAILED_ATTEMPTS) {
                user.setAccountNonLocked(false);
                user.setLockTime(LocalDateTime.now());
                log.warn("Account locked for user: {}", user.getEmail());
            }
            userRepository.save(user);
            throw new InvalidCredentialsException("Invalid email or password");
        }

        user.setFailedLoginAttempts(0);
        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateTokenFromUserId(user.getId(), user.getEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken.getToken())
                .user(userResponse)
                .build();
    }

    @Override
    @Transactional
    public TokenRefreshResponse refreshToken(RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String accessToken = jwtTokenProvider.generateTokenFromUserId(user.getId(), user.getEmail());
                    RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId());
                    return TokenRefreshResponse.builder()
                            .accessToken(accessToken)
                            .refreshToken(newRefreshToken.getToken())
                            .tokenType("Bearer")
                            .build();
                })
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken, "Refresh token is not in database!"));
    }

    @Override
    @Transactional
    public ApiResponse logout(Long userId) {
        refreshTokenService.deleteByUserId(userId);
        return new ApiResponse(true, "User logged out successfully");
    }

    @Override
    @Transactional
    public ApiResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiresAt(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        log.info("Generated password reset token for user {}: {}", user.getEmail(), token);
        return new ApiResponse(true, "Password reset token sent. Check logs/email.");
    }

    @Override
    @Transactional
    public ApiResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetPasswordToken(request.getToken())
                .orElseThrow(() -> new ResourceNotFoundException("Reset token", "token", request.getToken()));

        if (user.getResetPasswordTokenExpiresAt() == null || user.getResetPasswordTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiresAt(null);
        userRepository.save(user);

        return new ApiResponse(true, "Password reset successfully. You may now login.");
    }
}
