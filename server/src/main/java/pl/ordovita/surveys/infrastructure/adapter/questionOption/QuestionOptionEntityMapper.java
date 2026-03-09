package pl.ordovita.surveys.infrastructure.adapter.questionOption;

import pl.ordovita.surveys.domain.model.questionOption.OptionText;
import pl.ordovita.surveys.domain.model.questionOption.QuestionOption;
import pl.ordovita.surveys.domain.model.questionOption.QuestionOptionId;
import pl.ordovita.surveys.domain.model.questions.QuestionId;
import pl.ordovita.surveys.infrastructure.jpa.questionOption.QuestionOptionEntity;
import pl.ordovita.surveys.infrastructure.jpa.questions.QuestionEntity;

public class QuestionOptionEntityMapper {

    public static QuestionOptionEntity from(QuestionOption questionOption) {
        QuestionEntity questionEntity = null;

        if(questionOption.getQuestionId() != null) {
            questionEntity = QuestionEntity.builder().id(questionOption.getQuestionId().value()).build();
        }


        return new QuestionOptionEntity(questionOption.getId().value(),
                questionEntity,
                questionOption.getOptionText().value(),
                questionOption.getCreateAt(),
                questionOption.getUpdateAt());
    }

    public static QuestionOption toDomain(QuestionOptionEntity questionOptionEntity) {

        QuestionId questionId;

        if(questionOptionEntity.getQuestionId() != null) {
            questionId = new QuestionId(questionOptionEntity.getQuestionId().getId());
        } else {
            questionId = new QuestionId(null);
        }

        return new QuestionOption(
                new QuestionOptionId(questionOptionEntity.getId()),
                questionId,
                new OptionText(questionOptionEntity.getOptionText()),
                questionOptionEntity.getCreateAt(),
                questionOptionEntity.getUpdateAt()
        );
    }
}
