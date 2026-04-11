package pl.ordovita.shared.infrastructure.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import pl.ordovita.shared.domain.ai.AiClient;
import pl.ordovita.shared.domain.ai.AiRequest;
import pl.ordovita.shared.domain.ai.AiResponse;

@Slf4j
public class GroqAiClient implements AiClient {

    private final RestClient restClient;
    private final GroqProperties properties;

    public GroqAiClient(GroqProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .defaultHeader("Authorization", "Bearer " + properties.apiKey())
                .build();
    }

    @Override
    public AiResponse ask(AiRequest request) {
        log.debug("Sending prompt to Groq model {}", properties.model());

        GroqApiRequest body = GroqApiRequest.of(properties.model(), request.prompt());

        GroqApiResponse response = restClient.post()
                .uri("/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(GroqApiResponse.class);

        if (response == null || response.choices() == null || response.choices().isEmpty()) {
            throw new AiClientException("Empty response from Groq API");
        }

        String content = response.choices().getFirst().message().content();
        int inputTokens = response.usage() != null ? response.usage().prompt_tokens() : 0;

        log.info("Groq tokens — prompt: {}, completion: {}", inputTokens,
                response.usage() != null ? response.usage().completion_tokens() : 0);
        log.debug("Received response from Groq ({} chars)", content.length());

        return new AiResponse(content, inputTokens, request.prompt());
    }
}
