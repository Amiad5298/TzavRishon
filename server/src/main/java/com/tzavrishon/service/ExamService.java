package com.tzavrishon.service;

import com.tzavrishon.config.AppProperties;
import com.tzavrishon.domain.*;
import com.tzavrishon.dto.*;
import com.tzavrishon.repository.*;
import com.tzavrishon.security.UserPrincipal;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExamService {
  private static final Logger logger = LoggerFactory.getLogger(ExamService.class);

  private final ExamAttemptRepository attemptRepository;
  private final ExamSectionRepository sectionRepository;
  private final ExamUserAnswerRepository answerRepository;
  private final QuestionRepository questionRepository;
  private final QuestionOptionRepository optionRepository;
  private final UserRepository userRepository;
  private final AppProperties appProperties;

  public ExamService(
      ExamAttemptRepository attemptRepository,
      ExamSectionRepository sectionRepository,
      ExamUserAnswerRepository answerRepository,
      QuestionRepository questionRepository,
      QuestionOptionRepository optionRepository,
      UserRepository userRepository,
      AppProperties appProperties) {
    this.attemptRepository = attemptRepository;
    this.sectionRepository = sectionRepository;
    this.answerRepository = answerRepository;
    this.questionRepository = questionRepository;
    this.optionRepository = optionRepository;
    this.userRepository = userRepository;
    this.appProperties = appProperties;
  }

  @Transactional
  public ExamAttemptResponse startExam(UserPrincipal user) {
    if (user == null) {
      throw new RuntimeException("Only authenticated users can take exams");
    }

    User userEntity =
        userRepository.findById(user.getId()).orElseThrow(() -> new RuntimeException("User not found"));

    ExamAttempt attempt = new ExamAttempt();
    attempt.setUser(userEntity);
    attempt = attemptRepository.save(attempt);

    // Parse section configurations
    Map<QuestionType, Integer> sectionCounts = parseSectionCounts();
    Map<QuestionType, Integer> sectionDurations = parseSectionDurations();

    // Create sections in order
    QuestionType[] types = {
      QuestionType.VERBAL_ANALOGY,
      QuestionType.SHAPE_ANALOGY,
      QuestionType.INSTRUCTIONS_DIRECTIONS,
      QuestionType.QUANTITATIVE
    };

    for (int i = 0; i < types.length; i++) {
      ExamSection section = new ExamSection();
      section.setAttempt(attempt);
      section.setType(types[i]);
      section.setOrderIndex(i);
      section.setDurationSeconds(sectionDurations.getOrDefault(types[i], 600));
      section.setLocked(false);
      sectionRepository.save(section);
    }

    // Start the first section
    List<ExamSection> sections = sectionRepository.findByAttemptIdOrderByOrderIndex(attempt.getId());
    if (!sections.isEmpty()) {
      ExamSection firstSection = sections.get(0);
      firstSection.setStartedAt(Instant.now());
      sectionRepository.save(firstSection);
    }

    return mapToExamAttemptResponse(attempt);
  }

  @Transactional
  public CurrentSectionResponse getCurrentSection(UUID attemptId) {
    ExamAttempt attempt =
        attemptRepository.findById(attemptId).orElseThrow(() -> new RuntimeException("Attempt not found"));

    Optional<ExamSection> currentSectionOpt =
        sectionRepository.findFirstByAttemptIdAndLockedFalseOrderByOrderIndexAsc(attemptId);

    if (currentSectionOpt.isEmpty()) {
      throw new RuntimeException("No unlocked sections available");
    }

    ExamSection section = currentSectionOpt.get();

    // Check if section has expired
    if (section.getStartedAt() != null) {
      long elapsedSeconds = Duration.between(section.getStartedAt(), Instant.now()).getSeconds();
      if (elapsedSeconds >= section.getDurationSeconds()) {
        // Auto-lock expired section
        section.setLocked(true);
        section.setEndedAt(Instant.now());
        sectionRepository.save(section);

        // Start next section if available
        Optional<ExamSection> nextSectionOpt =
            sectionRepository.findFirstByAttemptIdAndLockedFalseOrderByOrderIndexAsc(attemptId);
        if (nextSectionOpt.isPresent()) {
          ExamSection nextSection = nextSectionOpt.get();
          nextSection.setStartedAt(Instant.now());
          sectionRepository.save(nextSection);
          return buildCurrentSectionResponse(nextSection);
        } else {
          throw new RuntimeException("Exam completed");
        }
      }
    }

    return buildCurrentSectionResponse(section);
  }

  @Transactional
  public AnswerResponse submitExamAnswer(UUID attemptId, SubmitAnswerRequest request) {
    Optional<ExamSection> currentSectionOpt =
        sectionRepository.findFirstByAttemptIdAndLockedFalseOrderByOrderIndexAsc(attemptId);

    if (currentSectionOpt.isEmpty()) {
      throw new RuntimeException("No active section");
    }

    ExamSection section = currentSectionOpt.get();

    Question question =
        questionRepository
            .findById(request.getQuestionId())
            .orElseThrow(() -> new RuntimeException("Question not found"));

    // Validate question belongs to current section
    if (question.getType() != section.getType()) {
      throw new RuntimeException("Question does not belong to current section");
    }

    // Check if already answered
    List<ExamUserAnswer> existingAnswers = answerRepository.findBySectionIdOrderByOrderIndex(section.getId());
    boolean alreadyAnswered =
        existingAnswers.stream()
            .anyMatch(a -> a.getQuestion().getId().equals(request.getQuestionId()));
    if (alreadyAnswered) {
      throw new RuntimeException("Question already answered");
    }

    // Validate answer
    boolean isCorrect = validateAnswer(question, request);

    // Save answer
    ExamUserAnswer answer = new ExamUserAnswer();
    answer.setSection(section);
    answer.setQuestion(question);
    answer.setUserAnswerRaw(request.getTextAnswer());
    if (request.getSelectedOptionId() != null) {
      optionRepository.findById(request.getSelectedOptionId()).ifPresent(answer::setSelectedOption);
    }
    answer.setIsCorrect(isCorrect);
    answer.setTimeMs(request.getTimeMs());
    answer.setOrderIndex(existingAnswers.size());
    answerRepository.save(answer);

    AnswerResponse response = new AnswerResponse();
    response.setCorrect(isCorrect);
    return response;
  }

  @Transactional
  public void confirmFinishSection(UUID attemptId) {
    Optional<ExamSection> currentSectionOpt =
        sectionRepository.findFirstByAttemptIdAndLockedFalseOrderByOrderIndexAsc(attemptId);

    if (currentSectionOpt.isEmpty()) {
      throw new RuntimeException("No active section");
    }

    ExamSection section = currentSectionOpt.get();
    section.setLocked(true);
    section.setEndedAt(Instant.now());

    // Calculate section score
    List<ExamUserAnswer> answers = answerRepository.findBySectionIdOrderByOrderIndex(section.getId());
    long correctCount = answers.stream().filter(ExamUserAnswer::getIsCorrect).count();
    section.setScoreSection((int) correctCount);
    sectionRepository.save(section);

    // Start next section if available
    Optional<ExamSection> nextSectionOpt =
        sectionRepository.findFirstByAttemptIdAndLockedFalseOrderByOrderIndexAsc(attemptId);
    if (nextSectionOpt.isPresent()) {
      ExamSection nextSection = nextSectionOpt.get();
      nextSection.setStartedAt(Instant.now());
      sectionRepository.save(nextSection);
    }
  }

  @Transactional
  public ExamSummaryResponse finishExam(UUID attemptId) {
    ExamAttempt attempt =
        attemptRepository.findById(attemptId).orElseThrow(() -> new RuntimeException("Attempt not found"));

    // Lock any remaining sections
    List<ExamSection> sections = sectionRepository.findByAttemptIdOrderByOrderIndex(attemptId);
    for (ExamSection section : sections) {
      if (!section.getLocked()) {
        section.setLocked(true);
        section.setEndedAt(Instant.now());
        List<ExamUserAnswer> answers = answerRepository.findBySectionIdOrderByOrderIndex(section.getId());
        long correctCount = answers.stream().filter(ExamUserAnswer::getIsCorrect).count();
        section.setScoreSection((int) correctCount);
        sectionRepository.save(section);
      }
    }

    // Calculate total score out of 90
    List<ExamUserAnswer> allAnswers = answerRepository.findByAttemptIdOrderBySection(attemptId);
    long totalCorrect = allAnswers.stream().filter(ExamUserAnswer::getIsCorrect).count();
    int totalQuestions = allAnswers.size();
    int score90 = totalQuestions > 0 ? (int) Math.round(90.0 * totalCorrect / totalQuestions) : 0;

    attempt.setCompletedAt(Instant.now());
    attempt.setTotalScore90(score90);
    attemptRepository.save(attempt);

    return buildExamSummary(attempt, sections);
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

  private CurrentSectionResponse buildCurrentSectionResponse(ExamSection section) {
    CurrentSectionResponse response = new CurrentSectionResponse();
    response.setSectionId(section.getId());
    response.setType(section.getType().name());
    response.setOrderIndex(section.getOrderIndex());

    if (section.getStartedAt() != null) {
      long elapsedSeconds = Duration.between(section.getStartedAt(), Instant.now()).getSeconds();
      long remaining = section.getDurationSeconds() - elapsedSeconds;
      response.setRemainingTimeSeconds(Math.max(0, remaining));
      response.setExpired(remaining <= 0);
    } else {
      response.setRemainingTimeSeconds((long) section.getDurationSeconds());
      response.setExpired(false);
    }

    // Get EXAM questions only for this section (is_exam_question = true)
    Map<QuestionType, Integer> sectionCounts = parseSectionCounts();
    int questionCount = sectionCounts.getOrDefault(section.getType(), 10);
    List<Question> questions =
        questionRepository.findRandomExamQuestionsByType(section.getType().name(), questionCount);
    response.setQuestions(
        questions.stream().map(this::mapToQuestionResponse).collect(Collectors.toList()));

    // Get answered question IDs
    List<ExamUserAnswer> answers = answerRepository.findBySectionIdOrderByOrderIndex(section.getId());
    response.setAnsweredQuestionIds(
        answers.stream().map(a -> a.getQuestion().getId()).collect(Collectors.toList()));

    return response;
  }

  private ExamSummaryResponse buildExamSummary(ExamAttempt attempt, List<ExamSection> sections) {
    ExamSummaryResponse response = new ExamSummaryResponse();
    response.setTotalScore90(attempt.getTotalScore90());

    List<ExamAnswer> allAnswers = answerRepository.findByAttemptIdOrderBySection(attempt.getId());
    long totalCorrect = allAnswers.stream().filter(ExamAnswer::getIsCorrect).count();
    response.setTotalQuestions(allAnswers.size());
    response.setCorrectAnswers((int) totalCorrect);

    // Calculate total time: createdAt to completedAt
    if (attempt.getCreatedAt() != null && attempt.getCompletedAt() != null) {
      long totalSeconds = java.time.Duration.between(
          attempt.getCreatedAt(), 
          attempt.getCompletedAt()
      ).getSeconds();
      response.setTotalTimeSeconds(totalSeconds);
    }

    for (ExamSection section : sections) {
      List<ExamUserAnswer> sectionAnswers =
          answerRepository.findBySectionIdOrderByOrderIndex(section.getId());
      long sectionCorrect = sectionAnswers.stream().filter(ExamUserAnswer::getIsCorrect).count();

      SectionScore score = new SectionScore();
      score.setCorrect((int) sectionCorrect);
      score.setTotal(sectionAnswers.size());
      score.setAccuracy(
          sectionAnswers.isEmpty() ? 0.0 : (double) sectionCorrect / sectionAnswers.size() * 100);

      // Calculate section time: startedAt to endedAt
      if (section.getStartedAt() != null && section.getEndedAt() != null) {
        long sectionSeconds = java.time.Duration.between(
            section.getStartedAt(), 
            section.getEndedAt()
        ).getSeconds();
        score.setTimeSpentSeconds(sectionSeconds);
      }

      switch (section.getType()) {
        case VERBAL_ANALOGY:
          response.setVerbalAnalogy(score);
          break;
        case SHAPE_ANALOGY:
          response.setShapeAnalogy(score);
          break;
        case INSTRUCTIONS_DIRECTIONS:
          response.setInstructionsDirections(score);
          break;
        case QUANTITATIVE:
          response.setQuantitative(score);
          break;
      }
    }

    return response;
  }

  private ExamAttemptResponse mapToExamAttemptResponse(ExamAttempt attempt) {
    ExamAttemptResponse response = new ExamAttemptResponse();
    response.setAttemptId(attempt.getId());

    List<ExamSection> sections = sectionRepository.findByAttemptIdOrderByOrderIndex(attempt.getId());
    response.setSections(
        sections.stream()
            .map(
                s -> {
                  ExamSectionInfo info = new ExamSectionInfo();
                  info.setSectionId(s.getId());
                  info.setType(s.getType().name());
                  info.setOrderIndex(s.getOrderIndex());
                  info.setDurationSeconds(s.getDurationSeconds());
                  info.setLocked(s.getLocked());
                  return info;
                })
            .collect(Collectors.toList()));

    return response;
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

    long correctCount =
        options.stream().filter(opt -> Boolean.TRUE.equals(opt.getIsCorrect())).count();

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

  private Map<QuestionType, Integer> parseSectionCounts() {
    Map<QuestionType, Integer> counts = new HashMap<>();
    String config = appProperties.getExam().getSectionCounts();
    for (String pair : config.split(",")) {
      String[] parts = pair.split(":");
      if (parts.length == 2) {
        try {
          QuestionType type = QuestionType.valueOf(parts[0].trim());
          int count = Integer.parseInt(parts[1].trim());
          counts.put(type, count);
        } catch (Exception e) {
          // Ignore invalid config
        }
      }
    }
    return counts;
  }

  private Map<QuestionType, Integer> parseSectionDurations() {
    Map<QuestionType, Integer> durations = new HashMap<>();
    String config = appProperties.getExam().getSectionDurations();
    for (String pair : config.split(",")) {
      String[] parts = pair.split(":");
      if (parts.length == 2) {
        try {
          QuestionType type = QuestionType.valueOf(parts[0].trim());
          int duration = Integer.parseInt(parts[1].trim());
          durations.put(type, duration);
        } catch (Exception e) {
          // Ignore invalid config
        }
      }
    }
    return durations;
  }
}

