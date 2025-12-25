package com.tzavrishon.dto;

import lombok.Data;

@Data
public class SectionScore {
  private Integer correct;
  private Integer total;
  private Double accuracy;
  private Long timeSpentSeconds;
}

