package com.smartexpensemanager.event;

import java.io.Serializable;

public class UserRegisteredEvent implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long userId;
    private String name;
    private String email;

    public UserRegisteredEvent() {}

    public UserRegisteredEvent(Long userId, String name, String email) {
        this.userId = userId;
        this.name = name;
        this.email = email;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
