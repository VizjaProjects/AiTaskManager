package pl.ordovita.identity.presentation.dto;


public record RegisterUserRequest(String fullName, String email, String rawPassword) {
}
