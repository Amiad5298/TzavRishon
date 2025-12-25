package com.tzavrishon.dto;

import com.tzavrishon.domain.QuestionFormat;
import com.tzavrishon.domain.QuestionType;
import java.util.List;
import lombok.Data;

@Data
public class ImportQuestionRequest {
  private QuestionType type;
  private QuestionFormat format;
  private String promptText;
  private String promptImageUrl;
  private String explanation;
  private Integer difficulty;
  private List<OptionData> options;
  private List<AcceptableAnswerData> acceptableAnswers;
}
