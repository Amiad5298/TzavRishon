package com.tzavrishon.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "guest_identities")
@Data
@NoArgsConstructor
public class GuestIdentity {
  @Id
  @Column(name = "guest_id")
  private UUID guestId = UUID.randomUUID();

  @Column(name = "created_at")
  private Instant createdAt = Instant.now();

  @Column(name = "last_seen_at")
  private Instant lastSeenAt = Instant.now();
}

