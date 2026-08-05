package com.smartexpensemanager.dto.response;

public class TokenRefreshResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";

    public TokenRefreshResponse() {}
    public TokenRefreshResponse(String accessToken, String refreshToken, String tokenType) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = tokenType != null ? tokenType : "Bearer";
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public static TokenRefreshResponseBuilder builder() { return new TokenRefreshResponseBuilder(); }
    public static class TokenRefreshResponseBuilder {
        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";

        public TokenRefreshResponseBuilder accessToken(String accessToken) { this.accessToken = accessToken; return this; }
        public TokenRefreshResponseBuilder refreshToken(String refreshToken) { this.refreshToken = refreshToken; return this; }
        public TokenRefreshResponseBuilder tokenType(String tokenType) { this.tokenType = tokenType; return this; }

        public TokenRefreshResponse build() { return new TokenRefreshResponse(accessToken, refreshToken, tokenType); }
    }
}
