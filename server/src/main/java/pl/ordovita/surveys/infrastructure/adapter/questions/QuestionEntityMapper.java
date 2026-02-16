package pl.ordovita.surveys.infrastructure.adapter.questions;

import pl.ordovita.surveys.domain.model.questionOption.OptionText;
import pl.ordovita.surveys.domain.model.questionOption.QuestionOption;
import pl.ordovita.surveys.domain.model.questionOption.QuestionOptionId;
import pl.ordovita.surveys.domain.model.questions.Question;
import pl.ordovita.surveys.domain.model.questions.QuestionId;
import pl.ordovita.surveys.domain.model.surveys.SurveyId;
import pl.ordovita.surveys.infrastructure.jpa.questions.QuestionEntity;

import java.util.Set;
import java.util.stream.Collectors;

public class QuestionEntityMapper {

    public static QuestionEntity from(Question question) {

        QuestionEntity questionEntity = QuestionEntity.builder().id(question.getId().value()).build();
        return new QuestionEntity(question.getId().value(),
                questionEntity.getSurveyId(),
                questionEntity.getQuestionOptions(),
                question.getQuestionText(),
                question.getQuestionType(),
                question.isRequired(),
                question.getCreatedAt(),
                question.getUpdatedAt()

        );
    }

    public static Question toDomain(QuestionEntity questionEntity) {

        Set<QuestionOption> questionOptionSet = questionEntity.getQuestionOptions().stream().map(qo -> new QuestionOption(
                new QuestionOptionId(qo.getId()),
                new OptionText(qo.getOptionText()),
                qo.getCreateAt(),
                qo.getUpdateAt()))
                .collect(Collectors.toSet());

        return new Question(new QuestionId(questionEntity.getId()),
                new SurveyId(questionEntity.getSurveyId().getId()),
                questionOptionSet,
                questionEntity.getQuestionText(),
                questionEntity.getQuestionType(),
                questionEntity.isRequired(),
                questionEntity.getCreatedAt(),
                questionEntity.getUpdatedAt());
    }
}
