package com.smartexpensemanager.service;

import com.smartexpensemanager.dto.response.PagedResponse;
import com.smartexpensemanager.entity.Notification;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    void sendEmailAsync(String to, String subject, String body);
    PagedResponse<Notification> getUserNotifications(Long userId, Pageable pageable);
    void markAsRead(Long notificationId, Long userId);
}
