package com.tzavrishon.dto;

import java.util.List;
import lombok.Data;

@Data
public class TrendResponse {
  private List<TrendPoint> trends;
}
