package com.tzavrishon.constraint;

import static org.junit.jupiter.api.Assertions.*;

import com.tzavrishon.domain.Question;
import com.tzavrishon.domain.QuestionFormat;
import com.tzavrishon.domain.QuestionOption;
import com.tzavrishon.domain.QuestionType;
import com.tzavrishon.repository.QuestionOptionRepository;
import com.tzavrishon.repository.QuestionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration test to verify the database constraint that enforces exactly one correct answer per
 * question.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class SingleCorrectAnswerConstraintTest {

  @Autowired private QuestionRepository questionRepository;

  @Autowired private QuestionOptionRepository optionRepository;

  @Test
  public void testCannotCreateMultipleCorrectAnswers() {
    // Create a question
    Question question = new Question();
    question.setType(QuestionType.VERBAL_ANALOGY);
    question.setFormat(QuestionFormat.SINGLE_CHOICE_IMAGE);
    question.setPromptText("Test question");
    question.setDifficulty(3);
    question = questionRepository.save(question);

    // Create first correct option - should succeed
    QuestionOption option1 = new QuestionOption();
    option1.setQuestion(question);
    option1.setText("Correct answer 1");
    option1.setIsCorrect(true);
    option1.setOptionOrder(1);
    optionRepository.save(option1);

    // Create second correct option - should fail due to unique constraint
    QuestionOption option2 = new QuestionOption();
    option2.setQuestion(question);
    option2.setText("Correct answer 2");
    option2.setIsCorrect(true);
    option2.setOptionOrder(2);

    // This should throw a DataIntegrityViolationException due to the unique constraint
    assertThrows(
        DataIntegrityViolationException.class,
        () -> {
          optionRepository.saveAndFlush(option2);
        },
        "Should not allow multiple correct answers for the same question");
  }

  @Test
  public void testCanCreateOneCorrectAndMultipleIncorrectAnswers() {
    // Create a question
    Question question = new Question();
    question.setType(QuestionType.VERBAL_ANALOGY);
    question.setFormat(QuestionFormat.SINGLE_CHOICE_IMAGE);
    question.setPromptText("Test question");
    question.setDifficulty(3);
    question = questionRepository.save(question);

    // Create one correct option
    QuestionOption correctOption = new QuestionOption();
    correctOption.setQuestion(question);
    correctOption.setText("Correct answer");
    correctOption.setIsCorrect(true);
    correctOption.setOptionOrder(1);
    optionRepository.save(correctOption);

    // Create multiple incorrect options - should all succeed
    for (int i = 2; i <= 4; i++) {
      QuestionOption incorrectOption = new QuestionOption();
      incorrectOption.setQuestion(question);
      incorrectOption.setText("Incorrect answer " + i);
      incorrectOption.setIsCorrect(false);
      incorrectOption.setOptionOrder(i);
      optionRepository.save(incorrectOption);
    }

    // Verify all options were created
    var options = optionRepository.findByQuestionIdOrderByOptionOrder(question.getId());
    assertEquals(4, options.size(), "Should have 4 options total");
    assertEquals(
        1,
        options.stream().filter(QuestionOption::getIsCorrect).count(),
        "Should have exactly 1 correct option");
  }

  @Test
  public void testCanUpdateCorrectAnswerToAnotherOption() {
    // Create a question
    Question question = new Question();
    question.setType(QuestionType.VERBAL_ANALOGY);
    question.setFormat(QuestionFormat.SINGLE_CHOICE_IMAGE);
    question.setPromptText("Test question");
    question.setDifficulty(3);
    question = questionRepository.save(question);

    // Create two options, first one correct
    QuestionOption option1 = new QuestionOption();
    option1.setQuestion(question);
    option1.setText("Initially correct");
    option1.setIsCorrect(true);
    option1.setOptionOrder(1);
    option1 = optionRepository.save(option1);

    QuestionOption option2 = new QuestionOption();
    option2.setQuestion(question);
    option2.setText("Initially incorrect");
    option2.setIsCorrect(false);
    option2.setOptionOrder(2);
    option2 = optionRepository.save(option2);

    // Change the correct answer: first set option1 to false, then set option2 to true
    option1.setIsCorrect(false);
    optionRepository.saveAndFlush(option1);

    option2.setIsCorrect(true);
    optionRepository.saveAndFlush(option2);

    // Verify the change
    var options = optionRepository.findByQuestionIdOrderByOptionOrder(question.getId());
    assertEquals(
        1,
        options.stream().filter(QuestionOption::getIsCorrect).count(),
        "Should still have exactly 1 correct option");
    assertTrue(
        options.stream()
            .filter(opt -> opt.getId().equals(option2.getId()))
            .findFirst()
            .get()
            .getIsCorrect(),
        "Option 2 should now be correct");
  }
}

