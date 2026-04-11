package pl.ordovita.shared.infrastructure.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ai.groq")
public record GroqProperties(String apiKey, String model) {

    public GroqProperties {
        if (model == null || model.isBlank()) {
            model = "openai/gpt-oss-120b";
        }
    }
}
