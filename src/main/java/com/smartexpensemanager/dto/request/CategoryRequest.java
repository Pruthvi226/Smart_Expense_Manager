package com.smartexpensemanager.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CategoryRequest {
    @NotBlank(message = "Category name is required")
    private String name;
    private String type = "EXPENSE";
    private String icon;
    private String color;

    public CategoryRequest() {}
    public CategoryRequest(String name, String type, String icon, String color) {
        this.name = name;
        this.type = type != null ? type : "EXPENSE";
        this.icon = icon;
        this.color = color;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
