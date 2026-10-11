package com.smartexpensemanager.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.smartexpensemanager.event.ExpenseCreatedEvent;
import com.smartexpensemanager.event.ExpenseDeletedEvent;
import com.smartexpensemanager.event.ExpenseUpdatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class AnalyticsEventListener {

    public AnalyticsEventListener(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    private static final Logger log = LoggerFactory.getLogger(AnalyticsEventListener.class);

    private final CacheManager cacheManager;

    @Async
    @TransactionalEventListener
    public void handleExpenseCreated(ExpenseCreatedEvent event) {
        log.info("Analytics processing ExpenseCreatedEvent for user {}", event.getUserId());
        evictUserCache(event.getUserId());
    }

    @Async
    @TransactionalEventListener
    public void handleExpenseUpdated(ExpenseUpdatedEvent event) {
        log.info("Analytics processing ExpenseUpdatedEvent for user {}", event.getUserId());
        evictUserCache(event.getUserId());
    }

    @Async
    @TransactionalEventListener
    public void handleExpenseDeleted(ExpenseDeletedEvent event) {
        log.info("Analytics processing ExpenseDeletedEvent for user {}", event.getUserId());
        evictUserCache(event.getUserId());
    }

    private void evictUserCache(Long userId) {
        try {
            var dashboard = cacheManager.getCache("dashboard");
            if (dashboard != null) dashboard.evict(userId);
            var analytics = cacheManager.getCache("analytics");
            if (analytics != null) {
                for (int months = 1; months <= 24; months++) analytics.evict(userId + "-" + months);
            }
            log.info("Invalidated Redis dashboard & analytics cache for user {}", userId);
        } catch (Exception e) {
            log.warn("Failed to invalidate Redis cache: {}", e.getMessage());
        }
    }
}
