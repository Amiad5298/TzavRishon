package com.tzavrishon.repository;

import com.tzavrishon.domain.PracticeSession;
import com.tzavrishon.domain.QuestionType;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PracticeSessionRepository extends JpaRepository<PracticeSession, UUID> {
  List<PracticeSession> findByUserIdOrderByStartedAtDesc(UUID userId);

  List<PracticeSession> findByGuest_GuestIdOrderByStartedAtDesc(UUID guestId);
  
  List<PracticeSession> findByUser_IdOrderByStartedAtDesc(UUID userId);

  /**
   * Count practice sessions for a guest of a specific type within a time window.
   * Used to enforce guest limits.
   */
  @Query(
      value =
          "SELECT COUNT(*) FROM practice_sessions ps "
              + "WHERE ps.guest_id = ?1 "
              + "AND ps.type = ?2 "
              + "AND ps.started_at >= ?3",
      nativeQuery = true)
  long countByGuestIdAndTypeAndStartedAtAfter(
      UUID guestId, String type, Instant since);
}

