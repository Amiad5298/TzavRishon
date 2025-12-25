package com.tzavrishon.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
public class PracticeStatsResponse {
  private Map<String, TypePracticeStats> statsByType;
  private List<DailyPracticeVolume> dailyVolume;
  private int currentStreak;
  private double overallAccuracy;
  private int totalQuestions;
  private double avgTimePerQuestionMs;

  @Data
  public static class TypePracticeStats {
    private String type;
    private int totalQuestions;
    private int correctAnswers;
    private double accuracy;
    private double avgTimeMs;
    private double masteryScore; // 0-100, weighted by recency
  }

  @Data
  public static class DailyPracticeVolume {
    private LocalDate date;
    private int questionCount;
    private double accuracy;
  }
}

