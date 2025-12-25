package com.tzavrishon.dto;

import lombok.Data;

@Data
public class ExamSummaryResponse {
  private Integer totalScore90;
  private Integer totalQuestions;
  private Integer correctAnswers;
  private Long totalTimeSeconds;
  private SectionScore verbalAnalogy;
  private SectionScore shapeAnalogy;
  private SectionScore instructionsDirections;
  private SectionScore quantitative;
}
