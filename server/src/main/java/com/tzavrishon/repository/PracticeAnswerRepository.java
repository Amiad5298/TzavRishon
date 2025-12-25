package com.tzavrishon.repository;

import com.tzavrishon.domain.PracticeAnswer;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PracticeAnswerRepository extends JpaRepository<PracticeAnswer, UUID> {
  List<PracticeAnswer> findBySessionIdOrderByAnsweredAt(UUID sessionId);
  
  List<PracticeAnswer> findBySession_IdOrderByAnsweredAt(UUID sessionId);
}

