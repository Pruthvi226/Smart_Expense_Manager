package com.smartexpensemanager.util;

import com.smartexpensemanager.entity.User;
import com.smartexpensemanager.exception.UnauthorizedException;
import com.smartexpensemanager.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtil {

    public UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) authentication.getPrincipal();
        }
        throw new UnauthorizedException("User not authenticated");
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public Long getCurrentUserIdQuietly() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof UserPrincipal principal) {
                return principal.getId();
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    public void validateUserAccess(User user) {
        UserPrincipal currentUser = getCurrentUser();
        if (!currentUser.getId().equals(user.getId())) {
            throw new UnauthorizedException("You don't have permission to access this resource");
        }
    }

    public void validateUserAccess(Long userId) {
        UserPrincipal currentUser = getCurrentUser();
        if (!currentUser.getId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to access this resource");
        }
    }

    public boolean isAdmin() {
        return getCurrentUser().getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
    }
}
