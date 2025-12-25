package com.tzavrishon.dto;

import java.util.UUID;
import lombok.Data;

@Data
public class PracticeSessionResponse {
  private UUID sessionId;
  private String type;
  private Integer questionsAvailable;
  private boolean limitReached;
}

