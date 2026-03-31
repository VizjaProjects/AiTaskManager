package pl.ordovita.shared.infrastructure.ai;

import java.util.List;

record GeminiApiRequest(List<Content> contents) {

    record Content(List<Part> parts) {}

    record Part(String text) {}

    static GeminiApiRequest of(String prompt) {
        return new GeminiApiRequest(
                List.of(new Content(List.of(new Part(prompt))))
        );
    }
}
