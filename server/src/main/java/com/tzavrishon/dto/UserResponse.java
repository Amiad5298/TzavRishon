package com.tzavrishon.dto;

import java.util.UUID;
import lombok.Data;

@Data
public class UserResponse {
  private UUID id;
  private String email;
  private String displayName;
  private String avatarUrl;
  private Boolean isPremium;
}

