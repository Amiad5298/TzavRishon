package com.tzavrishon.dto;

import lombok.Data;

@Data
public class TypeStats {
  private String type;
  private Integer totalQuestions;
  private Integer correctAnswers;
  private Double accuracy;
}

