package com.tzavrishon.dto;

import java.util.List;
import java.util.UUID;
import lombok.Data;

@Data
public class QuestionResponse {
  private UUID id;
  private String type;
  private String format;
  private String promptText;
  private String promptImageUrl;
  private List<QuestionOptionResponse> options;
}

