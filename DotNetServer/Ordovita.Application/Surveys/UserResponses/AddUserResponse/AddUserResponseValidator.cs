using FluentValidation;

namespace Ordovita.Application.Surveys.UserResponses.AddUserResponse;

public sealed class AddUserResponseValidator : AbstractValidator<AddUserResponseCommand>
{
    public AddUserResponseValidator()
    {
        RuleFor(x => x.SurveyId).NotEmpty();
        RuleFor(x => x.QuestionId).NotEmpty();
        RuleFor(x => x.Answer).NotEmpty().MinimumLength(2).MaximumLength(100);
    }
}