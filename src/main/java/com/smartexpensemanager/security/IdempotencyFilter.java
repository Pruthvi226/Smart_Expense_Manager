package com.smartexpensemanager.security;

import com.smartexpensemanager.entity.IdempotencyKey;
import com.smartexpensemanager.exception.IdempotencyException;
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
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
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

        if (keyHeader == null || keyHeader.isBlank()
                || !("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method))) {
            filterChain.doFilter(request, response);
            return;
        }

        Long userId = securityUtil.getCurrentUserIdQuietly();
        if (userId == null) {
            filterChain.doFilter(request, response);
            return;
        }

        if (keyHeader.length() > 128) {
            response.setStatus(400);
            response.setContentType("application/json");
            response.getWriter().write("{\"status\":400,\"message\":\"Idempotency-Key cannot exceed 128 characters\"}");
            return;
        }

        CachedBodyHttpServletRequest wrappedRequest = new CachedBodyHttpServletRequest(request);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);

        String requestHash = idempotencyService.computeHash(
                method + " " + request.getRequestURI() + "?" + request.getQueryString(), wrappedRequest.getCachedBodyAsString());

        Optional<IdempotencyKey> existingKeyOpt = idempotencyService.findKey(userId, keyHeader);
        if (existingKeyOpt.isPresent()) {
            IdempotencyKey existingKey = existingKeyOpt.get();
            if (!requestHash.equals(existingKey.getRequestHash())) {
                response.setStatus(409);
                response.setContentType("application/json");
                response.getWriter().write("{\"status\":409,\"message\":\"Idempotency-Key was already used with a different request\"}");
                return;
            }
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
            String responseBody = new String(wrappedResponse.getContentAsByteArray());
            try {
                idempotencyService.saveKey(userId, keyHeader, requestHash, status, responseBody);
            } catch (Exception e) {
                log.error("Failed to save idempotency key record: {}", e.getMessage());
            }
        }

        wrappedResponse.copyBodyToResponse();
    }
}
