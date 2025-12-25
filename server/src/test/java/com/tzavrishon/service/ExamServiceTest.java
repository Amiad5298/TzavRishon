package com.tzavrishon.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.tzavrishon.config.AppProperties;
import com.tzavrishon.domain.*;
import com.tzavrishon.dto.*;
import com.tzavrishon.repository.*;
import com.tzavrishon.security.UserPrincipal;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class ExamServiceTest {
  @Mock private ExamAttemptRepository attemptRepository;
  @Mock private ExamSectionRepository sectionRepository;
  @Mock private ExamUserAnswerRepository answerRepository;
  @Mock private QuestionRepository questionRepository;
  @Mock private QuestionOptionRepository optionRepository;
  @Mock private UserRepository userRepository;
  @Mock private AppProperties appProperties;

  private ExamService examService;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);

    AppProperties.Exam examConfig = new AppProperties.Exam();
    examConfig.setSectionCounts("VERBAL_ANALOGY:10,SHAPE_ANALOGY:10,INSTRUCTIONS_DIRECTIONS:10,QUANTITATIVE:10");
    examConfig.setSectionDurations("VERBAL_ANALOGY:480,SHAPE_ANALOGY:480,INSTRUCTIONS_DIRECTIONS:360,QUANTITATIVE:600");

    when(appProperties.getExam()).thenReturn(examConfig);

    examService =
        new ExamService(
            attemptRepository,
            sectionRepository,
            answerRepository,
            questionRepository,
            optionRepository,
            userRepository,
            null, // answerNormalizer not needed for this test
            appProperties);
  }

  @Test
  void testScoreCalculation() {
    // Test scoring out of 90
    UUID attemptId = UUID.randomUUID();
    ExamAttempt attempt = new ExamAttempt();
    attempt.setId(attemptId);

    when(attemptRepository.findById(attemptId)).thenReturn(Optional.of(attempt));

    // Mock sections
    when(sectionRepository.findByAttemptIdOrderByOrderIndex(attemptId))
        .thenReturn(new ArrayList<>());

    // Mock 40 questions, 36 correct
    List<ExamAnswer> answers = new ArrayList<>();
    for (int i = 0; i < 40; i++) {
      ExamAnswer answer = new ExamAnswer();
      answer.setIsCorrect(i < 36);
      answers.add(answer);
    }
    when(answerRepository.findByAttemptIdOrderBySection(attemptId)).thenReturn(answers);

    // Expected: round(90 * 36 / 40) = round(81) = 81
    ExamSummaryResponse summary = examService.finishExam(attemptId);

    assertEquals(81, summary.getTotalScore90());
    assertEquals(36, summary.getCorrectAnswers());
    assertEquals(40, summary.getTotalQuestions());
  }
}

