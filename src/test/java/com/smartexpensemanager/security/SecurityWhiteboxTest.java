package com.smartexpensemanager.security;

import com.smartexpensemanager.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

public class SecurityWhiteboxTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", "9a2f8c4e1b7d6a5f0c3e8b4a1d9c7e2f5b8a1d4c7e0f3a6b9c2d5e8f1a4b7c0d");
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMs", 3600000);
    }

    @Test
    @DisplayName("Whitebox Test: Internal JWT Token generation and claims extraction logic")
    void testJwtTokenProvider_InternalState() {
        User user = User.builder()
                .id(42L)
                .email("admin@smartexpense.com")
                .role(User.Role.ADMIN)
                .build();
        UserPrincipal principal = UserPrincipal.create(user);
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        String token = jwtTokenProvider.generateToken(authentication);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("admin@smartexpense.com", jwtTokenProvider.getEmailFromJWT(token));
        assertEquals(42L, jwtTokenProvider.getUserIdFromJWT(token));
    }

    @Test
    @DisplayName("Whitebox Test: Invalid/Tampered Token internal exception handling branch")
    void testJwtTokenProvider_TamperedTokenBranch() {
        String invalidToken = "eyJhbGciOiJIUzI1NiJ9.invalid.payload";
        assertFalse(jwtTokenProvider.validateToken(invalidToken));
    }
}
