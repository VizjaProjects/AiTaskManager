using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Surveys.Exception;
using Ordovita.Domain.Surveys.port;
using Ordovita.Domain.Surveys.Questions;

namespace Ordovita.Application.Surveys.Questions.DeleteQuestion;

public sealed class DeleteQuestionHandler(
    IQuestionRepository questionRepository,
    IUserResponseRepository userResponseRepository,
    IUnitOfWork uow) : ICommandHandler<DeleteQuestionCommand, DeleteQuestionResult>
{
    public async Task<Result<DeleteQuestionResult>> Handle(DeleteQuestionCommand command, CancellationToken ct)
    {
        var questionId = QuestionId.From(command.QuestionId);
        var question = await questionRepository.GetByIdAsync(questionId, ct);
        if (question is null)
            return Result.Failure<DeleteQuestionResult>(QuestionException.NotFound);

        var updatedAt = DateTime.UtcNow;
        await userResponseRepository.DeleteByQuestionIdAsync(questionId, ct);
        questionRepository.Delete(question);
        await uow.SaveChangesAsync(ct);

        return Result.Success(new DeleteQuestionResult(questionId.Value, updatedAt));
    }
}
