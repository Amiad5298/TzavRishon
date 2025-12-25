package com.tzavrishon.security;

import com.tzavrishon.config.AppProperties;
import com.tzavrishon.domain.User;
import com.tzavrishon.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
  private final JwtService jwtService;
  private final UserRepository userRepository;
  private final String frontendUrl;

  public OAuth2AuthenticationSuccessHandler(
      JwtService jwtService, UserRepository userRepository, AppProperties appProperties) {
    this.jwtService = jwtService;
    this.userRepository = userRepository;
    this.frontendUrl = appProperties.getFrontendUrl();
  }

  @Override
  public void onAuthenticationSuccess(
      HttpServletRequest request, HttpServletResponse response, Authentication authentication)
      throws IOException, ServletException {
    OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
    Map<String, Object> attributes = oAuth2User.getAttributes();

    String email = (String) attributes.get("email");
    String googleId = (String) attributes.get("sub");
    String displayName = (String) attributes.get("name");
    String avatarUrl = (String) attributes.get("picture");

    // Find or create user
    User user =
        userRepository
            .findByGoogleId(googleId)
            .orElseGet(
                () -> {
                  User newUser = new User();
                  newUser.setEmail(email);
                  newUser.setGoogleId(googleId);
                  newUser.setDisplayName(displayName);
                  newUser.setAvatarUrl(avatarUrl);
                  newUser.setIsPremium(false);
                  return userRepository.save(newUser);
                });

    // Update user info if changed
    if (!displayName.equals(user.getDisplayName()) || !avatarUrl.equals(user.getAvatarUrl())) {
      user.setDisplayName(displayName);
      user.setAvatarUrl(avatarUrl);
      userRepository.save(user);
    }

    // Generate JWT and set cookie
    String token = jwtService.generateToken(user.getId(), user.getEmail());
    jwtService.setAuthCookie(response, token);

    // Redirect to frontend
    getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/auth/callback");
  }
}

