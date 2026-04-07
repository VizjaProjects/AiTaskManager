package pl.ordovita.shared.infrastructure.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import pl.ordovita.identity.domain.port.CurrentUser;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.shared.domain.ai.AiClient;
import pl.ordovita.shared.domain.ai.AiRequest;
import pl.ordovita.shared.domain.ai.AiResponse;

@Slf4j
@Component

public class GeminiAiClient implements AiClient {

    private final RestClient restClient;
    private final GeminiProperties properties;

    public GeminiAiClient(GeminiProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .build();
    }

    @Override
    public AiResponse ask(AiRequest request) {
        log.debug("Sending prompt to Gemini model {}", properties.model());

        int inputTokens = countTokens(request.prompt());

        GeminiApiRequest body = GeminiApiRequest.of(request.prompt());

        GeminiApiResponse response = restClient.post()
                .uri("/models/{model}:generateContent?key={key}", properties.model(), properties.apiKey())
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(GeminiApiResponse.class);


        log.info("Gemini token: {}", inputTokens);

        if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
            throw new AiClientException("Empty response from Gemini API");
        }

        String content = response.candidates().getFirst().content().parts().getFirst().text();
        log.debug("Received response from Gemini ({} chars)", content.length());

        return new AiResponse(content, inputTokens, request.prompt());
    }

    public int countTokens(String prompt) {
        GeminiApiRequest body = GeminiApiRequest.of(prompt);

        GeminiTokenCountResponse response = restClient.post()
                .uri("/models/{model}:countTokens?key={key}", properties.model(), properties.apiKey())
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(GeminiTokenCountResponse.class);

        return response != null ? response.totalTokens() : 0;
    }

    private record GeminiTokenCountResponse(int totalTokens) {}
}
