package pl.ordovita.shared.infrastructure.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ai.gemini")
public record GeminiProperties(String apiKey, String model) {

    public GeminiProperties {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException("Gemini API key must be configured (ai.gemini.api-key)");
        }
        if (model == null || model.isBlank()) {
            model = "gemini-3-flash-preview";
        }
    }
}
