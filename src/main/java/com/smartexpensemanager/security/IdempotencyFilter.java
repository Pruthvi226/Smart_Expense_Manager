package com.smartexpensemanager.security;

import com.smartexpensemanager.entity.IdempotencyKey;
import com.smartexpensemanager.service.IdempotencyService;
import com.smartexpensemanager.util.SecurityUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
public class IdempotencyFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(IdempotencyFilter.class);
    public static final String IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";

    private final IdempotencyService idempotencyService;
    private final SecurityUtil securityUtil;

    public IdempotencyFilter(IdempotencyService idempotencyService, SecurityUtil securityUtil) {
        this.idempotencyService = idempotencyService;
        this.securityUtil = securityUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String keyHeader = request.getHeader(IDEMPOTENCY_KEY_HEADER);
        String method = request.getMethod();

        if (keyHeader == null || keyHeader.isBlank() || !("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method))) {
            filterChain.doFilter(request, response);
            return;
        }

        Long userId = securityUtil.getCurrentUserIdQuietly();
        if (userId == null) {
            filterChain.doFilter(request, response);
            return;
        }

        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);

        String requestBody = new String(wrappedRequest.getContentAsByteArray(), StandardCharsets.UTF_8);
        String requestHash = idempotencyService.computeHash(request.getRequestURI(), requestBody);

        Optional<IdempotencyKey> existingKeyOpt = idempotencyService.findKey(userId, keyHeader);
        if (existingKeyOpt.isPresent()) {
            IdempotencyKey existingKey = existingKeyOpt.get();
            log.info("Duplicate request detected with Idempotency-Key: {}. Returning cached response.", keyHeader);
            response.setStatus(existingKey.getResponseStatus());
            response.setContentType("application/json");
            if (existingKey.getResponseBody() != null) {
                response.getWriter().write(existingKey.getResponseBody());
            }
            return;
        }

        filterChain.doFilter(wrappedRequest, wrappedResponse);

        int status = wrappedResponse.getStatus();
        if (status >= 200 && status < 300) {
            byte[] responseArray = wrappedResponse.getContentAsByteArray();
            String responseBody = new String(responseArray, StandardCharsets.UTF_8);
            try {
                idempotencyService.saveKey(userId, keyHeader, requestHash, status, responseBody);
            } catch (Exception e) {
                log.error("Failed to save idempotency key record: {}", e.getMessage());
            }
        }

        wrappedResponse.copyBodyToResponse();
    }
}
