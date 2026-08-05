package com.smartexpensemanager.dto.response;

import java.util.List;

public class AiSummaryResponse {
    private String executiveSummary;
    private List<String> keyInsights;
    private List<String> budgetAlerts;
    private List<String> recommendations;

    public AiSummaryResponse() {}

    public AiSummaryResponse(String executiveSummary, List<String> keyInsights, List<String> budgetAlerts, List<String> recommendations) {
        this.executiveSummary = executiveSummary;
        this.keyInsights = keyInsights;
        this.budgetAlerts = budgetAlerts;
        this.recommendations = recommendations;
    }

    public String getExecutiveSummary() { return executiveSummary; }
    public void setExecutiveSummary(String executiveSummary) { this.executiveSummary = executiveSummary; }

    public List<String> getKeyInsights() { return keyInsights; }
    public void setKeyInsights(List<String> keyInsights) { this.keyInsights = keyInsights; }

    public List<String> getBudgetAlerts() { return budgetAlerts; }
    public void setBudgetAlerts(List<String> budgetAlerts) { this.budgetAlerts = budgetAlerts; }

    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }

    public static AiSummaryResponseBuilder builder() { return new AiSummaryResponseBuilder(); }

    public static class AiSummaryResponseBuilder {
        private String executiveSummary;
        private List<String> keyInsights;
        private List<String> budgetAlerts;
        private List<String> recommendations;

        public AiSummaryResponseBuilder executiveSummary(String executiveSummary) { this.executiveSummary = executiveSummary; return this; }
        public AiSummaryResponseBuilder keyInsights(List<String> keyInsights) { this.keyInsights = keyInsights; return this; }
        public AiSummaryResponseBuilder budgetAlerts(List<String> budgetAlerts) { this.budgetAlerts = budgetAlerts; return this; }
        public AiSummaryResponseBuilder recommendations(List<String> recommendations) { this.recommendations = recommendations; return this; }

        public AiSummaryResponse build() {
            return new AiSummaryResponse(executiveSummary, keyInsights, budgetAlerts, recommendations);
        }
    }
}
