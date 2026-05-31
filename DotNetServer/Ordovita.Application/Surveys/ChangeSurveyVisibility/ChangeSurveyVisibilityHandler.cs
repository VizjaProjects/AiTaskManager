using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Surveys;
using Ordovita.Domain.Common;
using Ordovita.Domain.Surveys.Exception;
using Ordovita.Domain.Surveys.port;
using Ordovita.Domain.Surveys.Surveys;

namespace Ordovita.Application.Surveys.ChangeSurveyVisibility;

public sealed class ChangeSurveyVisibilityHandler(ISurveyRepository repository, IUnitOfWork uow)
    : ICommandHandler<ChangeSurveyVisibilityCommand, SurveySummaryDto>
{
    public async Task<Result<SurveySummaryDto>> Handle(ChangeSurveyVisibilityCommand command, CancellationToken ct)
    {
        var survey = await repository.GetByIdAsync(SurveyId.From(command.SurveyId), ct);
        if (survey is null)
            return Result.Failure<SurveySummaryDto>(SurveyException.NotFound);

        var visibilityResult = survey.ChangeVisibility(command.IsVisible);
        if (visibilityResult.IsFailure)
            return Result.Failure<SurveySummaryDto>(visibilityResult.Error);

        await uow.SaveChangesAsync(ct);

        return Result.Success(new SurveySummaryDto(
            survey.Id.Value, survey.Title, survey.Description, survey.IsVisible, survey.CreatedAt, survey.UpdatedAt));
    }
}