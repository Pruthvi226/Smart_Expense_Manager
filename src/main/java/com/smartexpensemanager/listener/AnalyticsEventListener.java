package com.smartexpensemanager.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.smartexpensemanager.event.ExpenseCreatedEvent;
import com.smartexpensemanager.event.ExpenseDeletedEvent;
import com.smartexpensemanager.event.ExpenseUpdatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class AnalyticsEventListener {

    public AnalyticsEventListener(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    private static final Logger log = LoggerFactory.getLogger(AnalyticsEventListener.class);

    private final RedisTemplate<String, Object> redisTemplate;

    @Async
    @EventListener
    public void handleExpenseCreated(ExpenseCreatedEvent event) {
        log.info("Analytics processing ExpenseCreatedEvent for user {}", event.getUserId());
        evictUserCache(event.getUserId());
    }

    @Async
    @EventListener
    public void handleExpenseUpdated(ExpenseUpdatedEvent event) {
        log.info("Analytics processing ExpenseUpdatedEvent for user {}", event.getUserId());
        evictUserCache(event.getUserId());
    }

    @Async
    @EventListener
    public void handleExpenseDeleted(ExpenseDeletedEvent event) {
        log.info("Analytics processing ExpenseDeletedEvent for user {}", event.getUserId());
        evictUserCache(event.getUserId());
    }

    private void evictUserCache(Long userId) {
        try {
            redisTemplate.delete("dashboard::" + userId);
            redisTemplate.delete("analytics::" + userId);
            log.info("Invalidated Redis dashboard & analytics cache for user {}", userId);
        } catch (Exception e) {
            log.warn("Failed to invalidate Redis cache: {}", e.getMessage());
        }
    }
}
