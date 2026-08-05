package com.smartexpensemanager.service.impl;

import com.smartexpensemanager.dto.request.UpdateProfileRequest;
import com.smartexpensemanager.dto.response.UserResponse;
import com.smartexpensemanager.entity.User;
import com.smartexpensemanager.exception.DuplicateEmailException;
import com.smartexpensemanager.exception.ResourceNotFoundException;
import com.smartexpensemanager.repository.UserRepository;
import com.smartexpensemanager.service.UserService;
import com.smartexpensemanager.util.SecurityUtil;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;

    public UserServiceImpl(UserRepository userRepository, SecurityUtil securityUtil) {
        this.userRepository = userRepository;
        this.securityUtil = securityUtil;
    }

    @Override
    public UserResponse getProfile(Long userId) {
        securityUtil.validateUserAccess(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToUserResponse(user);
    }

    @Override
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        securityUtil.validateUserAccess(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getEmail().equals(request.getEmail()) && 
            userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email already exists");
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        User updatedUser = userRepository.save(user);
        return mapToUserResponse(updatedUser);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().toString())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
