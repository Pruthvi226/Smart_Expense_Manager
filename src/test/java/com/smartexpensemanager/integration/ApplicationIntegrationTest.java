package com.smartexpensemanager.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartexpensemanager.entity.Notification;
import com.smartexpensemanager.entity.User;
import com.smartexpensemanager.repository.NotificationRepository;
import com.smartexpensemanager.repository.UserRepository;
import com.smartexpensemanager.event.PasswordResetRequestedEvent;
import com.smartexpensemanager.kafka.KafkaProducerService;
import com.smartexpensemanager.event.ExpenseCreatedEvent;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.event.RecordApplicationEvents;
import org.springframework.test.context.event.ApplicationEvents;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import java.time.LocalDate;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Real security chain + transactional services + H2; no paid or external integrations. */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:integrationdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=MYSQL;NON_KEYWORDS=MONTH,YEAR",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password="
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@RecordApplicationEvents
class ApplicationIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserRepository users;
    @Autowired NotificationRepository notifications;
    @Autowired ApplicationEvents events;
    @Autowired PlatformTransactionManager transactions;
    @Autowired KafkaProducerService publisher;
    @MockBean JavaMailSender mail;

    private JsonNode register(String email) throws Exception {
        String body = json.writeValueAsString(java.util.Map.of("name", "Test User", "email", email,
                "password", "StrongPassword123!"));
        return json.readTree(mvc.perform(post("/api/v1/auth/register").contentType("application/json").content(body))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
    }

    private String email() { return "test-" + UUID.randomUUID() + "@example.com"; }
    private String expense() throws Exception {
        return json.writeValueAsString(java.util.Map.of("title", "Lunch", "amount", 125.50,
                "category", "Food", "expenseDate", LocalDate.now().toString()));
    }

    @Test void repeatedLoginAndRefreshRotateTheUniqueUserToken() throws Exception {
        String email = email();
        JsonNode registered = register(email);
        String loginBody = json.writeValueAsString(java.util.Map.of("email", email, "password", "StrongPassword123!"));
        JsonNode loggedIn = json.readTree(mvc.perform(post("/api/v1/auth/login").contentType("application/json")
                .content(loginBody)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        assertThat(loggedIn.path("refreshToken")).isNotEqualTo(registered.path("refreshToken"));
        mvc.perform(post("/api/v1/auth/refresh").contentType("application/json")
                .content(json.writeValueAsString(java.util.Map.of("refreshToken", registered.path("refreshToken").asText()))))
                .andExpect(status().isForbidden());
        JsonNode rotated = json.readTree(mvc.perform(post("/api/v1/auth/refresh").contentType("application/json")
                .content(json.writeValueAsString(java.util.Map.of("refreshToken", loggedIn.path("refreshToken").asText()))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        assertThat(rotated.path("refreshToken")).isNotEqualTo(loggedIn.path("refreshToken"));
        mvc.perform(post("/api/v1/auth/refresh").contentType("application/json")
                .content(json.writeValueAsString(java.util.Map.of("refreshToken", loggedIn.path("refreshToken").asText()))))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/auth/login").contentType("application/json").content(loginBody)).andExpect(status().isOk());
    }

    @Test void failedLoginsPersistAndBlockExistingAccessAndRefreshTokens() throws Exception {
        String email = email();
        JsonNode auth = register(email);
        for (int attempt = 0; attempt < 5; attempt++) {
            mvc.perform(post("/api/v1/auth/login").contentType("application/json")
                    .content(json.writeValueAsString(java.util.Map.of("email", email, "password", "wrong-password"))))
                    .andExpect(status().isUnauthorized());
        }
        User stored = users.findByEmail(email).orElseThrow();
        assertThat(stored.getFailedLoginAttempts()).isEqualTo(5);
        assertThat(stored.getAccountNonLocked()).isFalse();
        mvc.perform(get("/api/v1/users/profile").header("Authorization", "Bearer " + auth.path("token").asText()))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/auth/refresh").contentType("application/json")
                .content(json.writeValueAsString(java.util.Map.of("refreshToken", auth.path("refreshToken").asText()))))
                .andExpect(status().isForbidden());
    }

    @Test void resetResponseDoesNotEnumerateAccountsAndTokenIsHashedSingleUse() throws Exception {
        String email = email();
        JsonNode auth = register(email);
        String known = mvc.perform(post("/api/v1/auth/forgot-password").contentType("application/json")
                .content(json.writeValueAsString(java.util.Map.of("email", email))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String unknown = mvc.perform(post("/api/v1/auth/forgot-password").contentType("application/json")
                .content(json.writeValueAsString(java.util.Map.of("email", email()))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertThat(json.readTree(known).path("message")).isEqualTo(json.readTree(unknown).path("message"));
        PasswordResetRequestedEvent event = events.stream(PasswordResetRequestedEvent.class).findFirst().orElseThrow();
        String token = event.link().substring(event.link().indexOf("token=") + 6);
        assertThat(users.findByEmail(email).orElseThrow().getResetPasswordToken()).hasSize(64).isNotEqualTo(token);
        String reset = json.writeValueAsString(java.util.Map.of("token", token, "newPassword", "NewPassword123!"));
        mvc.perform(post("/api/v1/auth/reset-password").contentType("application/json").content(reset)).andExpect(status().isOk());
        mvc.perform(post("/api/v1/auth/reset-password").contentType("application/json").content(reset)).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/auth/refresh").contentType("application/json")
                .content(json.writeValueAsString(java.util.Map.of("refreshToken", auth.path("refreshToken").asText()))))
                .andExpect(status().isForbidden());
    }

    @Test void duplicateNormalizedRegistrationIsRejected() throws Exception {
        String email = email();
        register(email);
        mvc.perform(post("/api/v1/auth/register").contentType("application/json")
                .content(json.writeValueAsString(java.util.Map.of("name", "Test User", "email", email.toUpperCase(java.util.Locale.ROOT),
                        "password", "StrongPassword123!"))))
                .andExpect(status().isConflict());
    }

    @Test void expenseOwnershipAndIdempotencyReplayAreEnforced() throws Exception {
        JsonNode first = register(email());
        JsonNode other = register(email());
        String auth = "Bearer " + first.path("token").asText();
        String key = UUID.randomUUID().toString();
        String created = mvc.perform(post("/api/v1/expenses").header("Authorization", auth)
                .header("Idempotency-Key", key).contentType("application/json").content(expense()))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String replay = mvc.perform(post("/api/v1/expenses").header("Authorization", auth)
                .header("Idempotency-Key", key).contentType("application/json").content(expense()))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        assertThat(replay).isEqualTo(created);
        long id = json.readTree(created).path("id").asLong();
        mvc.perform(get("/api/v1/expenses/" + id).header("Authorization", "Bearer " + other.path("token").asText()))
                .andExpect(status().isNotFound());
        mvc.perform(post("/api/v1/expenses").header("Authorization", auth).header("Idempotency-Key", key)
                .contentType("application/json").content(expense().replace("Lunch", "Dinner")))
                .andExpect(status().isConflict());
    }

    @Test void notificationsAreOwnedAndReadStatePersists() throws Exception {
        JsonNode first = register(email());
        JsonNode second = register(email());
        Notification saved = notifications.save(Notification.builder().userId(first.path("user").path("id").asLong())
                .title("Budget alert").message("Budget exceeded").build());
        mvc.perform(patch("/api/v1/notifications/" + saved.getId() + "/read")
                .header("Authorization", "Bearer " + second.path("token").asText())).andExpect(status().isNotFound());
        mvc.perform(patch("/api/v1/notifications/" + saved.getId() + "/read")
                .header("Authorization", "Bearer " + first.path("token").asText())).andExpect(status().isNoContent());
        assertThat(notifications.findById(saved.getId()).orElseThrow().getIsRead()).isTrue();
        mvc.perform(get("/api/v1/notifications").header("Authorization", "Bearer " + first.path("token").asText()))
                .andExpect(status().isOk()).andExpect(jsonPath("content").isArray());
    }

    @Test void budgetUpdateUsesPathIdAndCannotEditOtherUsersBudget() throws Exception {
        JsonNode auth = register(email());
        String bearer = "Bearer " + auth.path("token").asText();
        String budget = "{\"category\":\"Food\",\"limitAmount\":500,\"month\":10,\"year\":2026}";
        String created = mvc.perform(post("/api/v1/budgets").header("Authorization", bearer)
                .contentType("application/json").content(budget)).andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long id = json.readTree(created).path("id").asLong();
        mvc.perform(put("/api/v1/budgets/" + id).header("Authorization", bearer).contentType("application/json")
                .content(budget.replace("Food", "Travel"))).andExpect(status().isOk()).andExpect(jsonPath("id").value(id));
        JsonNode second = register(email());
        mvc.perform(put("/api/v1/budgets/" + id).header("Authorization", "Bearer " + second.path("token").asText())
                .contentType("application/json").content(budget)).andExpect(status().isNotFound());
    }

    @Test void malformedRequestsAndUnsupportedSortingAreBadRequests() throws Exception {
        JsonNode auth = register(email());
        String bearer = "Bearer " + auth.path("token").asText();
        mvc.perform(get("/api/v1/expenses?sortBy=password").header("Authorization", bearer)).andExpect(status().isBadRequest());
        mvc.perform(post("/api/v1/expenses").header("Authorization", bearer).contentType("application/json").content("{invalid"))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/analytics?months=1000").header("Authorization", bearer)).andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/admin/users").header("Authorization", bearer)).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/expenses")).andExpect(status().isUnauthorized());
    }

    @Test void rolledBackExpenseEventDoesNotCreateNotification() throws Exception {
        JsonNode auth = register(email());
        long userId = auth.path("user").path("id").asLong();
        TransactionTemplate transaction = new TransactionTemplate(transactions);
        transaction.executeWithoutResult(status -> {
            publisher.publishExpenseCreated(new ExpenseCreatedEvent(999L, userId, "Rolled back", "Food", 6000.0, "2026-10-10"));
            status.setRollbackOnly();
        });
        assertThat(notifications.findByUserIdOrderByCreatedAtDesc(userId, org.springframework.data.domain.PageRequest.of(0, 100))
                .getContent()).noneMatch(n -> n.getTitle().equals("Large Expense Recorded"));
    }

    @Test void profileEmailChangeDoesNotTransferAnExistingJwtToAnotherUser() throws Exception {
        String originalEmail = email();
        JsonNode auth = register(originalEmail);
        String bearer = "Bearer " + auth.path("token").asText();
        mvc.perform(put("/api/v1/users/profile").header("Authorization", bearer).contentType("application/json")
                .content(json.writeValueAsString(java.util.Map.of("name", "Changed User", "email", email()))))
                .andExpect(status().isOk());
        register(originalEmail);
        mvc.perform(get("/api/v1/users/profile").header("Authorization", bearer))
                .andExpect(status().isOk()).andExpect(jsonPath("data.id").value(auth.path("user").path("id").asLong()));
    }
}
