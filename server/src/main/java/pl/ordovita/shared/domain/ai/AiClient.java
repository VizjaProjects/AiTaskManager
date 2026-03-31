package pl.ordovita.shared.domain.ai;

public interface AiClient {

    AiResponse ask(AiRequest request);
}
