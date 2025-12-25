package com.tzavrishon.repository;

import com.tzavrishon.domain.ExamAnswer;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamAnswerRepository extends JpaRepository<ExamAnswer, UUID> {
  List<ExamAnswer> findBySectionIdOrderByOrderIndex(UUID sectionId);

  @Query(
      "SELECT ea FROM ExamAnswer ea "
          + "JOIN ea.section es "
          + "WHERE es.attempt.id = :attemptId "
          + "ORDER BY es.orderIndex, ea.orderIndex")
  List<ExamAnswer> findByAttemptIdOrderBySection(@Param("attemptId") UUID attemptId);
}

