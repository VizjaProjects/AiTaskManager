package pl.ordovita.identity.presentation.dto;

import java.time.Instant;

public record RequestRemindPasswordResponse(String email, Instant createAt) {
}
