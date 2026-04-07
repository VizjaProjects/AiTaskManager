package pl.ordovita.shared.domain.ai;

public record AiResponse(String content, int tokenCount, String prompt) {
}
