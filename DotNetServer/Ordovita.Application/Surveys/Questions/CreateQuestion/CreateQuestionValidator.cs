using FluentValidation;

namespace Ordovita.Application.Surveys.Questions.CreateQuestion;

public sealed class CreateQuestionValidator : AbstractValidator<CreateQuestionCommand>
{
    public CreateQuestionValidator()
    {
        RuleFor(x => x.SurveyId).NotEmpty();
        RuleFor(x => x.QuestionText).NotEmpty().MaximumLength(250);
        RuleFor(x => x.Hint).MaximumLength(250);
    }
}