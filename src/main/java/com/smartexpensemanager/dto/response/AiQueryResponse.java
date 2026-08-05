package com.smartexpensemanager.dto.response;

import java.util.List;

public class AiQueryResponse {
    private String query;
    private String answer;
    private String category;
    private Double totalSpent;
    private List<ExpenseResponse> matchingExpenses;

    public AiQueryResponse() {}

    public AiQueryResponse(String query, String answer, String category, Double totalSpent, List<ExpenseResponse> matchingExpenses) {
        this.query = query;
        this.answer = answer;
        this.category = category;
        this.totalSpent = totalSpent;
        this.matchingExpenses = matchingExpenses;
    }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getTotalSpent() { return totalSpent; }
    public void setTotalSpent(Double totalSpent) { this.totalSpent = totalSpent; }

    public List<ExpenseResponse> getMatchingExpenses() { return matchingExpenses; }
    public void setMatchingExpenses(List<ExpenseResponse> matchingExpenses) { this.matchingExpenses = matchingExpenses; }

    public static AiQueryResponseBuilder builder() { return new AiQueryResponseBuilder(); }

    public static class AiQueryResponseBuilder {
        private String query;
        private String answer;
        private String category;
        private Double totalSpent;
        private List<ExpenseResponse> matchingExpenses;

        public AiQueryResponseBuilder query(String query) { this.query = query; return this; }
        public AiQueryResponseBuilder answer(String answer) { this.answer = answer; return this; }
        public AiQueryResponseBuilder category(String category) { this.category = category; return this; }
        public AiQueryResponseBuilder totalSpent(Double totalSpent) { this.totalSpent = totalSpent; return this; }
        public AiQueryResponseBuilder matchingExpenses(List<ExpenseResponse> matchingExpenses) { this.matchingExpenses = matchingExpenses; return this; }

        public AiQueryResponse build() {
            return new AiQueryResponse(query, answer, category, totalSpent, matchingExpenses);
        }
    }
}
