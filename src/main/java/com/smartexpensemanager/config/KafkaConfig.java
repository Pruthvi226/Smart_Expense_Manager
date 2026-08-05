package com.smartexpensemanager.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
@ConditionalOnClass(name = "org.springframework.kafka.core.KafkaTemplate")
@ConditionalOnProperty(name = "spring.kafka.enabled", havingValue = "true", matchIfMissing = false)
@EnableKafka
public class KafkaConfig {

    public static final String TOPIC_EXPENSE_EVENTS = "expense-events";
    public static final String TOPIC_BUDGET_EVENTS = "budget-events";
    public static final String TOPIC_USER_EVENTS = "user-events";
    public static final String TOPIC_NOTIFICATION_EVENTS = "notification-events";
    public static final String TOPIC_AUDIT_EVENTS = "audit-events";

    @Bean
    public NewTopic expenseEventsTopic() {
        return TopicBuilder.name(TOPIC_EXPENSE_EVENTS)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic budgetEventsTopic() {
        return TopicBuilder.name(TOPIC_BUDGET_EVENTS)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic userEventsTopic() {
        return TopicBuilder.name(TOPIC_USER_EVENTS)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic notificationEventsTopic() {
        return TopicBuilder.name(TOPIC_NOTIFICATION_EVENTS)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic auditEventsTopic() {
        return TopicBuilder.name(TOPIC_AUDIT_EVENTS)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
