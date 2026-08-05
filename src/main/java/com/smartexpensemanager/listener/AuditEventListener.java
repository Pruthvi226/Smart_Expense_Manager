package com.smartexpensemanager.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.smartexpensemanager.entity.AuditLog;
import com.smartexpensemanager.event.ExpenseCreatedEvent;
import com.smartexpensemanager.event.ExpenseDeletedEvent;
import com.smartexpensemanager.event.ExpenseUpdatedEvent;
import com.smartexpensemanager.event.UserRegisteredEvent;
import com.smartexpensemanager.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.MDC;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class AuditEventListener {

    public AuditEventListener(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    private static final Logger log = LoggerFactory.getLogger(AuditEventListener.class);

    private final AuditLogRepository auditLogRepository;

    @Async
    @EventListener
    public void handleExpenseCreated(ExpenseCreatedEvent event) {
        saveAudit("EXPENSE_CREATED", "Expense", event.getExpenseId(), event.getUserId(),
                "Title: " + event.getTitle() + ", Amount: " + event.getAmount());
    }

    @Async
    @EventListener
    public void handleExpenseUpdated(ExpenseUpdatedEvent event) {
        saveAudit("EXPENSE_UPDATED", "Expense", event.getExpenseId(), event.getUserId(),
                "OldAmount: " + event.getOldAmount() + ", NewAmount: " + event.getNewAmount());
    }

    @Async
    @EventListener
    public void handleExpenseDeleted(ExpenseDeletedEvent event) {
        saveAudit("EXPENSE_DELETED", "Expense", event.getExpenseId(), event.getUserId(),
                "Amount: " + event.getAmount());
    }

    @Async
    @EventListener
    public void handleUserRegistered(UserRegisteredEvent event) {
        saveAudit("USER_REGISTERED", "User", event.getUserId(), event.getUserId(),
                "Email: " + event.getEmail());
    }

    private void saveAudit(String action, String entityName, Long entityId, Long userId, String details) {
        try {
            String correlationId = MDC.get("correlationId");
            auditLogRepository.save(AuditLog.builder()
                    .action(action)
                    .entityName(entityName)
                    .entityId(entityId)
                    .userId(userId)
                    .details(details)
                    .correlationId(correlationId)
                    .build());
        } catch (Exception e) {
            log.error("Failed to persist audit log: {}", e.getMessage());
        }
    }
}
