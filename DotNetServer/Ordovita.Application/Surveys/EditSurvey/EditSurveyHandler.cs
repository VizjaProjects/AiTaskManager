using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Surveys;
using Ordovita.Domain.Common;
using Ordovita.Domain.Surveys.Exception;
using Ordovita.Domain.Surveys.port;
using Ordovita.Domain.Surveys.Surveys;

namespace Ordovita.Application.Surveys.EditSurvey;

public sealed class EditSurveyHandler(ISurveyRepository repository, IUnitOfWork uow)
    : ICommandHandler<EditSurveyCommand, SurveySummaryDto>
{
    public async Task<Result<SurveySummaryDto>> Handle(EditSurveyCommand command, CancellationToken ct)
    {
        var survey = await repository.GetByIdAsync(SurveyId.From(command.SurveyId), ct);
        if (survey is null)
            return Result.Failure<SurveySummaryDto>(SurveyException.NotFound);

        var editResult = survey.EditSurvey(command.Title, command.Description);
        if (editResult.IsFailure)
            return Result.Failure<SurveySummaryDto>(editResult.Error);

        await uow.SaveChangesAsync(ct);

        return Result.Success(Map(survey));
    }

    private static SurveySummaryDto Map(Survey survey)
    {
        return new SurveySummaryDto(survey.Id.Value, survey.Title, survey.Description, survey.IsVisible,
            survey.CreatedAt,
            survey.UpdatedAt);
    }
}