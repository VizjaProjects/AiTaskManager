using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Surveys;
using Ordovita.Domain.Common;
using Ordovita.Domain.Surveys.port;

namespace Ordovita.Application.Surveys.GetActiveSurveys;

public sealed class GetActiveSurveysHandler(ISurveyRepository repository)
    : IQueryHandler<GetActiveSurveysQuery, IReadOnlyList<SurveySummaryDto>>
{
    public async Task<Result<IReadOnlyList<SurveySummaryDto>>> Handle(GetActiveSurveysQuery query, CancellationToken ct)
    {
        var surveys = await repository.GetActiveAsync(ct);
        var result = surveys.Select(s => new SurveySummaryDto(
            s.Id.Value, s.Title, s.Description, s.IsVisible, s.CreatedAt, s.UpdatedAt)).ToList();
        return Result.Success<IReadOnlyList<SurveySummaryDto>>(result);
    }
}
