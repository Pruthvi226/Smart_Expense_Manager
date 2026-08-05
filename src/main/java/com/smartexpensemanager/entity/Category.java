package com.smartexpensemanager.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type = "EXPENSE";

    @Column(length = 50)
    private String icon;

    @Column(length = 20)
    private String color;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Category() {}

    public Category(Long id, String name, String type, String icon, String color, Boolean isDefault, User user, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.type = type != null ? type : "EXPENSE";
        this.icon = icon;
        this.color = color;
        this.isDefault = isDefault != null ? isDefault : false;
        this.user = user;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static CategoryBuilder builder() { return new CategoryBuilder(); }

    public static class CategoryBuilder {
        private Long id;
        private String name;
        private String type = "EXPENSE";
        private String icon;
        private String color;
        private Boolean isDefault = false;
        private User user;
        private LocalDateTime createdAt = LocalDateTime.now();

        public CategoryBuilder id(Long id) { this.id = id; return this; }
        public CategoryBuilder name(String name) { this.name = name; return this; }
        public CategoryBuilder type(String type) { this.type = type; return this; }
        public CategoryBuilder icon(String icon) { this.icon = icon; return this; }
        public CategoryBuilder color(String color) { this.color = color; return this; }
        public CategoryBuilder isDefault(Boolean isDefault) { this.isDefault = isDefault; return this; }
        public CategoryBuilder user(User user) { this.user = user; return this; }
        public CategoryBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Category build() {
            return new Category(id, name, type, icon, color, isDefault, user, createdAt);
        }
    }
}
