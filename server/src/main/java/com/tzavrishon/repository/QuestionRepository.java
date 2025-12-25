package com.tzavrishon.repository;

import com.tzavrishon.domain.Question;
import com.tzavrishon.domain.QuestionType;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {
  /**
   * Get random PRACTICE questions of a specific type, excluding recent ones.
   * Only returns questions where is_exam_question = false.
   * Uses PostgreSQL's RANDOM() function for randomization.
   */
  @Query(
      value =
          "SELECT * FROM questions q "
              + "WHERE q.type = :type "
              + "AND q.is_exam_question = false "
              + "AND q.id NOT IN (:excludeIds) "
              + "ORDER BY RANDOM() "
              + "LIMIT :limit",
      nativeQuery = true)
  List<Question> findRandomPracticeQuestionsByTypeExcluding(
      @Param("type") String type,
      @Param("excludeIds") List<UUID> excludeIds,
      @Param("limit") int limit);

  /**
   * Fallback for PRACTICE questions when excludeIds is empty.
   * Only returns questions where is_exam_question = false.
   */
  @Query(
      value =
          "SELECT * FROM questions q "
              + "WHERE q.type = :type "
              + "AND q.is_exam_question = false "
              + "ORDER BY RANDOM() "
              + "LIMIT :limit",
      nativeQuery = true)
  List<Question> findRandomPracticeQuestionsByType(@Param("type") String type, @Param("limit") int limit);

  /**
   * Get random EXAM questions of a specific type.
   * Only returns questions where is_exam_question = true.
   * Uses PostgreSQL's RANDOM() function for randomization.
   */
  @Query(
      value =
          "SELECT * FROM questions q "
              + "WHERE q.type = :type "
              + "AND q.is_exam_question = true "
              + "ORDER BY RANDOM() "
              + "LIMIT :limit",
      nativeQuery = true)
  List<Question> findRandomExamQuestionsByType(@Param("type") String type, @Param("limit") int limit);

  /**
   * @deprecated Use findRandomPracticeQuestionsByTypeExcluding instead for practice sessions
   * or findRandomExamQuestionsByType for exams.
   */
  @Deprecated
  @Query(
      value =
          "SELECT * FROM questions q "
              + "WHERE q.type = :type "
              + "AND q.id NOT IN (:excludeIds) "
              + "ORDER BY RANDOM() "
              + "LIMIT :limit",
      nativeQuery = true)
  List<Question> findRandomQuestionsByTypeExcluding(
      @Param("type") String type,
      @Param("excludeIds") List<UUID> excludeIds,
      @Param("limit") int limit);

  /**
   * @deprecated Use findRandomPracticeQuestionsByType instead for practice sessions
   * or findRandomExamQuestionsByType for exams.
   */
  @Deprecated
  @Query(
      value =
          "SELECT * FROM questions q "
              + "WHERE q.type = :type "
              + "ORDER BY RANDOM() "
              + "LIMIT :limit",
      nativeQuery = true)
  List<Question> findRandomQuestionsByType(@Param("type") String type, @Param("limit") int limit);

  List<Question> findByType(QuestionType type);
}

