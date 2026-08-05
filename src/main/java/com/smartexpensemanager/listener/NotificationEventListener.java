package com.smartexpensemanager.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.smartexpensemanager.entity.Notification;
import com.smartexpensemanager.event.BudgetExceededEvent;
import com.smartexpensemanager.event.ExpenseCreatedEvent;
import com.smartexpensemanager.event.UserRegisteredEvent;
import com.smartexpensemanager.repository.NotificationRepository;
import com.smartexpensemanager.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventListener {

    public NotificationEventListener(NotificationRepository notificationRepository, NotificationService notificationService) {
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
    }

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);

    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    @Async
    @EventListener
    public void handleBudgetExceeded(BudgetExceededEvent event) {
        log.warn("BudgetExceededEvent triggered for user {} in category {}", event.getUserId(), event.getCategory());
        
        String title = "Budget Exceeded Alert: " + event.getCategory();
        String message = String.format("Your spending in %s (₹%.2f) has exceeded your limit of ₹%.2f for %d/%d.",
                event.getCategory(), event.getSpentAmount(), event.getLimitAmount(), event.getMonth(), event.getYear());

        notificationRepository.save(Notification.builder()
                .userId(event.getUserId())
                .title(title)
                .message(message)
                .type("BUDGET_ALERT")
                .isRead(false)
                .build());

        notificationService.sendEmailAsync(event.getUserEmail(), title, message);
    }

    @Async
    @EventListener
    public void handleExpenseCreated(ExpenseCreatedEvent event) {
        if (event.getAmount() != null && event.getAmount() >= 5000.0) {
            String title = "Large Expense Recorded";
            String message = String.format("A large expense of ₹%.2f ('%s') was added to category '%s'.",
                    event.getAmount(), event.getTitle(), event.getCategory());

            notificationRepository.save(Notification.builder()
                    .userId(event.getUserId())
                    .title(title)
                    .message(message)
                    .type("LARGE_EXPENSE")
                    .isRead(false)
                    .build());
        }
    }

    @Async
    @EventListener
    public void handleUserRegistered(UserRegisteredEvent event) {
        String title = "Welcome to Smart Expense Manager V2!";
        String message = "Hello " + event.getName() + ", welcome to Smart Expense Manager V2. Start by creating budgets and logging your expenses.";

        notificationRepository.save(Notification.builder()
                .userId(event.getUserId())
                .title(title)
                .message(message)
                .type("WELCOME")
                .isRead(false)
                .build());

        notificationService.sendEmailAsync(event.getEmail(), title, message);
    }
}
