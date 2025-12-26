package com.tzavrishon.service;

import com.tzavrishon.domain.*;
import com.tzavrishon.dto.*;
import com.tzavrishon.dto.PracticeStatsResponse.DailyPracticeVolume;
import com.tzavrishon.dto.PracticeStatsResponse.TypePracticeStats;
import com.tzavrishon.dto.ExamAttemptListItem.SectionBreakdown;
import com.tzavrishon.repository.*;
import com.tzavrishon.security.UserPrincipal;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProgressService {
  private final ExamAttemptRepository attemptRepository;
  private final ExamUserAnswerRepository examAnswerRepository;
  private final ExamSectionRepository sectionRepository;
  private final PracticeSessionRepository sessionRepository;
  private final PracticeUserAnswerRepository practiceAnswerRepository;

  public ProgressService(
      ExamAttemptRepository attemptRepository,
      ExamUserAnswerRepository examAnswerRepository,
      ExamSectionRepository sectionRepository,
      PracticeSessionRepository sessionRepository,
      PracticeUserAnswerRepository practiceAnswerRepository) {
    this.attemptRepository = attemptRepository;
    this.examAnswerRepository = examAnswerRepository;
    this.sectionRepository = sectionRepository;
    this.sessionRepository = sessionRepository;
    this.practiceAnswerRepository = practiceAnswerRepository;
  }

  @Transactional(readOnly = true)
  public ProgressSummaryResponse getSummary(UserPrincipal user, LocalDate startDate, LocalDate endDate) {
    if (user == null) {
      throw new RuntimeException("Only authenticated users can view progress");
    }

    List<ExamAttempt> attempts = attemptRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    
    // Filter by date range if provided
    if (startDate != null || endDate != null) {
      Instant start = startDate != null ? startDate.atStartOfDay(ZoneId.systemDefault()).toInstant() : Instant.MIN;
      Instant end = endDate != null ? endDate.atTime(23, 59, 59).toInstant(ZoneOffset.UTC) : Instant.MAX;
      attempts = attempts.stream()
          .filter(a -> !a.getCreatedAt().isBefore(start) && !a.getCreatedAt().isAfter(end))
          .collect(Collectors.toList());
    }

    ProgressSummaryResponse response = new ProgressSummaryResponse();
    response.setTotalAttempts(attempts.size());

    // Calculate overall stats
    List<ExamAnswer> allAnswers = new ArrayList<>();
    for (ExamAttempt attempt : attempts) {
      allAnswers.addAll(examAnswerRepository.findByAttemptIdOrderBySection(attempt.getId()));
    }

    if (!allAnswers.isEmpty()) {
      long totalCorrect = allAnswers.stream().filter(ExamAnswer::getIsCorrect).count();
      response.setOverallAccuracy((double) totalCorrect / allAnswers.size() * 100);

      int totalTime = allAnswers.stream().mapToInt(a -> a.getTimeMs() != null ? a.getTimeMs() : 0).sum();
      response.setAvgTimePerQuestionMs(totalTime / allAnswers.size());
    } else {
      response.setOverallAccuracy(0.0);
      response.setAvgTimePerQuestionMs(0);
    }

    // Calculate improvement (compare first half vs second half of attempts)
    response.setImprovementPercent(calculateImprovement(attempts));

    // Stats by type
    Map<QuestionType, List<ExamAnswer>> byType = new HashMap<>();
    for (QuestionType type : QuestionType.values()) {
      byType.put(type, new ArrayList<>());
    }
    for (ExamAnswer answer : allAnswers) {
      byType.get(answer.getQuestion().getType()).add(answer);
    }

    List<TypeStats> statsByType = new ArrayList<>();
    for (Map.Entry<QuestionType, List<ExamAnswer>> entry : byType.entrySet()) {
      if (!entry.getValue().isEmpty()) {
        TypeStats stats = new TypeStats();
        stats.setType(entry.getKey().name());
        stats.setTotalQuestions(entry.getValue().size());
        long correct = entry.getValue().stream().filter(ExamAnswer::getIsCorrect).count();
        stats.setCorrectAnswers((int) correct);
        stats.setAccuracy((double) correct / entry.getValue().size() * 100);
        statsByType.add(stats);
      }
    }
    response.setStatsByType(statsByType);

    // Recent attempts
    List<AttemptSummary> recentAttempts =
        attempts.stream()
            .limit(10)
            .map(
                attempt -> {
                  AttemptSummary summary = new AttemptSummary();
                  summary.setAttemptId(attempt.getId().toString());
                  summary.setCreatedAt(attempt.getCreatedAt().toString());
                  summary.setScore90(attempt.getTotalScore90());

                  List<ExamAnswer> attemptAnswers =
                      examAnswerRepository.findByAttemptIdOrderBySection(attempt.getId());
                  long correct =
                      attemptAnswers.stream().filter(ExamAnswer::getIsCorrect).count();
                  summary.setCorrectAnswers((int) correct);
                  summary.setTotalQuestions(attemptAnswers.size());
                  return summary;
                })
            .collect(Collectors.toList());
    response.setRecentAttempts(recentAttempts);

    return response;
  }

  @Transactional(readOnly = true)
  public TrendResponse getTrend(UserPrincipal user) {
    if (user == null) {
      throw new RuntimeException("Only authenticated users can view trends");
    }

    List<ExamAttempt> attempts = attemptRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

    TrendResponse response = new TrendResponse();
    List<TrendPoint> trends = new ArrayList<>();

    for (ExamAttempt attempt : attempts) {
      List<ExamAnswer> answers =
          examAnswerRepository.findByAttemptIdOrderBySection(attempt.getId());

      Map<QuestionType, List<ExamAnswer>> byType = new HashMap<>();
      for (QuestionType type : QuestionType.values()) {
        byType.put(type, new ArrayList<>());
      }
      for (ExamAnswer answer : answers) {
        byType.get(answer.getQuestion().getType()).add(answer);
      }

      for (Map.Entry<QuestionType, List<ExamAnswer>> entry : byType.entrySet()) {
        if (!entry.getValue().isEmpty()) {
          TrendPoint point = new TrendPoint();
          point.setDate(attempt.getCreatedAt().toString());
          point.setType(entry.getKey().name());
          long correct = entry.getValue().stream().filter(ExamAnswer::getIsCorrect).count();
          point.setAccuracy((double) correct / entry.getValue().size() * 100);
          trends.add(point);
        }
      }
    }

    response.setTrends(trends);
    return response;
  }

  @Transactional(readOnly = true)
  public ExamSummaryResponse getAttemptDetail(UUID attemptId, UserPrincipal user) {
    if (user == null) {
      throw new RuntimeException("Only authenticated users can view attempt details");
    }

    ExamAttempt attempt =
        attemptRepository.findById(attemptId).orElseThrow(() -> new RuntimeException("Attempt not found"));

    if (!attempt.getUser().getId().equals(user.getId())) {
      throw new RuntimeException("Unauthorized");
    }

    // Build full exam summary with section details
    return buildFullExamSummary(attempt);
  }

  private ExamSummaryResponse buildFullExamSummary(ExamAttempt attempt) {
    ExamSummaryResponse response = new ExamSummaryResponse();
    response.setTotalScore90(attempt.getTotalScore90());

    List<ExamAnswer> allAnswers = examAnswerRepository.findByAttemptIdOrderBySection(attempt.getId());
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

    // Fetch sections from repository (don't rely on lazy loading)
    List<ExamSection> sections = sectionRepository.findByAttemptIdOrderByOrderIndex(attempt.getId());

    // Build section scores
    for (ExamSection section : sections) {
      List<ExamAnswer> sectionAnswers = allAnswers.stream()
          .filter(a -> a.getQuestion().getType() == section.getType())
          .collect(Collectors.toList());
      long sectionCorrect = sectionAnswers.stream().filter(ExamAnswer::getIsCorrect).count();

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

      setSectionScore(response, section.getType(), score);
    }

    return response;
  }

  private void setSectionScore(ExamSummaryResponse response, QuestionType type, SectionScore score) {
    switch (type) {
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

  private Double calculateImprovement(List<ExamAttempt> attempts) {
    if (attempts.size() < 2) {
      return 0.0;
    }

    int mid = attempts.size() / 2;
    List<ExamAttempt> firstHalf = attempts.subList(mid, attempts.size());
    List<ExamAttempt> secondHalf = attempts.subList(0, mid);

    double firstAvg = firstHalf.stream().mapToInt(ExamAttempt::getTotalScore90).average().orElse(0.0);
    double secondAvg =
        secondHalf.stream().mapToInt(ExamAttempt::getTotalScore90).average().orElse(0.0);

    if (firstAvg == 0) {
      return 0.0;
    }

    return ((secondAvg - firstAvg) / firstAvg) * 100;
  }

  @Transactional(readOnly = true)
  public PracticeStatsResponse getPracticeSummary(UserPrincipal user, LocalDate startDate, LocalDate endDate) {
    if (user == null) {
      throw new RuntimeException("Only authenticated users can view practice stats");
    }

    // Get practice sessions
    List<PracticeSession> sessions = sessionRepository.findByUser_IdOrderByStartedAtDesc(user.getId());
    
    // Filter by date range
    if (startDate != null || endDate != null) {
      Instant start = startDate != null ? startDate.atStartOfDay(ZoneId.systemDefault()).toInstant() : Instant.MIN;
      Instant end = endDate != null ? endDate.atTime(23, 59, 59).toInstant(ZoneOffset.UTC) : Instant.MAX;
      sessions = sessions.stream()
          .filter(s -> !s.getStartedAt().isBefore(start) && !s.getStartedAt().isAfter(end))
          .collect(Collectors.toList());
    }

    PracticeStatsResponse response = new PracticeStatsResponse();
    
    // Get all practice answers
    List<PracticeAnswer> allAnswers = new ArrayList<>();
    for (PracticeSession session : sessions) {
      allAnswers.addAll(practiceAnswerRepository.findBySession_IdOrderByAnsweredAt(session.getId()));
    }

    if (allAnswers.isEmpty()) {
      response.setStatsByType(new HashMap<>());
      response.setDailyVolume(new ArrayList<>());
      response.setCurrentStreak(0);
      response.setOverallAccuracy(0.0);
      response.setTotalQuestions(0);
      response.setAvgTimePerQuestionMs(0.0);
      return response;
    }

    // Calculate overall stats
    long totalCorrect = allAnswers.stream().filter(PracticeAnswer::getIsCorrect).count();
    response.setTotalQuestions(allAnswers.size());
    response.setOverallAccuracy((double) totalCorrect / allAnswers.size() * 100);
    
    double avgTime = allAnswers.stream()
        .mapToInt(a -> a.getTimeMs() != null ? a.getTimeMs() : 0)
        .average()
        .orElse(0.0);
    response.setAvgTimePerQuestionMs(avgTime);

    // Stats by type
    Map<QuestionType, List<PracticeAnswer>> byType = new HashMap<>();
    for (QuestionType type : QuestionType.values()) {
      byType.put(type, new ArrayList<>());
    }
    for (PracticeAnswer answer : allAnswers) {
      if (answer.getQuestion() != null) {
        byType.get(answer.getQuestion().getType()).add(answer);
      }
    }

    Map<String, TypePracticeStats> statsByType = new HashMap<>();
    for (Map.Entry<QuestionType, List<PracticeAnswer>> entry : byType.entrySet()) {
      if (!entry.getValue().isEmpty()) {
        TypePracticeStats stats = new TypePracticeStats();
        stats.setType(entry.getKey().name());
        stats.setTotalQuestions(entry.getValue().size());
        long correct = entry.getValue().stream().filter(PracticeAnswer::getIsCorrect).count();
        stats.setCorrectAnswers((int) correct);
        stats.setAccuracy((double) correct / entry.getValue().size() * 100);
        
        double typeAvgTime = entry.getValue().stream()
            .mapToInt(a -> a.getTimeMs() != null ? a.getTimeMs() : 0)
            .average()
            .orElse(0.0);
        stats.setAvgTimeMs(typeAvgTime);
        
        // Calculate mastery score (accuracy weighted by recency)
        double recencyWeight = calculateRecencyWeight(entry.getValue());
        stats.setMasteryScore(stats.getAccuracy() * recencyWeight);
        
        statsByType.put(entry.getKey().name(), stats);
      }
    }
    response.setStatsByType(statsByType);

    // Daily volume
    Map<LocalDate, List<PracticeAnswer>> byDate = allAnswers.stream()
        .collect(Collectors.groupingBy(a -> 
            LocalDateTime.ofInstant(a.getAnsweredAt(), ZoneId.systemDefault()).toLocalDate()));
    
    List<DailyPracticeVolume> dailyVolume = byDate.entrySet().stream()
        .map(entry -> {
          DailyPracticeVolume vol = new DailyPracticeVolume();
          vol.setDate(entry.getKey());
          vol.setQuestionCount(entry.getValue().size());
          long dayCorrect = entry.getValue().stream().filter(PracticeAnswer::getIsCorrect).count();
          vol.setAccuracy((double) dayCorrect / entry.getValue().size() * 100);
          return vol;
        })
        .sorted(Comparator.comparing(DailyPracticeVolume::getDate))
        .collect(Collectors.toList());
    response.setDailyVolume(dailyVolume);

    // Calculate streak
    int streak = calculateStreak(sessions);
    response.setCurrentStreak(streak);

    return response;
  }

  @Transactional(readOnly = true)
  public TrendResponse getPracticeTrend(UserPrincipal user, LocalDate startDate, LocalDate endDate) {
    if (user == null) {
      throw new RuntimeException("Only authenticated users can view practice trends");
    }

    List<PracticeSession> sessions = sessionRepository.findByUser_IdOrderByStartedAtDesc(user.getId());
    
    // Filter by date range
    if (startDate != null || endDate != null) {
      Instant start = startDate != null ? startDate.atStartOfDay(ZoneId.systemDefault()).toInstant() : Instant.MIN;
      Instant end = endDate != null ? endDate.atTime(23, 59, 59).toInstant(ZoneOffset.UTC) : Instant.MAX;
      sessions = sessions.stream()
          .filter(s -> !s.getStartedAt().isBefore(start) && !s.getStartedAt().isAfter(end))
          .collect(Collectors.toList());
    }

    TrendResponse response = new TrendResponse();
    List<TrendPoint> trends = new ArrayList<>();

    for (PracticeSession session : sessions) {
      List<PracticeAnswer> answers = practiceAnswerRepository.findBySession_IdOrderByAnsweredAt(session.getId());
      
      if (!answers.isEmpty()) {
        // Group by type
        Map<QuestionType, List<PracticeAnswer>> byType = new HashMap<>();
        for (QuestionType type : QuestionType.values()) {
          byType.put(type, new ArrayList<>());
        }
        for (PracticeAnswer answer : answers) {
          if (answer.getQuestion() != null) {
            byType.get(answer.getQuestion().getType()).add(answer);
          }
        }

        for (Map.Entry<QuestionType, List<PracticeAnswer>> entry : byType.entrySet()) {
          if (!entry.getValue().isEmpty()) {
            TrendPoint point = new TrendPoint();
            point.setDate(session.getStartedAt().toString());
            point.setType(entry.getKey().name());
            long correct = entry.getValue().stream().filter(PracticeAnswer::getIsCorrect).count();
            point.setAccuracy((double) correct / entry.getValue().size() * 100);
            trends.add(point);
          }
        }
      }
    }

    response.setTrends(trends);
    return response;
  }

  @Transactional(readOnly = true)
  public ExamAttemptListResponse getRecentExamAttempts(UserPrincipal user, int limit) {
    if (user == null) {
      throw new RuntimeException("Only authenticated users can view exam attempts");
    }

    List<ExamAttempt> attempts = attemptRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    
    List<ExamAttemptListItem> items = attempts.stream()
        .limit(limit)
        .map(attempt -> {
          ExamAttemptListItem item = new ExamAttemptListItem();
          item.setAttemptId(attempt.getId());
          item.setCreatedAt(LocalDateTime.ofInstant(attempt.getCreatedAt(), ZoneId.systemDefault()));
          item.setScore90(attempt.getTotalScore90());
          
          List<ExamAnswer> answers = examAnswerRepository.findByAttemptIdOrderBySection(attempt.getId());
          if (!answers.isEmpty()) {
            long correct = answers.stream().filter(ExamAnswer::getIsCorrect).count();
            item.setAccuracy((double) correct / answers.size() * 100);
          } else {
            item.setAccuracy(0.0);
          }
          
          // Calculate duration
          if (attempt.getCompletedAt() != null) {
            long duration = ChronoUnit.SECONDS.between(attempt.getCreatedAt(), attempt.getCompletedAt());
            item.setDurationSeconds(duration);
          } else {
            item.setDurationSeconds(0);
          }
          
          // Section breakdown
          Map<String, SectionBreakdown> sections = new HashMap<>();
          Map<QuestionType, List<ExamAnswer>> byType = answers.stream()
              .collect(Collectors.groupingBy(a -> a.getQuestion().getType()));
          
          for (Map.Entry<QuestionType, List<ExamAnswer>> entry : byType.entrySet()) {
            SectionBreakdown breakdown = new SectionBreakdown();
            breakdown.setTotal(entry.getValue().size());
            breakdown.setAnswered((int) entry.getValue().stream()
                .filter(a -> a.getSelectedOption() != null || a.getUserAnswerRaw() != null)
                .count());
            breakdown.setSkipped(breakdown.getTotal() - breakdown.getAnswered());
            breakdown.setFlagged(0); // TODO: implement flagging
            
            long sectionCorrect = entry.getValue().stream().filter(ExamAnswer::getIsCorrect).count();
            breakdown.setAccuracy((double) sectionCorrect / entry.getValue().size() * 100);
            
            long timeSpent = entry.getValue().stream()
                .mapToLong(a -> a.getTimeMs() != null ? a.getTimeMs() : 0)
                .sum() / 1000;
            breakdown.setTimeSpentSeconds(timeSpent);
            
            sections.put(entry.getKey().name(), breakdown);
          }
          item.setSections(sections);
          
          return item;
        })
        .collect(Collectors.toList());

    ExamAttemptListResponse response = new ExamAttemptListResponse();
    response.setAttempts(items);
    return response;
  }

  private double calculateRecencyWeight(List<PracticeUserAnswer> answers) {
    if (answers.isEmpty()) {
      return 1.0;
    }

    Instant now = Instant.now();
    Instant mostRecent = answers.stream()
        .map(PracticeAnswer::getAnsweredAt)
        .max(Comparator.naturalOrder())
        .orElse(now);
    
    long daysSince = ChronoUnit.DAYS.between(mostRecent, now);
    
    // Weight: 1.0 if within last day, decays to 0.6 over 14 days
    if (daysSince <= 1) return 1.0;
    if (daysSince >= 14) return 0.6;
    return 1.0 - (daysSince / 14.0) * 0.4;
  }

  private int calculateStreak(List<PracticeSession> sessions) {
    if (sessions.isEmpty()) {
      return 0;
    }
    
    // Sort by date descending
    List<LocalDate> dates = sessions.stream()
        .map(s -> LocalDateTime.ofInstant(s.getStartedAt(), ZoneId.systemDefault()).toLocalDate())
        .distinct()
        .sorted(Comparator.reverseOrder())
        .collect(Collectors.toList());
    
    if (dates.isEmpty()) {
      return 0;
    }
    
    LocalDate today = LocalDate.now();
    LocalDate yesterday = today.minusDays(1);
    
    // Check if practiced today or yesterday
    if (!dates.get(0).equals(today) && !dates.get(0).equals(yesterday)) {
      return 0;
    }
    
    int streak = 1;
    for (int i = 1; i < dates.size(); i++) {
      long daysBetween = ChronoUnit.DAYS.between(dates.get(i), dates.get(i - 1));
      if (daysBetween == 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }
}

