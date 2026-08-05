package com.smartexpensemanager.service;

import com.smartexpensemanager.dto.request.UpdateProfileRequest;
import com.smartexpensemanager.dto.response.UserResponse;

public interface UserService {
    UserResponse getProfile(Long userId);
    UserResponse updateProfile(Long userId, UpdateProfileRequest request);
}
