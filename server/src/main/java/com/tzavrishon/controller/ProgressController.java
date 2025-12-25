package com.tzavrishon.controller;

import com.tzavrishon.dto.*;
import com.tzavrishon.security.UserPrincipal;
import com.tzavrishon.service.ProgressService;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/progress")
public class ProgressController {
  private final ProgressService progressService;

  public ProgressController(ProgressService progressService) {
    this.progressService = progressService;
  }

  @GetMapping("/summary")
  public ResponseEntity<ProgressSummaryResponse> getSummary(
      @AuthenticationPrincipal UserPrincipal user,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
    ProgressSummaryResponse response = progressService.getSummary(user, startDate, endDate);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/trend")
  public ResponseEntity<TrendResponse> getTrend(@AuthenticationPrincipal UserPrincipal user) {
    TrendResponse response = progressService.getTrend(user);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/attempts/{attemptId}")
  public ResponseEntity<ExamSummaryResponse> getAttemptDetail(
      @PathVariable UUID attemptId, @AuthenticationPrincipal UserPrincipal user) {
    ExamSummaryResponse response = progressService.getAttemptDetail(attemptId, user);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/practice-summary")
  public ResponseEntity<PracticeStatsResponse> getPracticeSummary(
      @AuthenticationPrincipal UserPrincipal user,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
    PracticeStatsResponse response = progressService.getPracticeSummary(user, startDate, endDate);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/practice-trend")
  public ResponseEntity<TrendResponse> getPracticeTrend(
      @AuthenticationPrincipal UserPrincipal user,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
    TrendResponse response = progressService.getPracticeTrend(user, startDate, endDate);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/exam-attempts")
  public ResponseEntity<ExamAttemptListResponse> getExamAttempts(
      @AuthenticationPrincipal UserPrincipal user,
      @RequestParam(defaultValue = "5") int limit) {
    ExamAttemptListResponse response = progressService.getRecentExamAttempts(user, limit);
    return ResponseEntity.ok(response);
  }
}

