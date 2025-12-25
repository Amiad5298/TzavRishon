package com.tzavrishon.repository;

import com.tzavrishon.domain.ExamSection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamSectionRepository extends JpaRepository<ExamSection, UUID> {
  List<ExamSection> findByAttemptIdOrderByOrderIndex(UUID attemptId);

  Optional<ExamSection> findFirstByAttemptIdAndLockedFalseOrderByOrderIndexAsc(UUID attemptId);
}

