package pl.ordovita.surveys.application.port.in;

import java.time.Instant;
import java.util.UUID;

public interface ChangeVisibleUseCase {

    record ChangeVisibleCommand(UUID surveyId, boolean isVisable){}
    record ChangeVisibleResult(UUID surveyId, boolean isVisable, Instant updatedAt){}

    ChangeVisibleResult changeVisible(ChangeVisibleCommand command);
}
