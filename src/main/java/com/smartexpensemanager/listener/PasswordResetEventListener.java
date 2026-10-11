package com.smartexpensemanager.listener;

import com.smartexpensemanager.event.PasswordResetRequestedEvent;
import com.smartexpensemanager.service.NotificationService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class PasswordResetEventListener {
    private final NotificationService notifications;

    public PasswordResetEventListener(NotificationService notifications) {
        this.notifications = notifications;
    }

    @Async
    @TransactionalEventListener
    public void sendResetLink(PasswordResetRequestedEvent event) {
        notifications.sendEmailAsync(event.email(), "Reset your Smart Expense Manager password",
                "Use this link within one hour to reset your password:\n" + event.link()
                        + "\nIf you did not request this, ignore this email.");
    }
}
