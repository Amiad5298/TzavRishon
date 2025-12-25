package com.tzavrishon.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {
  private String frontendUrl;
  private Jwt jwt = new Jwt();
  private Guest guest = new Guest();
  private Exam exam = new Exam();
  private Adsense adsense = new Adsense();

  @Data
  public static class Jwt {
    private String secret;
    private long expiration;
    private String cookieName;
  }

  @Data
  public static class Guest {
    private int practiceLimitPerType;
    private int recentQuestionsCacheSize;
  }

  @Data
  public static class Exam {
    private String sectionCounts; // e.g., "VERBAL_ANALOGY:10,SHAPE_ANALOGY:10,..."
    private String sectionDurations; // e.g., "VERBAL_ANALOGY:480,..."
  }

  @Data
  public static class Adsense {
    private boolean enabled;
    private String client;
  }
}

