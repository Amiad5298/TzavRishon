package com.tzavrishon.dto;

import java.util.UUID;
import lombok.Data;

@Data
public class QuestionOptionResponse {
  private UUID id;
  private String text;
  private String imageUrl;
  private Integer optionOrder;
}

