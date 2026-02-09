package pl.ordovita.identity.presentation.dto;

import java.time.Instant;

public record ChangeFullNameResponse(String newFullName, Instant changedAt) {
}
