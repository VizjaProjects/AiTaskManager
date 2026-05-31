using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Surveys.Exception;
using Ordovita.Domain.Surveys.port;
using Ordovita.Domain.Surveys.Surveys;

namespace Ordovita.Application.Surveys.DeleteSurvey;

public sealed class DeleteSurveyHandler(ISurveyRepository repository, IUnitOfWork uow)
    : ICommandHandler<DeleteSurveyCommand, Unit>
{
    public async Task<Result<Unit>> Handle(DeleteSurveyCommand command, CancellationToken ct)
    {
        var surveyId = SurveyId.From(command.SurveyId);
        var survey = await repository.GetByIdAsync(surveyId, ct);
        if (survey is null)
            return Result.Failure<Unit>(SurveyException.NotFound);

        await repository.DeleteWithDataAsync(surveyId, ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success(Unit.Value);
    }
}
