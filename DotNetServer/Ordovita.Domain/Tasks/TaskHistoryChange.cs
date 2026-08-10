namespace Ordovita.Domain.Tasks;

public sealed record TaskHistoryChange(string Field, string PrevValue, string NextValue);