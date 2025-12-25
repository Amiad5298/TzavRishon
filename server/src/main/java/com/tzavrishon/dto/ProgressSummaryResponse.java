package com.tzavrishon.dto;

import java.util.List;
import lombok.Data;

@Data
public class ProgressSummaryResponse {
  private Integer totalAttempts;
  private Double overallAccuracy;
  private Integer avgTimePerQuestionMs;
  private Double improvementPercent;
  private List<TypeStats> statsByType;
  private List<AttemptSummary> recentAttempts;
}
