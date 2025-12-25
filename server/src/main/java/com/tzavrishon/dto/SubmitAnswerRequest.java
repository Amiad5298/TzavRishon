package com.tzavrishon.dto;

import java.util.UUID;
import lombok.Data;

@Data
public class SubmitAnswerRequest {
  private UUID questionId;
  private String textAnswer;
  private UUID selectedOptionId;
  private Integer timeMs;
}

