package com.tzavrishon.repository;

import com.tzavrishon.domain.PracticeUserAnswer;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PracticeUserAnswerRepository extends JpaRepository<PracticeUserAnswer, UUID> {
  List<PracticeUserAnswer> findBySessionIdOrderByAnsweredAt(UUID sessionId);

  List<PracticeUserAnswer> findBySession_IdOrderByAnsweredAt(UUID sessionId);
}

