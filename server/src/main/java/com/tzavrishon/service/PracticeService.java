package com.tzavrishon.service;

import com.tzavrishon.config.AppProperties;
import com.tzavrishon.domain.*;
import com.tzavrishon.dto.*;
import com.tzavrishon.repository.*;
import com.tzavrishon.security.UserPrincipal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PracticeService {
  private static final Logger logger = LoggerFactory.getLogger(PracticeService.class);

  private final PracticeSessionRepository sessionRepository;
  private final QuestionRepository questionRepository;
  private final QuestionOptionRepository optionRepository;
  private final PracticeUserAnswerRepository answerRepository;
  private final RecentQuestionRepository recentQuestionRepository;
  private final GuestIdentityRepository guestIdentityRepository;
  private final UserRepository userRepository;
  private final AppProperties appProperties;

  public PracticeService(
      PracticeSessionRepository sessionRepository,
      QuestionRepository questionRepository,
      QuestionOptionRepository optionRepository,
      PracticeUserAnswerRepository answerRepository,
      RecentQuestionRepository recentQuestionRepository,
      GuestIdentityRepository guestIdentityRepository,
      UserRepository userRepository,
      AppProperties appProperties) {
    this.sessionRepository = sessionRepository;
    this.questionRepository = questionRepository;
    this.optionRepository = optionRepository;
    this.answerRepository = answerRepository;
    this.recentQuestionRepository = recentQuestionRepository;
    this.guestIdentityRepository = guestIdentityRepository;
    this.userRepository = userRepository;
    this.appProperties = appProperties;
  }

  @Transactional
  public PracticeSessionResponse startSession(
      QuestionType type, UserPrincipal user, UUID guestId) {
    PracticeSession session = new PracticeSession();
    session.setType(type);

    if (user != null) {
      User userEntity = userRepository.findById(user.getId()).orElseThrow();
      session.setUser(userEntity);
    } else {
      // Guest session
      GuestIdentity guest =
          guestIdentityRepository
              .findById(guestId)
              .orElseGet(
                  () -> {
                    GuestIdentity newGuest = new GuestIdentity();
                    newGuest.setGuestId(guestId);
                    return guestIdentityRepository.save(newGuest);
                  });
      session.setGuest(guest);

      // Check guest limits
      int limit = appProperties.getGuest().getPracticeLimitPerType();
      Instant dayAgo = Instant.now().minus(24, ChronoUnit.HOURS);
      long recentSessions =
          sessionRepository.countByGuestIdAndTypeAndStartedAtAfter(guestId, type.name(), dayAgo);

      if (recentSessions >= limit) {
        PracticeSessionResponse response = new PracticeSessionResponse();
        response.setLimitReached(true);
        response.setQuestionsAvailable(0);
        response.setType(type.name());
        return response;
      }
    }

    session = sessionRepository.save(session);

    PracticeSessionResponse response = new PracticeSessionResponse();
    response.setSessionId(session.getId());
    response.setType(type.name());
    response.setLimitReached(false);
    response.setQuestionsAvailable(
        user != null ? 100 : appProperties.getGuest().getPracticeLimitPerType());
    return response;
  }

  @Transactional(readOnly = true)
  public List<QuestionResponse> getQuestions(UUID sessionId) {
    PracticeSession session =
        sessionRepository.findById(sessionId).orElseThrow(() -> new RuntimeException("Session not found"));

    // Get recent question IDs to exclude
    List<UUID> excludeIds = new ArrayList<>();
    if (session.getUser() != null) {
      excludeIds =
          recentQuestionRepository
              .findRecentQuestionIdsByUserAndType(
                  session.getUser().getId(), session.getType().name())
              .stream()
              .limit(appProperties.getGuest().getRecentQuestionsCacheSize())
              .collect(Collectors.toList());
    } else if (session.getGuest() != null) {
      excludeIds =
          recentQuestionRepository
              .findRecentQuestionIdsByGuestAndType(
                  session.getGuest().getGuestId(), session.getType().name())
              .stream()
              .limit(appProperties.getGuest().getRecentQuestionsCacheSize())
              .collect(Collectors.toList());
    }

    // Get random PRACTICE questions only (is_exam_question = false)
    int limit =
        session.getUser() != null ? 10 : appProperties.getGuest().getPracticeLimitPerType();
    List<Question> questions;
    if (excludeIds.isEmpty()) {
      questions = questionRepository.findRandomPracticeQuestionsByType(session.getType().name(), limit);
    } else {
      questions =
          questionRepository.findRandomPracticeQuestionsByTypeExcluding(
              session.getType().name(), excludeIds, limit);

      // Fallback: If no practice questions available after exclusion, allow repetition
      // This handles cases where the user has seen all available practice questions
      if (questions.isEmpty()) {
        questions = questionRepository.findRandomPracticeQuestionsByType(session.getType().name(), limit);
      }
    }

    return questions.stream().map(this::mapToQuestionResponse).collect(Collectors.toList());
  }

  @Transactional
  public AnswerResponse submitAnswer(UUID sessionId, SubmitAnswerRequest request) {
    PracticeSession session =
        sessionRepository.findById(sessionId).orElseThrow(() -> new RuntimeException("Session not found"));
    Question question =
        questionRepository
            .findById(request.getQuestionId())
            .orElseThrow(() -> new RuntimeException("Question not found"));

    // Validate answer
    boolean isCorrect = validateAnswer(question, request);

    // Save answer
    PracticeUserAnswer answer = new PracticeUserAnswer();
    answer.setSession(session);
    answer.setQuestion(question);
    answer.setUserAnswerRaw(request.getTextAnswer());
    if (request.getSelectedOptionId() != null) {
      optionRepository.findById(request.getSelectedOptionId()).ifPresent(answer::setSelectedOption);
    }
    answer.setIsCorrect(isCorrect);
    answer.setTimeMs(request.getTimeMs());
    answerRepository.save(answer);

    // Track recent question
    RecentQuestion recent = new RecentQuestion();
    recent.setQuestion(question);
    recent.setQuestionType(question.getType());
    if (session.getUser() != null) {
      recent.setUser(session.getUser());
    } else {
      recent.setGuest(session.getGuest());
    }
    recentQuestionRepository.save(recent);

    AnswerResponse response = new AnswerResponse();
    response.setCorrect(isCorrect);
    response.setExplanation(question.getExplanation());
    return response;
  }

  @Transactional
  public PracticeSummaryResponse finishSession(UUID sessionId) {
    PracticeSession session =
        sessionRepository.findById(sessionId).orElseThrow(() -> new RuntimeException("Session not found"));
    session.setEndedAt(Instant.now());
    sessionRepository.save(session);

    List<PracticeUserAnswer> answers = answerRepository.findBySessionIdOrderByAnsweredAt(sessionId);
    long correctCount = answers.stream().filter(PracticeUserAnswer::getIsCorrect).count();
    int totalTimeMs = answers.stream().mapToInt(a -> a.getTimeMs() != null ? a.getTimeMs() : 0).sum();

    PracticeSummaryResponse response = new PracticeSummaryResponse();
    response.setTotalQuestions(answers.size());
    response.setCorrectAnswers((int) correctCount);
    response.setAccuracy(answers.isEmpty() ? 0.0 : (double) correctCount / answers.size() * 100);
    response.setTotalTimeMs(totalTimeMs);
    return response;
  }

  private boolean validateAnswer(Question question, SubmitAnswerRequest request) {
    // All questions are now multiple choice (SINGLE_CHOICE_IMAGE format)
    if (request.getSelectedOptionId() == null) {
      return false;
    }
    return optionRepository
        .findById(request.getSelectedOptionId())
        .map(QuestionOption::getIsCorrect)
        .orElse(false);
  }

  private QuestionResponse mapToQuestionResponse(Question question) {
    QuestionResponse response = new QuestionResponse();
    response.setId(question.getId());
    response.setType(question.getType().name());
    response.setFormat(question.getFormat().name());
    response.setPromptText(question.getPromptText());
    response.setPromptImageUrl(question.getPromptImageUrl());

    // Load options for all question formats (now all questions have multiple-choice options)
    List<QuestionOption> options =
        optionRepository.findByQuestionIdOrderByOptionOrder(question.getId());
    if (!options.isEmpty()) {
      // Defensive validation: Check for data integrity issues
      validateQuestionIntegrity(question, options);

      response.setOptions(
          options.stream()
              .map(
                  opt -> {
                    QuestionOptionResponse optResp = new QuestionOptionResponse();
                    optResp.setId(opt.getId());
                    optResp.setText(opt.getText());
                    optResp.setImageUrl(opt.getImageUrl());
                    optResp.setOptionOrder(opt.getOptionOrder());
                    return optResp;
                  })
              .collect(Collectors.toList()));
    }

    return response;
  }

  /**
   * Defensive validation to detect data integrity issues with question options. Logs warnings if
   * multiple or zero correct answers are found.
   *
   * @param question The question being validated
   * @param options The list of options for the question
   */
  private void validateQuestionIntegrity(Question question, List<QuestionOption> options) {
    if (question.getFormat() != QuestionFormat.SINGLE_CHOICE_IMAGE) {
      return; // Only validate SINGLE_CHOICE_IMAGE format
    }

    long correctCount = options.stream().filter(opt -> Boolean.TRUE.equals(opt.getIsCorrect())).count();

    if (correctCount == 0) {
      logger.warn(
          "DATA INTEGRITY ISSUE: Question {} (type: {}) has ZERO correct answers. "
              + "This will cause all user answers to be marked incorrect.",
          question.getId(),
          question.getType());
    } else if (correctCount > 1) {
      logger.warn(
          "DATA INTEGRITY ISSUE: Question {} (type: {}) has {} correct answers. "
              + "Only one correct answer is allowed. This may cause incorrect scoring.",
          question.getId(),
          question.getType(),
          correctCount);
    }
  }
}

