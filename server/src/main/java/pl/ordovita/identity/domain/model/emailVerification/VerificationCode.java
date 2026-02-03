package pl.ordovita.identity.domain.model.emailVerification;

import pl.ordovita.identity.domain.exception.EmailVerificationException;

import java.security.SecureRandom;

public record VerificationCode(String value) {

    private static final int CODE_LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    public VerificationCode {
        if (value == null || value.isBlank()) {
            throw new EmailVerificationException("Verification code cannot be empty");
        }
        if (!value.matches("^\\d{6}$")) {
            throw new EmailVerificationException("Verification code must be exactly 6 digits");
        }
    }


    public static VerificationCode generate() {
        int code = RANDOM.nextInt(1_000_000);
        String codeStr = String.format("%06d", code);
        return new VerificationCode(codeStr);
    }

}
