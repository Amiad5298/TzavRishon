package com.tzavrishon.dto;

import java.util.UUID;
import lombok.Data;

@Data
public class AuthResponse {
  private boolean authenticated;
  private UserResponse user;
  private UUID guestId;
}

