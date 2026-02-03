package pl.ordovita.identity.presentation.dto;

import java.time.Instant;
import java.util.UUID;

public record RegisterUserResponse(UUID userId, String email, Instant createdAt) {
}
