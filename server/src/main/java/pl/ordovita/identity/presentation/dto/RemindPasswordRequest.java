package pl.ordovita.identity.presentation.dto;

import jakarta.validation.constraints.Email;
import lombok.NonNull;

import java.util.UUID;

public record RemindPasswordRequest(@Email @NonNull String email, @NonNull UUID token, @NonNull String rawPassword) {
}
