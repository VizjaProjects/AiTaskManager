using FluentValidation;

namespace Ordovita.Application.Surveys.EditSurvey;

public sealed class EditSurveyValidator : AbstractValidator<EditSurveyCommand>
{
    public EditSurveyValidator()
    {
        RuleFor(x => x.SurveyId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(25);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(50);
    }
}
