package com.tzavrishon.dto;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import lombok.Data;

@Data
public class ExamAttemptListItem {
  private UUID attemptId;
  private LocalDateTime createdAt;
  private int score90;
  private double accuracy;
  private long durationSeconds;
  private Map<String, SectionBreakdown> sections;

  @Data
  public static class SectionBreakdown {
    private int answered;
    private int total;
    private int skipped;
    private int flagged;
    private double accuracy;
    private long timeSpentSeconds;
  }
}

