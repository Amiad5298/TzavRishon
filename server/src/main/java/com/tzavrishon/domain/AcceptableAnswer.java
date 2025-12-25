package com.tzavrishon.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "acceptable_answers")
@Data
@NoArgsConstructor
public class AcceptableAnswer {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "question_id", nullable = false)
  private Question question;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String value;

  @Column(name = "numeric_tolerance", precision = 10, scale = 4)
  private BigDecimal numericTolerance;
}

