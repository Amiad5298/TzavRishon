package com.tzavrishon.controller;

import com.tzavrishon.dto.*;
import com.tzavrishon.security.UserPrincipal;
import com.tzavrishon.service.PracticeService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/practice")
public class PracticeController {
  private final PracticeService practiceService;

  public PracticeController(PracticeService practiceService) {
    this.practiceService = practiceService;
  }

  @PostMapping("/start")
  public ResponseEntity<PracticeSessionResponse> startSession(
      @Valid @RequestBody StartPracticeRequest request,
      @AuthenticationPrincipal UserPrincipal user,
      @CookieValue(name = "guest_id", required = false) String guestIdStr) {
    UUID guestId = null;
    if (user == null) {
      if (guestIdStr == null) {
        guestId = UUID.randomUUID();
      } else {
        try {
          guestId = UUID.fromString(guestIdStr);
        } catch (IllegalArgumentException e) {
          guestId = UUID.randomUUID();
        }
      }
    }

    PracticeSessionResponse response = practiceService.startSession(request.getType(), user, guestId);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{sessionId}/questions")
  public ResponseEntity<List<QuestionResponse>> getQuestions(@PathVariable UUID sessionId) {
    List<QuestionResponse> questions = practiceService.getQuestions(sessionId);
    return ResponseEntity.ok(questions);
  }

  @PostMapping("/{sessionId}/answer")
  public ResponseEntity<AnswerResponse> submitAnswer(
      @PathVariable UUID sessionId, @Valid @RequestBody SubmitAnswerRequest request) {
    AnswerResponse response = practiceService.submitAnswer(sessionId, request);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/{sessionId}/finish")
  public ResponseEntity<PracticeSummaryResponse> finishSession(@PathVariable UUID sessionId) {
    PracticeSummaryResponse response = practiceService.finishSession(sessionId);
    return ResponseEntity.ok(response);
  }
}

