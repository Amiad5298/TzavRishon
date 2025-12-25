package com.tzavrishon.dto;

import java.util.List;
import lombok.Data;

@Data
public class ExamAttemptListResponse {
  private List<ExamAttemptListItem> attempts;
}

