package com.smartexpensemanager.dto.response;


import java.time.LocalDateTime;

public class PasswordResetResponse {
    private Boolean resetLinkAvailable;
    private String resetUrl;
    private LocalDateTime expiresAt;
}
