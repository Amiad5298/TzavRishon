package com.tzavrishon.dto;

import lombok.Data;

@Data
public class TrendPoint {
  private String date;
  private String type;
  private Double accuracy;
}

