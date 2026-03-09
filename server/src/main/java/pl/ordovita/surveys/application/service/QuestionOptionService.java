package pl.ordovita.surveys.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.ordovita.surveys.application.port.in.DeleteQuestionOptionUseCase;
import pl.ordovita.surveys.application.port.in.EditQuestionOptionUseCase;
import pl.ordovita.surveys.domain.exception.QuestionOptionException;
import pl.ordovita.surveys.domain.model.questionOption.OptionText;
import pl.ordovita.surveys.domain.model.questionOption.QuestionOption;
import pl.ordovita.surveys.domain.model.questionOption.QuestionOptionId;
import pl.ordovita.surveys.domain.port.QuestionOptionRepository;

@Service
@RequiredArgsConstructor
public class QuestionOptionService implements EditQuestionOptionUseCase, DeleteQuestionOptionUseCase {

    private final QuestionOptionRepository questionOptionRepository;


    @Override
    public DeleteQuestionOptionResult delete(DeleteQuestionOptionCommand command) {
        QuestionOptionId questionOptionId = new QuestionOptionId(command.questionOptionId());
        QuestionOption questionOption = questionOptionRepository.findById(questionOptionId).orElseThrow(() -> new QuestionOptionException(
                "Question option with id " + questionOptionId + " not found"));

        questionOption.deleteQuestionOption(questionOptionId);
        QuestionOption updatedQuestionOption = questionOptionRepository.save(questionOption);

        return new DeleteQuestionOptionResult(updatedQuestionOption.getId().value(), updatedQuestionOption.getUpdateAt());
    }

    @Override
    public EditQuestionOptionResult edit(EditQuestionOptionCommand command) {
        QuestionOptionId questionOptionId = new QuestionOptionId(command.questionOptionId());
        QuestionOption questionOption = questionOptionRepository.findById(questionOptionId).orElseThrow(() -> new QuestionOptionException(
                "Question option with id " + questionOptionId + " not found"));

        OptionText optionText = new OptionText(command.optionText());
        questionOption.editQuestionOption(optionText);

        QuestionOption updatedQuestionOption = questionOptionRepository.save(questionOption);

        return new EditQuestionOptionResult(updatedQuestionOption.getId().value(),updatedQuestionOption.getOptionText().value(),updatedQuestionOption.getUpdateAt());
    }
}
