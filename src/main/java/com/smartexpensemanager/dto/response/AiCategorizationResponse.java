package com.smartexpensemanager.dto.response;

public class AiCategorizationResponse {
    private String merchantOrTitle;
    private String suggestedCategory;
    private Double confidenceScore;

    public AiCategorizationResponse() {}

    public AiCategorizationResponse(String merchantOrTitle, String suggestedCategory, Double confidenceScore) {
        this.merchantOrTitle = merchantOrTitle;
        this.suggestedCategory = suggestedCategory;
        this.confidenceScore = confidenceScore;
    }

    public String getMerchantOrTitle() { return merchantOrTitle; }
    public void setMerchantOrTitle(String merchantOrTitle) { this.merchantOrTitle = merchantOrTitle; }
    public String getSuggestedCategory() { return suggestedCategory; }
    public void setSuggestedCategory(String suggestedCategory) { this.suggestedCategory = suggestedCategory; }
    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public static AiCategorizationResponseBuilder builder() { return new AiCategorizationResponseBuilder(); }

    public static class AiCategorizationResponseBuilder {
        private String merchantOrTitle;
        private String suggestedCategory;
        private Double confidenceScore;

        public AiCategorizationResponseBuilder merchantOrTitle(String merchantOrTitle) { this.merchantOrTitle = merchantOrTitle; return this; }
        public AiCategorizationResponseBuilder suggestedCategory(String suggestedCategory) { this.suggestedCategory = suggestedCategory; return this; }
        public AiCategorizationResponseBuilder confidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; return this; }

        public AiCategorizationResponse build() {
            return new AiCategorizationResponse(merchantOrTitle, suggestedCategory, confidenceScore);
        }
    }
}
