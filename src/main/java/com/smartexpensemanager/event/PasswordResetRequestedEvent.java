package com.smartexpensemanager.event;

/** Local-only event: never publish password reset links to Kafka or logs. */
public record PasswordResetRequestedEvent(String email, String link) {}
