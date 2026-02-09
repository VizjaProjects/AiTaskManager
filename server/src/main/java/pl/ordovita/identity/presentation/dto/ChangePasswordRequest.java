package pl.ordovita.identity.presentation.dto;

import lombok.NonNull;

public record ChangePasswordRequest(@NonNull String oldPassword,@NonNull String newPassword,@NonNull String confirmPassword) {
}
