package com.tzavrishon.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "practice_answers")
@Data
@NoArgsConstructor
public class PracticeAnswer {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "session_id", nullable = false)
  private PracticeSession session;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "question_id", nullable = false)
  private Question question;

  @Column(name = "user_answer_raw", columnDefinition = "TEXT")
  private String userAnswerRaw;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "selected_option_id")
  private QuestionOption selectedOption;

  @Column(name = "is_correct", nullable = false)
  private Boolean isCorrect;

  @Column(name = "time_ms")
  private Integer timeMs;

  @Column(name = "answered_at")
  private Instant answeredAt = Instant.now();
}

