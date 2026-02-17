package pl.ordovita.surveys.infrastructure.adapter.questionOption;

import pl.ordovita.surveys.domain.model.questionOption.OptionText;
import pl.ordovita.surveys.domain.model.questionOption.QuestionOption;
import pl.ordovita.surveys.domain.model.questionOption.QuestionOptionId;
import pl.ordovita.surveys.domain.model.questions.QuestionId;
import pl.ordovita.surveys.infrastructure.jpa.questionOption.QuestionOptionEntity;
import pl.ordovita.surveys.infrastructure.jpa.questions.QuestionEntity;

public class QuestionOptionEntityMapper {

    public static QuestionOptionEntity from(QuestionOption questionOption) {
        QuestionEntity questionEntity = QuestionEntity.builder().id(questionOption.getQuestionId().value()).build();


        return new QuestionOptionEntity(questionOption.getId().value(),
                questionEntity,
                questionOption.getOptionText().value(),
                questionOption.getCreateAt(),
                questionOption.getUpdateAt());
    }

    public static QuestionOption toDomain(QuestionOptionEntity questionOptionEntity) {
        return new QuestionOption(
                new QuestionOptionId(questionOptionEntity.getId()),
                new QuestionId(questionOptionEntity.getId()),
                new OptionText(questionOptionEntity.getOptionText()),
                questionOptionEntity.getCreateAt(),
                questionOptionEntity.getUpdateAt()
        );
    }
}
