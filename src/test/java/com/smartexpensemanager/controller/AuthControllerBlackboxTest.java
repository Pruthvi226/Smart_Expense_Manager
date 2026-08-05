package com.smartexpensemanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartexpensemanager.dto.request.LoginRequest;
import com.smartexpensemanager.dto.request.RegisterRequest;
import com.smartexpensemanager.dto.response.AuthResponse;
import com.smartexpensemanager.dto.response.UserResponse;
import com.smartexpensemanager.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class AuthControllerBlackboxTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    @DisplayName("Blackbox API Test: POST /api/v1/auth/register - Valid payload returns HTTP 201 with Auth tokens")
    void testRegisterEndpoint_Success() throws Exception {
        RegisterRequest request = new RegisterRequest("Alice Smith", "alice@example.com", "Password123!");
        UserResponse userResponse = UserResponse.builder()
                .id(1L)
                .name("Alice Smith")
                .email("alice@example.com")
                .role("USER")
                .build();
        AuthResponse authResponse = AuthResponse.builder()
                .token("mock-access-token")
                .refreshToken("mock-refresh-token")
                .user(userResponse)
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("mock-access-token"))
                .andExpect(jsonPath("$.user.email").value("alice@example.com"));
    }

    @Test
    @DisplayName("Blackbox API Test: POST /api/v1/auth/login - Valid credentials payload returns HTTP 200 OK")
    void testLoginEndpoint_Success() throws Exception {
        LoginRequest validRequest = new LoginRequest("user@example.com", "password123");
        AuthResponse authResponse = AuthResponse.builder()
                .token("mock-login-token")
                .refreshToken("mock-refresh-token")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-login-token"));
    }
}
