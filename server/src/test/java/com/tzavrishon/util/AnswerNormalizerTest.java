package com.tzavrishon.util;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class AnswerNormalizerTest {
  private final AnswerNormalizer normalizer = new AnswerNormalizer();

  @Test
  void testBasicNormalization() {
    assertEquals("חיתוך", normalizer.normalize("חִיתּוּך")); // Strip niqqud
    assertEquals("קריאה", normalizer.normalize("  קְרִיאָה  ")); // Strip niqqud and trim
    assertEquals("נכון", normalizer.normalize("נָכוֹן!")); // Remove punctuation
  }

  @Test
  void testTextMatching() {
    assertTrue(normalizer.matches("חיתוך", "חִיתּוּך"));
    assertTrue(normalizer.matches("מזרח", "מִזְרָח"));
    assertTrue(normalizer.matches("נכון", "נָכוֹן!"));
    assertFalse(normalizer.matches("חיתוך", "קריאה"));
  }

  @Test
  void testNumericParsing() {
    assertTrue(normalizer.parseNumeric("56").isPresent());
    assertTrue(normalizer.parseNumeric("7.5").isPresent());
    assertTrue(normalizer.parseNumeric("-10").isPresent());
    assertFalse(normalizer.parseNumeric("abc").isPresent());
  }

  @Test
  void testNumericMatching() {
    assertTrue(
        normalizer.numericMatches(
            new BigDecimal("10"), new BigDecimal("10"), new BigDecimal("0")));
    assertTrue(
        normalizer.numericMatches(
            new BigDecimal("10"), new BigDecimal("10.05"), new BigDecimal("0.1")));
    assertFalse(
        normalizer.numericMatches(
            new BigDecimal("10"), new BigDecimal("11"), new BigDecimal("0.5")));
  }
}

