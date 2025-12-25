package com.tzavrishon.dto;

import java.util.UUID;
import lombok.Data;

@Data
public class ExamSectionInfo {
  private UUID sectionId;
  private String type;
  private Integer orderIndex;
  private Integer durationSeconds;
  private boolean locked;
}

