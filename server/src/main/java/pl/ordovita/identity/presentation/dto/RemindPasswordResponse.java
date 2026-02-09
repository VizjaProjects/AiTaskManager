package pl.ordovita.identity.presentation.dto;

import java.time.Instant;
import java.util.UUID;

public record RemindPasswordResponse(UUID token, String userEmail, Instant createdAt) {
}
