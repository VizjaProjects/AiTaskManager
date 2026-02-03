package pl.ordovita.identity.presentation.dto;

import java.util.UUID;

public record LoginResponse(
        String accessToken,
        String tokenType,
        UUID userId,
        String email,
        String fullName,
        String role
) {}