using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Surveys.port;
using Ordovita.Domain.Surveys.Surveys;

namespace Ordovita.Application.Surveys.CreateSurvey;

public sealed class CreateSurveyHandler(ISurveyRepository repository, IUnitOfWork uow) : ICommandHandler<CreateSurveyCommand, CreateSurveyResult>
{
    public async Task<Result<CreateSurveyResult>> Handle(CreateSurveyCommand command, CancellationToken ct)
    {
        var survey = Survey.Create(command.Title, command.Description);

        if (survey.IsFailure || survey.Value == null)
            return Result.Failure<CreateSurveyResult>(survey.Error);
        
        
        await repository.AddAsync(survey.Value, ct);
        await uow.SaveChangesAsync(ct);
        
        return Result.Success(new CreateSurveyResult(survey.Value.Id.Value, survey.Value.Title,survey.Value.Description, survey.Value.CreatedAt, survey.Value.IsVisible));

    }
}