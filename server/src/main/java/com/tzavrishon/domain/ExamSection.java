package com.tzavrishon.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "exam_sections")
@Data
@NoArgsConstructor
public class ExamSection {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "attempt_id", nullable = false)
  private ExamAttempt attempt;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private QuestionType type;

  @Column(name = "order_index", nullable = false)
  private Integer orderIndex;

  @Column(name = "duration_seconds", nullable = false)
  private Integer durationSeconds;

  @Column(name = "started_at")
  private Instant startedAt;

  @Column(name = "ended_at")
  private Instant endedAt;

  @Column(nullable = false)
  private Boolean locked = false;

  @Column(name = "score_section")
  private Integer scoreSection = 0;

  @OneToMany(mappedBy = "section", cascade = CascadeType.ALL)
  private List<ExamUserAnswer> answers;
}

