package com.smartexpensemanager.controller;

import com.smartexpensemanager.dto.response.PagedResponse;
import com.smartexpensemanager.entity.Notification;
import com.smartexpensemanager.service.NotificationService;
import com.smartexpensemanager.util.SecurityUtil;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications")
public class NotificationController {
    private final NotificationService notifications;
    private final SecurityUtil security;

    public NotificationController(NotificationService notifications, SecurityUtil security) {
        this.notifications = notifications;
        this.security = security;
    }

    @GetMapping
    public PagedResponse<Notification> list(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size) {
        return notifications.getUserNotifications(security.getCurrentUserId(),
                PageRequest.of(Math.max(0, page), Math.min(100, Math.max(1, size))));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notifications.markAsRead(id, security.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }
}
