package com.tzavrishon.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "practice_sessions")
@Data
@NoArgsConstructor
public class PracticeSession {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "guest_id")
  private GuestIdentity guest;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private QuestionType type;

  @Column(name = "started_at")
  private Instant startedAt = Instant.now();

  @Column(name = "ended_at")
  private Instant endedAt;

  @OneToMany(mappedBy = "session", cascade = CascadeType.ALL)
  private List<PracticeAnswer> answers;
}

