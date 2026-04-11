package pl.ordovita.shared.infrastructure.ai;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import pl.ordovita.shared.domain.ai.AiClient;

@Configuration
public class AiClientConfig {

    @Bean
    @ConditionalOnProperty(name = "ai.provider", havingValue = "groq")
    public AiClient groqAiClient(GroqProperties properties) {
        return new GroqAiClient(properties);
    }

    @Bean
    @ConditionalOnProperty(name = "ai.provider", havingValue = "gemini", matchIfMissing = true)
    public AiClient geminiAiClient(GeminiProperties properties) {
        return new GeminiAiClient(properties);
    }
}
