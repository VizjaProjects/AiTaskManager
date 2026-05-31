using FluentValidation;

namespace Ordovita.Application.Surveys.CreateSurvey;

public sealed class CreateSurveyValidator : AbstractValidator<CreateSurveyCommand>
{
    public CreateSurveyValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(25);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(50);
    }
}