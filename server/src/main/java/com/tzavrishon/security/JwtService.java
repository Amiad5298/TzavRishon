package com.tzavrishon.security;

import com.tzavrishon.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final SecretKey key;
  private final long expiration;
  private final String cookieName;
  private final String frontendUrl;

  public JwtService(AppProperties appProperties) {
    // Decode the base64-encoded secret key
    byte[] decodedKey = Base64.getDecoder().decode(appProperties.getJwt().getSecret());
    this.key = Keys.hmacShaKeyFor(decodedKey);
    this.expiration = appProperties.getJwt().getExpiration();
    this.cookieName = appProperties.getJwt().getCookieName();
    this.frontendUrl = appProperties.getFrontendUrl();
  }

  /**
   * Detect if running in production (HTTPS) based on frontend URL.
   */
  private boolean isProduction() {
    return frontendUrl != null && frontendUrl.startsWith("https://");
  }

  /**
   * Generate a JWT token for a user.
   */
  public String generateToken(UUID userId, String email) {
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + expiration);

    return Jwts.builder()
        .subject(userId.toString())
        .claim("email", email)
        .issuedAt(now)
        .expiration(expiryDate)
        .signWith(key)
        .compact();
  }

  /**
   * Validate and parse a JWT token.
   */
  public Optional<Claims> validateToken(String token) {
    try {
      Claims claims =
          Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
      return Optional.of(claims);
    } catch (Exception e) {
      return Optional.empty();
    }
  }

  /**
   * Extract user ID from JWT claims.
   */
  public UUID getUserIdFromClaims(Claims claims) {
    return UUID.fromString(claims.getSubject());
  }

  /**
   * Set JWT as HTTP-only cookie in response.
   * Automatically detects production (HTTPS) vs development (HTTP) based on frontend URL.
   */
  public void setAuthCookie(HttpServletResponse response, String token) {
    Cookie cookie = new Cookie(cookieName, token);
    cookie.setHttpOnly(true);
    cookie.setSecure(isProduction()); // true for HTTPS (production), false for HTTP (localhost)
    cookie.setPath("/");
    cookie.setMaxAge((int) (expiration / 1000));
    cookie.setAttribute("SameSite", "Lax");
    response.addCookie(cookie);
  }

  /**
   * Clear authentication cookie.
   */
  public void clearAuthCookie(HttpServletResponse response) {
    Cookie cookie = new Cookie(cookieName, null);
    cookie.setHttpOnly(true);
    cookie.setSecure(isProduction()); // Match the secure flag with setAuthCookie
    cookie.setPath("/");
    cookie.setMaxAge(0);
    response.addCookie(cookie);
  }

  /**
   * Extract JWT token from cookies in the request.
   */
  public Optional<String> extractTokenFromCookies(HttpServletRequest request) {
    if (request.getCookies() == null) {
      return Optional.empty();
    }
    return Arrays.stream(request.getCookies())
        .filter(cookie -> cookieName.equals(cookie.getName()))
        .map(Cookie::getValue)
        .findFirst();
  }
}

