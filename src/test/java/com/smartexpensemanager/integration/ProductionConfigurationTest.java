package com.smartexpensemanager.integration;

import org.junit.jupiter.api.Test;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThat;

class ProductionConfigurationTest {
    private MockEnvironment productionEnvironment() throws Exception {
        MockEnvironment environment = new MockEnvironment();
        new YamlPropertySourceLoader().load("production", new ClassPathResource("application-prod.yml"))
                .forEach(source -> environment.getPropertySources().addLast(source));
        return environment;
    }

    @Test void primarySigningSecretDoesNotRequireTheAlternativeVariable() throws Exception {
        MockEnvironment environment = productionEnvironment().withProperty("JWT_SECRET", "primary-secret");
        assertThat(environment.getProperty("app.jwtSecret")).isEqualTo("primary-secret");
    }

    @Test void alternativeSigningSecretIsSupportedAndMissingSecretRemainsEmpty() throws Exception {
        assertThat(productionEnvironment().withProperty("APP_JWT_SECRET", "alternative-secret")
                .getProperty("app.jwtSecret")).isEqualTo("alternative-secret");
        // JwtTokenProvider rejects this empty value during initialization.
        assertThat(productionEnvironment().getProperty("app.jwtSecret")).isEmpty();
    }
}
