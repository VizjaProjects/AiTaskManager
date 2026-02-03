package pl.ordovita.identity.presentation.dto;

import java.time.Instant;
import java.util.UUID;

public record EmailVerificationResponse(UUID userId, Instant createAt) {
}
