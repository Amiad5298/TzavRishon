package com.tzavrishon.dto;

import lombok.Data;

@Data
public class AnswerResponse {
  private boolean correct;
  private String explanation;
}

