package com.tzavrishon.dto;

import java.util.List;
import java.util.UUID;
import lombok.Data;

@Data
public class CurrentSectionResponse {
  private UUID sectionId;
  private String type;
  private Integer orderIndex;
  private Long remainingTimeSeconds;
  private boolean expired;
  private List<QuestionResponse> questions;
  private List<UUID> answeredQuestionIds;
}

