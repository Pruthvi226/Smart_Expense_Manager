package com.smartexpensemanager.service;

import com.smartexpensemanager.entity.RefreshToken;
import com.smartexpensemanager.entity.User;
import java.util.Optional;

public interface RefreshTokenService {
    Optional<RefreshToken> findByToken(String token);
    RefreshToken createRefreshToken(Long userId);
    RefreshToken verifyExpiration(RefreshToken token);
    int deleteByUserId(Long userId);
}
