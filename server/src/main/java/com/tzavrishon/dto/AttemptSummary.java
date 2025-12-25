package com.tzavrishon.dto;

import lombok.Data;

@Data
public class AttemptSummary {
  private String attemptId;
  private String createdAt;
  private Integer score90;
  private Integer correctAnswers;
  private Integer totalQuestions;
}

