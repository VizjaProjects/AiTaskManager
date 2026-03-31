package pl.ordovita.shared.domain.ai;

public record AiRequest(String prompt) {

    public AiRequest {
        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("Prompt cannot be null or blank");
        }
    }
}
