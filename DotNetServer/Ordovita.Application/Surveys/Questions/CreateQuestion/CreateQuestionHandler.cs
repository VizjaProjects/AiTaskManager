using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Surveys.Exception;
using Ordovita.Domain.Surveys.port;
using Ordovita.Domain.Surveys.Questions;
using Ordovita.Domain.Surveys.Surveys;

namespace Ordovita.Application.Surveys.Questions.CreateQuestion;

public sealed class CreateQuestionHandler(
    ISurveyRepository surveyRepository,
    IQuestionRepository questionRepository,
    IUnitOfWork uow) : ICommandHandler<CreateQuestionCommand, CreateQuestionResult>
{
    public async Task<Result<CreateQuestionResult>> Handle(CreateQuestionCommand command, CancellationToken ct)
    {
        var surveyId = SurveyId.From(command.SurveyId);
        if (await surveyRepository.GetByIdAsync(surveyId, ct) is null)
            return Result.Failure<CreateQuestionResult>(SurveyException.NotFound);

        var question = Question.Create(command.QuestionText, surveyId, command.IsRequired, command.Hint);
        if (question.IsFailure)
            return Result.Failure<CreateQuestionResult>(question.Error);

        await questionRepository.AddAsync(question.Value!, ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success(new CreateQuestionResult(
            surveyId.Value, question.Value!.Id.Value, question.Value.CreatedAt));
    }
}
