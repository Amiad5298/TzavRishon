package com.tzavrishon.repository;

import com.tzavrishon.domain.AcceptableAnswer;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AcceptableAnswerRepository extends JpaRepository<AcceptableAnswer, UUID> {
  List<AcceptableAnswer> findByQuestionId(UUID questionId);
}

