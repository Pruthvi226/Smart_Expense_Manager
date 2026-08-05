package com.smartexpensemanager.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.smartexpensemanager.config.KafkaConfig;
import com.smartexpensemanager.event.*;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private static final Logger log = LoggerFactory.getLogger(KafkaProducerService.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ApplicationEventPublisher applicationEventPublisher;

    public KafkaProducerService(@org.springframework.beans.factory.annotation.Autowired(required = false) KafkaTemplate<String, Object> kafkaTemplate,
                                ApplicationEventPublisher applicationEventPublisher) {
        this.kafkaTemplate = kafkaTemplate;
        this.applicationEventPublisher = applicationEventPublisher;
    }

    public void publishExpenseCreated(ExpenseCreatedEvent event) {
        applicationEventPublisher.publishEvent(event);
        sendKafkaEvent(KafkaConfig.TOPIC_EXPENSE_EVENTS, String.valueOf(event.getUserId()), event);
    }

    public void publishExpenseUpdated(ExpenseUpdatedEvent event) {
        applicationEventPublisher.publishEvent(event);
        sendKafkaEvent(KafkaConfig.TOPIC_EXPENSE_EVENTS, String.valueOf(event.getUserId()), event);
    }

    public void publishExpenseDeleted(ExpenseDeletedEvent event) {
        applicationEventPublisher.publishEvent(event);
        sendKafkaEvent(KafkaConfig.TOPIC_EXPENSE_EVENTS, String.valueOf(event.getUserId()), event);
    }

    public void publishBudgetExceeded(BudgetExceededEvent event) {
        applicationEventPublisher.publishEvent(event);
        sendKafkaEvent(KafkaConfig.TOPIC_BUDGET_EVENTS, String.valueOf(event.getUserId()), event);
    }

    public void publishUserRegistered(UserRegisteredEvent event) {
        applicationEventPublisher.publishEvent(event);
        sendKafkaEvent(KafkaConfig.TOPIC_USER_EVENTS, String.valueOf(event.getUserId()), event);
    }

    private void sendKafkaEvent(String topic, String key, Object payload) {
        if (kafkaTemplate == null) {
            log.info("Kafka disabled. In-memory Spring domain event processed for topic: {}", topic);
            return;
        }
        try {
            kafkaTemplate.send(topic, key, payload)
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.warn("Kafka event dispatch failed for topic {}: {}. Spring local events executed.", topic, ex.getMessage());
                        } else {
                            log.info("Kafka event dispatched to topic {} [partition {}, offset {}]", topic, result.getRecordMetadata().partition(), result.getRecordMetadata().offset());
                        }
                    });
        } catch (Exception e) {
            log.warn("Kafka disabled or unavailable. Falling back to in-memory Spring event listeners: {}", e.getMessage());
        }
    }
}
