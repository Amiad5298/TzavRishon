package com.tzavrishon.controller;

import com.tzavrishon.domain.*;
import com.tzavrishon.dto.ImportQuestionRequest;
import com.tzavrishon.repository.*;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
  private final QuestionRepository questionRepository;
  private final QuestionOptionRepository optionRepository;
  private final AcceptableAnswerRepository acceptableAnswerRepository;

  public AdminController(
      QuestionRepository questionRepository,
      QuestionOptionRepository optionRepository,
      AcceptableAnswerRepository acceptableAnswerRepository) {
    this.questionRepository = questionRepository;
    this.optionRepository = optionRepository;
    this.acceptableAnswerRepository = acceptableAnswerRepository;
  }

  @PostMapping("/import-questions")
  public ResponseEntity<String> importQuestions(
      @Valid @RequestBody List<ImportQuestionRequest> requests) {
    int imported = 0;

    for (ImportQuestionRequest req : requests) {
      // Validate options for SINGLE_CHOICE_IMAGE format
      if (req.getFormat() == QuestionFormat.SINGLE_CHOICE_IMAGE) {
        validateSingleCorrectAnswer(req.getOptions());
      }

      Question question = new Question();
      question.setType(req.getType());
      question.setFormat(req.getFormat());
      question.setPromptText(req.getPromptText());
      question.setPromptImageUrl(req.getPromptImageUrl());
      question.setExplanation(req.getExplanation());
      question.setDifficulty(req.getDifficulty() != null ? req.getDifficulty() : 3);
      question = questionRepository.save(question);

      if (req.getOptions() != null) {
        for (var optData : req.getOptions()) {
          QuestionOption option = new QuestionOption();
          option.setQuestion(question);
          option.setText(optData.getText());
          option.setImageUrl(optData.getImageUrl());
          option.setIsCorrect(optData.getIsCorrect());
          option.setOptionOrder(optData.getOptionOrder());
          optionRepository.save(option);
        }
      }

      if (req.getAcceptableAnswers() != null) {
        for (var ansData : req.getAcceptableAnswers()) {
          AcceptableAnswer answer = new AcceptableAnswer();
          answer.setQuestion(question);
          answer.setValue(ansData.getValue());
          answer.setNumericTolerance(ansData.getNumericTolerance());
          acceptableAnswerRepository.save(answer);
        }
      }

      imported++;
    }

    return ResponseEntity.ok("Imported " + imported + " questions");
  }

  /**
   * Validates that exactly one option is marked as correct for SINGLE_CHOICE_IMAGE questions.
   *
   * @param options List of options to validate
   * @throws IllegalArgumentException if validation fails
   */
  private void validateSingleCorrectAnswer(List<OptionData> options) {
    if (options == null || options.isEmpty()) {
      throw new IllegalArgumentException(
          "SINGLE_CHOICE_IMAGE format requires at least one option");
    }

    long correctCount =
        options.stream().filter(opt -> Boolean.TRUE.equals(opt.getIsCorrect())).count();

    if (correctCount == 0) {
      throw new IllegalArgumentException(
          "SINGLE_CHOICE_IMAGE format requires exactly one correct answer. Found 0 correct answers.");
    }

    if (correctCount > 1) {
      throw new IllegalArgumentException(
          "SINGLE_CHOICE_IMAGE format requires exactly one correct answer. Found "
              + correctCount
              + " correct answers.");
    }
  }
}

