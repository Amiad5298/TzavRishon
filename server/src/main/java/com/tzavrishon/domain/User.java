package com.tzavrishon.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(name = "google_id", unique = true)
  private String googleId;

  @Column(name = "display_name")
  private String displayName;

  @Column(name = "avatar_url", length = 2048)
  private String avatarUrl;

  @Column(name = "is_premium")
  private Boolean isPremium = false;

  @Column(name = "created_at")
  private Instant createdAt = Instant.now();
}

