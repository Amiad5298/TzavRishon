package com.tzavrishon.controller;

import com.tzavrishon.dto.AuthResponse;
import com.tzavrishon.dto.UserResponse;
import com.tzavrishon.security.JwtService;
import com.tzavrishon.security.UserPrincipal;
import jakarta.servlet.http.HttpServletResponse;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
  private final JwtService jwtService;

  public AuthController(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  /**
   * GET /me - Returns current user info or guest ID.
   * The OAuth2 login is handled by Spring Security automatically at /api/v1/auth/google/login.
   */
  @GetMapping("/me")
  public ResponseEntity<AuthResponse> getCurrentUser(
      @AuthenticationPrincipal UserPrincipal userPrincipal,
      @CookieValue(name = "guest_id", required = false) String guestIdStr) {
    AuthResponse response = new AuthResponse();

    if (userPrincipal != null) {
      response.setAuthenticated(true);
      UserResponse userResponse = new UserResponse();
      userResponse.setId(userPrincipal.getId());
      userResponse.setEmail(userPrincipal.getEmail());
      userResponse.setDisplayName(userPrincipal.getDisplayName());
      userResponse.setIsPremium(userPrincipal.getIsPremium());
      response.setUser(userResponse);
    } else {
      response.setAuthenticated(false);
      if (guestIdStr != null) {
        try {
          response.setGuestId(UUID.fromString(guestIdStr));
        } catch (IllegalArgumentException e) {
          // Invalid guest ID
        }
      }
    }

    return ResponseEntity.ok(response);
  }

  /**
   * POST /logout - Clear authentication cookie.
   */
  @PostMapping("/logout")
  public ResponseEntity<Void> logout(HttpServletResponse response) {
    jwtService.clearAuthCookie(response);
    return ResponseEntity.ok().build();
  }
}

