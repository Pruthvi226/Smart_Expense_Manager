package com.smartexpensemanager.dto.response;

public class CategoryResponse {
    private Long id;
    private String name;
    private String type;
    private String icon;
    private String color;
    private Boolean isDefault;
    private Long userId;

    public CategoryResponse() {}
    public CategoryResponse(Long id, String name, String type, String icon, String color, Boolean isDefault, Long userId) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.icon = icon;
        this.color = color;
        this.isDefault = isDefault;
        this.userId = userId;
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
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public static CategoryResponseBuilder builder() { return new CategoryResponseBuilder(); }
    public static class CategoryResponseBuilder {
        private Long id;
        private String name;
        private String type;
        private String icon;
        private String color;
        private Boolean isDefault;
        private Long userId;

        public CategoryResponseBuilder id(Long id) { this.id = id; return this; }
        public CategoryResponseBuilder name(String name) { this.name = name; return this; }
        public CategoryResponseBuilder type(String type) { this.type = type; return this; }
        public CategoryResponseBuilder icon(String icon) { this.icon = icon; return this; }
        public CategoryResponseBuilder color(String color) { this.color = color; return this; }
        public CategoryResponseBuilder isDefault(Boolean isDefault) { this.isDefault = isDefault; return this; }
        public CategoryResponseBuilder userId(Long userId) { this.userId = userId; return this; }

        public CategoryResponse build() { return new CategoryResponse(id, name, type, icon, color, isDefault, userId); }
    }
}
