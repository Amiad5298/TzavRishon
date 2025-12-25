package com.tzavrishon.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "exam_attempts")
@Data
@NoArgsConstructor
public class ExamAttempt {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "created_at")
  private Instant createdAt = Instant.now();

  @Column(name = "completed_at")
  private Instant completedAt;

  @Column(name = "total_score_90")
  private Integer totalScore90;

  @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL)
  private List<ExamSection> sections;
}

