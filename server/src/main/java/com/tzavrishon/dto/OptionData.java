package com.tzavrishon.dto;

import lombok.Data;

@Data
public class OptionData {
  private String text;
  private String imageUrl;
  private Boolean isCorrect;
  private Integer optionOrder;
}

