using FluentValidation;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Surveys.Exception;
using Ordovita.Domain.Surveys.port;
using Ordovita.Domain.Surveys.Questions;

namespace Ordovita.Application.Surveys.Questions.GetQuestionOptions;

public sealed class GetQuestionOptionsHandler(
    IQuestionRepository questionRepository,
    IQuestionOptionRepository questionOptionRepository)
    : IQueryHandler<GetQuestionOptionsQuery, IReadOnlyList<QuestionOptionDto>>
{
    public async Task<Result<IReadOnlyList<QuestionOptionDto>>> Handle(
        GetQuestionOptionsQuery query, CancellationToken ct)
    {
        var questionId = QuestionId.From(query.QuestionId);
        if (await questionRepository.GetByIdAsync(questionId, ct) is null)
            return Result.Failure<IReadOnlyList<QuestionOptionDto>>(QuestionException.NotFound);

        var options = await questionOptionRepository.GetByQuestionIdAsync(questionId, ct);
        return Result.Success(options);
    }
}

public sealed class GetQuestionOptionsValidator : AbstractValidator<GetQuestionOptionsQuery>
{
    public GetQuestionOptionsValidator()
    {
        RuleFor(x => x.QuestionId).NotEmpty();
    }
}