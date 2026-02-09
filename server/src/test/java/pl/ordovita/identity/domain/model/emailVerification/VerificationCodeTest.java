package pl.ordovita.identity.domain.model.emailVerification;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

class VerificationCodeTest {

    @Test
    @DisplayName("Should generate verification code")
    void shouldGenerateVerificationCode() {
        VerificationCode code = VerificationCode.generate();

        assertNotNull(code);
        assertNotNull(code.value());
        assertEquals(6, code.value().length());
    }

    @Test
    @DisplayName("Should generate different codes")
    void shouldGenerateDifferentCodes() {
        VerificationCode code1 = VerificationCode.generate();
        VerificationCode code2 = VerificationCode.generate();

        assertNotEquals(code1.value(), code2.value());
    }

    @Test
    @DisplayName("Should create verification code from string")
    void shouldCreateVerificationCodeFromString() {
        String codeValue = "123456";
        VerificationCode code = new VerificationCode(codeValue);

        assertEquals(codeValue, code.value());
    }

    @Test
    @DisplayName("Should compare verification codes correctly")
    void shouldCompareVerificationCodesCorrectly() {
        String codeValue = "123456";
        VerificationCode code1 = new VerificationCode(codeValue);
        VerificationCode code2 = new VerificationCode(codeValue);

        assertEquals(code1, code2);
    }
}
