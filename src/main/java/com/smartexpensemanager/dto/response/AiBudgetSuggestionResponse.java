package com.smartexpensemanager.dto.response;

import java.math.BigDecimal;
import java.util.List;

public class AiBudgetSuggestionResponse {
    private BigDecimal targetMonthlySavings;
    private List<SuggestionItem> suggestions;

    public AiBudgetSuggestionResponse() {}

    public AiBudgetSuggestionResponse(BigDecimal targetMonthlySavings, List<SuggestionItem> suggestions) {
        this.targetMonthlySavings = targetMonthlySavings;
        this.suggestions = suggestions;
    }

    public BigDecimal getTargetMonthlySavings() { return targetMonthlySavings; }
    public void setTargetMonthlySavings(BigDecimal targetMonthlySavings) { this.targetMonthlySavings = targetMonthlySavings; }

    public List<SuggestionItem> getSuggestions() { return suggestions; }
    public void setSuggestions(List<SuggestionItem> suggestions) { this.suggestions = suggestions; }

    public static AiBudgetSuggestionResponseBuilder builder() { return new AiBudgetSuggestionResponseBuilder(); }

    public static class AiBudgetSuggestionResponseBuilder {
        private BigDecimal targetMonthlySavings;
        private List<SuggestionItem> suggestions;

        public AiBudgetSuggestionResponseBuilder targetMonthlySavings(BigDecimal targetMonthlySavings) { this.targetMonthlySavings = targetMonthlySavings; return this; }
        public AiBudgetSuggestionResponseBuilder suggestions(List<SuggestionItem> suggestions) { this.suggestions = suggestions; return this; }

        public AiBudgetSuggestionResponse build() {
            return new AiBudgetSuggestionResponse(targetMonthlySavings, suggestions);
        }
    }

    public static class SuggestionItem {
        private String category;
        private BigDecimal currentSpending;
        private BigDecimal suggestedLimit;
        private BigDecimal potentialSavings;
        private String rationale;

        public SuggestionItem() {}

        public SuggestionItem(String category, BigDecimal currentSpending, BigDecimal suggestedLimit, BigDecimal potentialSavings, String rationale) {
            this.category = category;
            this.currentSpending = currentSpending;
            this.suggestedLimit = suggestedLimit;
            this.potentialSavings = potentialSavings;
            this.rationale = rationale;
        }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public BigDecimal getCurrentSpending() { return currentSpending; }
        public void setCurrentSpending(BigDecimal currentSpending) { this.currentSpending = currentSpending; }

        public BigDecimal getSuggestedLimit() { return suggestedLimit; }
        public void setSuggestedLimit(BigDecimal suggestedLimit) { this.suggestedLimit = suggestedLimit; }

        public BigDecimal getPotentialSavings() { return potentialSavings; }
        public void setPotentialSavings(BigDecimal potentialSavings) { this.potentialSavings = potentialSavings; }

        public String getRationale() { return rationale; }
        public void setRationale(String rationale) { this.rationale = rationale; }
    }
}
