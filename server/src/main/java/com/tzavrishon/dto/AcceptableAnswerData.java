package com.tzavrishon.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class AcceptableAnswerData {
  private String value;
  private BigDecimal numericTolerance;
}

