package com.tzavrishon.controller;

import com.tzavrishon.dto.*;
import com.tzavrishon.security.UserPrincipal;
import com.tzavrishon.service.ExamService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/exam")
public class ExamController {
  private final ExamService examService;

  public ExamController(ExamService examService) {
    this.examService = examService;
  }

  @PostMapping("/start")
  public ResponseEntity<ExamAttemptResponse> startExam(@AuthenticationPrincipal UserPrincipal user) {
    ExamAttemptResponse response = examService.startExam(user);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{attemptId}/section/current")
  public ResponseEntity<CurrentSectionResponse> getCurrentSection(@PathVariable UUID attemptId) {
    CurrentSectionResponse response = examService.getCurrentSection(attemptId);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/{attemptId}/answer")
  public ResponseEntity<AnswerResponse> submitAnswer(
      @PathVariable UUID attemptId, @Valid @RequestBody SubmitAnswerRequest request) {
    AnswerResponse response = examService.submitExamUserAnswer(attemptId, request);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/{attemptId}/section/confirm-finish")
  public ResponseEntity<Void> confirmFinishSection(@PathVariable UUID attemptId) {
    examService.confirmFinishSection(attemptId);
    return ResponseEntity.ok().build();
  }

  @PostMapping("/{attemptId}/finish")
  public ResponseEntity<ExamSummaryResponse> finishExam(@PathVariable UUID attemptId) {
    ExamSummaryResponse response = examService.finishExam(attemptId);
    return ResponseEntity.ok(response);
  }
}

