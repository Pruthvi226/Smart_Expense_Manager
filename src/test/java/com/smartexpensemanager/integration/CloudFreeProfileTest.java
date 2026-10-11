package com.smartexpensemanager.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.ApplicationContext;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:cloudprofile;DB_CLOSE_DELAY=-1;NON_KEYWORDS=MONTH,YEAR",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop", "spring.flyway.enabled=false",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "app.jwtSecret=CloudFreeProfileTestOnlySigningKeyMustBeAtLeast64BytesLong12345678901234567890",
        "app.public-base-url=http://localhost:10000"
})
@ActiveProfiles({"prod", "cloud-free"})
@AutoConfigureMockMvc
class CloudFreeProfileTest {
    @Autowired ApplicationContext context;
    @Autowired CacheManager cache;
    @Autowired MockMvc mvc;

    @Test void publicPortfolioRuntimeNeedsNoRedisOrKafka() throws Exception {
        assertThat(cache).isInstanceOf(ConcurrentMapCacheManager.class);
        assertThat(context.getBeansOfType(RedisTemplate.class)).isEmpty();
        assertThat(context.getBeansOfType(KafkaTemplate.class)).isEmpty();
        mvc.perform(get("/actuator/health/readiness")).andExpect(status().isOk())
                .andExpect(jsonPath("status").value("UP"));
    }
}
