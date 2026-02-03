package pl.ordovita.identity.presentation.rest.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.ordovita.identity.application.port.in.VerificationAccountUseCase;
import pl.ordovita.identity.application.service.EmailVerificationService;
import pl.ordovita.identity.presentation.dto.EmailVerificationResponse;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/v1/api/emailVerification")
@RequiredArgsConstructor
public class EmailVerificationController {

    private final EmailVerificationService emailVerificationService;


    @PutMapping("/verify/user/{userId}/code/{code}")
    public ResponseEntity<EmailVerificationResponse> verifyUser(@PathVariable String code, @PathVariable UUID userId) {

        VerificationAccountUseCase.VerificationAccountCommand command = new VerificationAccountUseCase.VerificationAccountCommand(userId, code);
        emailVerificationService.verify(command);

        return ResponseEntity.status(200).body(new EmailVerificationResponse(command.userId(), Instant.now()));

    }
}
