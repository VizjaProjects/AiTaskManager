using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Surveys.Exception;
using Ordovita.Domain.Surveys.port;
using Ordovita.Domain.Surveys.Questions;

namespace Ordovita.Application.Surveys.Questions.EditQuestion;

public sealed class EditQuestionHandler(IQuestionRepository questionRepository, IUnitOfWork uow)
    : ICommandHandler<EditQuestionCommand, EditQuestionResult>
{
    public async Task<Result<EditQuestionResult>> Handle(EditQuestionCommand command, CancellationToken ct)
    {
        var question = await questionRepository.GetByIdAsync(QuestionId.From(command.QuestionId), ct);
        if (question is null)
            return Result.Failure<EditQuestionResult>(QuestionException.NotFound);

        var editResult = question.Edit(command.QuestionText, command.IsRequired, command.Hint);
        if (editResult.IsFailure)
            return Result.Failure<EditQuestionResult>(editResult.Error);

        await uow.SaveChangesAsync(ct);

        return Result.Success(new EditQuestionResult(question.Id.Value, question.UpdatedAt));
    }
}