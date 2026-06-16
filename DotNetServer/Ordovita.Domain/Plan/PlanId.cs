using Ordovita.Domain.Common;

namespace Ordovita.Domain.Plan;

public readonly record struct PlanId(Guid Value) : IEntityId<PlanId>
{
    public static PlanId New()
    {
        return new PlanId(Guid.CreateVersion7());
    }

    public static PlanId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("PlanId cannot be empty.", nameof(value));
        return new PlanId(value);
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}