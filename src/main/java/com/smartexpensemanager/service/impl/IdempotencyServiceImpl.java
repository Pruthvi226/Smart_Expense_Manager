package com.smartexpensemanager.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.smartexpensemanager.entity.IdempotencyKey;
import com.smartexpensemanager.repository.IdempotencyKeyRepository;
import com.smartexpensemanager.service.IdempotencyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class IdempotencyServiceImpl implements IdempotencyService {

    public IdempotencyServiceImpl(IdempotencyKeyRepository idempotencyKeyRepository) {
        this.idempotencyKeyRepository = idempotencyKeyRepository;
    }

    private static final Logger log = LoggerFactory.getLogger(IdempotencyServiceImpl.class);

    private final IdempotencyKeyRepository idempotencyKeyRepository;

    @Override
    @Transactional(readOnly = true)
    public Optional<IdempotencyKey> findKey(Long userId, String idempotencyKey) {
        return idempotencyKeyRepository.findByUserIdAndIdempotencyKey(userId, idempotencyKey)
                .filter(key -> key.getExpiresAt().isAfter(LocalDateTime.now()));
    }

    @Override
    @Transactional
    public IdempotencyKey saveKey(Long userId, String idempotencyKey, String requestHash, int status, String responseBody) {
        IdempotencyKey record = IdempotencyKey.builder()
                .userId(userId)
                .idempotencyKey(idempotencyKey)
                .requestHash(requestHash)
                .responseStatus(status)
                .responseBody(responseBody)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();
        return idempotencyKeyRepository.save(record);
    }

    @Override
    public String computeHash(String path, String payload) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String input = path + ":" + (payload != null ? payload : "");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm unavailable", e);
        }
    }
}
