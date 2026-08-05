package com.smartexpensemanager.service;

import com.smartexpensemanager.entity.IdempotencyKey;
import java.util.Optional;

public interface IdempotencyService {
    Optional<IdempotencyKey> findKey(Long userId, String idempotencyKey);
    IdempotencyKey saveKey(Long userId, String idempotencyKey, String requestHash, int status, String responseBody);
    String computeHash(String path, String payload);
}
