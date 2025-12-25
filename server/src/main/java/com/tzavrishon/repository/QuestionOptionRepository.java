package com.tzavrishon.repository;

import com.tzavrishon.domain.QuestionOption;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionOptionRepository extends JpaRepository<QuestionOption, UUID> {
  List<QuestionOption> findByQuestionIdOrderByOptionOrder(UUID questionId);
}

