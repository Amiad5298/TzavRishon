package com.tzavrishon.repository;

import com.tzavrishon.domain.ExamAttempt;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, UUID> {
  List<ExamAttempt> findByUserIdOrderByCreatedAtDesc(UUID userId);
}

