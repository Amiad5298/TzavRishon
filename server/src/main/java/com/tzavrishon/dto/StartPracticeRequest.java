package com.tzavrishon.dto;

import com.tzavrishon.domain.QuestionType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StartPracticeRequest {
  @NotNull private QuestionType type;
}

