package com.tzavrishon.dto;

import java.util.List;
import java.util.UUID;
import lombok.Data;

@Data
public class ExamAttemptResponse {
  private UUID attemptId;
  private List<ExamSectionInfo> sections;
}
