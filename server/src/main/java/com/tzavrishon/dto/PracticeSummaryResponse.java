package com.tzavrishon.dto;

import lombok.Data;

@Data
public class PracticeSummaryResponse {
  private Integer totalQuestions;
  private Integer correctAnswers;
  private Double accuracy;
  private Integer totalTimeMs;
}

