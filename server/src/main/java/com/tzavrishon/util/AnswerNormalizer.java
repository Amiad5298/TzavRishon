package com.tzavrishon.util;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.Optional;
import org.springframework.stereotype.Component;

/**
 * Utility for normalizing and comparing Hebrew text answers.
 * Handles Hebrew niqqud, punctuation, whitespace, and numeric values with tolerance.
 */
@Component
public class AnswerNormalizer {
  /**
   * Normalize Hebrew text for comparison:
   * - Strip niqqud (diacritics) in range U+0591 to U+05C7
   * - Remove punctuation
   * - Normalize whitespace
   * - Convert to lowercase
   * - Trim
   */
  public String normalize(String text) {
    if (text == null) {
      return "";
    }

    // Normalize Unicode (NFD form to separate diacritics)
    String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);

    // Remove Hebrew niqqud (diacritics) and cantillation marks
    normalized = normalized.replaceAll("[\\u0591-\\u05C7]", "");

    // Remove punctuation
    normalized = normalized.replaceAll("[.,;:!?'\"״׳–—־]", "");

    // Normalize whitespace
    normalized = normalized.replaceAll("\\s+", " ");

    // Convert to lowercase and trim
    normalized = normalized.toLowerCase().trim();

    return normalized;
  }

  /**
   * Compare two texts after normalization.
   */
  public boolean matches(String answer, String candidate) {
    return normalize(answer).equals(normalize(candidate));
  }

  /**
   * Try to parse text as a numeric value.
   */
  public Optional<BigDecimal> parseNumeric(String text) {
    if (text == null) {
      return Optional.empty();
    }
    try {
      // Try to extract a number from the text
      String cleaned = text.trim().replaceAll("[^0-9.-]", "");
      if (cleaned.isEmpty()) {
        return Optional.empty();
      }
      return Optional.of(new BigDecimal(cleaned));
    } catch (NumberFormatException e) {
      return Optional.empty();
    }
  }

  /**
   * Check if a numeric candidate is within tolerance of the expected value.
   */
  public boolean numericMatches(BigDecimal expected, BigDecimal candidate, BigDecimal tolerance) {
    if (tolerance == null || tolerance.compareTo(BigDecimal.ZERO) == 0) {
      return expected.compareTo(candidate) == 0;
    }
    BigDecimal diff = expected.subtract(candidate).abs();
    return diff.compareTo(tolerance) <= 0;
  }
}

