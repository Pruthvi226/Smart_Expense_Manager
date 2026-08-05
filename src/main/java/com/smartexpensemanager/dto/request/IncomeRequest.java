package com.smartexpensemanager.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public class IncomeRequest {
    @NotBlank(message = "Source is required")
    @Size(max = 200, message = "Source cannot exceed 200 characters")
    private String source;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    private BigDecimal amount;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Income date is required")
    private LocalDate incomeDate;

    public IncomeRequest() {}

    public IncomeRequest(String source, BigDecimal amount, String description, LocalDate incomeDate) {
        this.source = source;
        this.amount = amount;
        this.description = description;
        this.incomeDate = incomeDate;
    }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getIncomeDate() { return incomeDate; }
    public void setIncomeDate(LocalDate incomeDate) { this.incomeDate = incomeDate; }

    public static IncomeRequestBuilder builder() { return new IncomeRequestBuilder(); }

    public static class IncomeRequestBuilder {
        private String source;
        private BigDecimal amount;
        private String description;
        private LocalDate incomeDate;

        public IncomeRequestBuilder source(String source) { this.source = source; return this; }
        public IncomeRequestBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
        public IncomeRequestBuilder description(String description) { this.description = description; return this; }
        public IncomeRequestBuilder incomeDate(LocalDate incomeDate) { this.incomeDate = incomeDate; return this; }

        public IncomeRequest build() {
            return new IncomeRequest(source, amount, description, incomeDate);
        }
    }
}
