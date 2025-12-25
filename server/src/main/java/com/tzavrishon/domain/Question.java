package com.tzavrishon.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
public class Question {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private QuestionType type;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private QuestionFormat format;

  @Column(name = "prompt_text", columnDefinition = "TEXT")
  private String promptText;

  @Column(name = "prompt_image_url", columnDefinition = "TEXT")
  private String promptImageUrl;

  @Column(columnDefinition = "TEXT")
  private String explanation;

  @Column(nullable = false)
  private Integer difficulty = 3;

  @Column(name = "is_exam_question", nullable = false)
  private Boolean isExamQuestion = false;

  @Column(name = "created_at")
  private Instant createdAt = Instant.now();

  @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<QuestionOption> options;
}

