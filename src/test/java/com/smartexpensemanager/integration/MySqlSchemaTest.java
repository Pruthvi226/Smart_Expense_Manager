package com.smartexpensemanager.integration;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import static org.assertj.core.api.Assertions.assertThat;

/** CI supplies a disposable MySQL instance; production profile runs Flyway then Hibernate validate. */
@SpringBootTest(properties = {
        "management.health.mail.enabled=false",
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration"
})
@ActiveProfiles("prod")
@EnabledIfEnvironmentVariable(named = "RUN_MYSQL_SCHEMA_TESTS", matches = "true")
class MySqlSchemaTest {
    @Autowired Flyway flyway;
    @MockBean JavaMailSender mail;

    @Test void versionedSchemaMigratesAndMatchesEntityMappings() {
        assertThat(flyway.info().applied()).hasSize(2);
        assertThat(flyway.info().pending()).isEmpty();
    }
}
