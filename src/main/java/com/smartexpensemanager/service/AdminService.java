package com.smartexpensemanager.service;

import com.smartexpensemanager.dto.response.UserResponse;
import java.util.List;

public interface AdminService {
    List<UserResponse> getAllUsers();
    List<UserResponse> getUserTransactionSummary();
}
