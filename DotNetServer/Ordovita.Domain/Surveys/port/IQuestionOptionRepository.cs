using Ordovita.Domain.Surveys.Questions;

namespace Ordovita.Domain.Surveys.port;

public interface IQuestionOptionRepository
{
    Task<IReadOnlyList<QuestionOptionDto>> GetByQuestionIdAsync(QuestionId questionId, CancellationToken ct = default);

    Task<IReadOnlySet<QuestionId>> GetQuestionIdsWithOptionsAsync(
        IReadOnlyList<QuestionId> questionIds, CancellationToken ct = default);

    Task AddRangeAsync(
        QuestionId questionId, IReadOnlyList<string> optionTexts, CancellationToken ct = default);
}

public sealed record QuestionOptionDto(Guid QuestionOptionId, string OptionText);
