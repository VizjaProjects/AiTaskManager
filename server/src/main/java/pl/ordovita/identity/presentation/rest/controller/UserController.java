package pl.ordovita.identity.presentation.rest.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.ordovita.identity.application.port.in.ChangeFullNameUseCase;
import pl.ordovita.identity.application.port.in.ChangePasswordUseCase;
import pl.ordovita.identity.application.service.DeleteAccountService;
import pl.ordovita.identity.presentation.dto.ChangeFullNameRequest;
import pl.ordovita.identity.presentation.dto.ChangeFullNameResponse;
import pl.ordovita.identity.presentation.dto.ChangePasswordRequest;
import pl.ordovita.identity.presentation.dto.ChangePasswordResponse;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/v1/api/user")
@RequiredArgsConstructor
public class UserController {

    private final ChangePasswordUseCase changePasswordUseCase;
    private final ChangeFullNameUseCase changeFullNameUseCase;
    private final DeleteAccountService deleteAccountService;

    @PutMapping("/change/password")
    public ResponseEntity<ChangePasswordResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request, HttpServletRequest httpRequest) {

        ChangePasswordUseCase.ChangePasswordCommand  command = new ChangePasswordUseCase.ChangePasswordCommand(request.oldPassword(),request.newPassword(),request.confirmPassword());
        changePasswordUseCase.change(command,httpRequest);

        return ResponseEntity.ok().body(new ChangePasswordResponse(Instant.now()));

    }

    @PutMapping("/change/fullname")
    public ResponseEntity<ChangeFullNameResponse> changeFullName(@Valid @RequestBody ChangeFullNameRequest request) {

        ChangeFullNameUseCase.ChangeFullNameCommand command = new  ChangeFullNameUseCase.ChangeFullNameCommand(request.newFullName());
        changeFullNameUseCase.changeFullName(command);

        return ResponseEntity.ok().body(new ChangeFullNameResponse(command.fullName(),Instant.now()));
    }

    @DeleteMapping("/account")
    public ResponseEntity<Map<String, String>> deleteAccount() {
        deleteAccountService.deleteAccount();
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
}
