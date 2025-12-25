package com.tzavrishon.repository;

import com.tzavrishon.domain.QuestionType;
import com.tzavrishon.domain.RecentQuestion;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RecentQuestionRepository extends JpaRepository<RecentQuestion, UUID> {
  /**
   * Get recent question IDs for a user and type, limited to the most recent K questions.
   */
  @Query(
      value =
          "SELECT rq.question_id FROM recent_questions rq "
              + "WHERE rq.user_id = ?1 AND rq.question_type = ?2 "
              + "ORDER BY rq.served_at DESC",
      nativeQuery = true)
  List<UUID> findRecentQuestionIdsByUserAndType(
      UUID userId, String type);

  /**
   * Get recent question IDs for a guest and type.
   */
  @Query(
      value =
          "SELECT rq.question_id FROM recent_questions rq "
              + "WHERE rq.guest_id = ?1 AND rq.question_type = ?2 "
              + "ORDER BY rq.served_at DESC",
      nativeQuery = true)
  List<UUID> findRecentQuestionIdsByGuestAndType(
      UUID guestId, String type);

  /**
   * Delete old entries beyond the cache size to keep the table small.
   */
  @Modifying
  @Query("DELETE FROM RecentQuestion rq WHERE rq.servedAt < :cutoffTime")
  void deleteOlderThan(@Param("cutoffTime") Instant cutoffTime);
}

