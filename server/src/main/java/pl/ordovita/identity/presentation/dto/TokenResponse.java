package pl.ordovita.identity.presentation.dto;

public record TokenResponse(
        String accessToken,
        String tokenType
) {}