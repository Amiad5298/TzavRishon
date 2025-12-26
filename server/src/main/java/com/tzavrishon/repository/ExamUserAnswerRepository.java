package com.tzavrishon.repository;

import com.tzavrishon.domain.ExamUserAnswer;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamUserAnswerRepository extends JpaRepository<ExamUserAnswer, UUID> {
  List<ExamUserAnswer> findBySectionIdOrderByOrderIndex(UUID sectionId);

  @Query(
      "SELECT ea FROM ExamUserAnswer ea "
          + "JOIN ea.section es "
          + "WHERE es.attempt.id = :attemptId "
          + "ORDER BY es.orderIndex, ea.orderIndex")
  List<ExamUserAnswer> findByAttemptIdOrderBySection(@Param("attemptId") UUID attemptId);
}

