package pl.ordovita.tasks.domain.model.aiStatistic;

import pl.ordovita.identity.domain.model.user.UserId;

import java.time.Instant;

public class AiStatistic {
    private final AiStatisticId id;
    private final String promptText;
    private final int inputTokens;
    private final Instant createdAt;
    private final UserId userId;

    public AiStatistic(AiStatisticId id, String promptText, int inputTokens, Instant createdAt, UserId userId) {
        if(id == null)throw new IllegalArgumentException("id cannot be null");
        if(promptText == null)throw new IllegalArgumentException("promptText cannot be null");
        if(inputTokens < 0)throw new IllegalArgumentException("inputTokens cannot be negative");
        if(createdAt == null)throw new IllegalArgumentException("createdAt cannot be null");
        this.id = id;
        this.promptText = promptText;
        this.inputTokens = inputTokens;
        this.createdAt = createdAt;
        this.userId = userId;
    }

    public static AiStatistic create(String promptText, int inputTokens, UserId userId) {
        return new AiStatistic(AiStatisticId.generate(), promptText, inputTokens, Instant.now(), userId);
    }


    public AiStatisticId getId() {
        return id;
    }

    public String getPromptText() {
        return promptText;
    }

    public int getInputTokens() {
        return inputTokens;
    }


    public Instant getCreatedAt() {
        return createdAt;
    }

    public UserId getUserId() {
        return userId;
    }
}
