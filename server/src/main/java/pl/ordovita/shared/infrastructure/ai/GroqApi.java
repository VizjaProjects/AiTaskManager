package pl.ordovita.shared.infrastructure.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

record GroqApiRequest(String model, List<Message> messages) {

    record Message(String role, String content) {}

    static GroqApiRequest of(String model, String prompt) {
        return new GroqApiRequest(model, List.of(new Message("user", prompt)));
    }
}

@JsonIgnoreProperties(ignoreUnknown = true)
record GroqApiResponse(List<Choice> choices, Usage usage) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Choice(Message message) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Message(String role, String content) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Usage(int prompt_tokens, int completion_tokens, int total_tokens) {}
}
