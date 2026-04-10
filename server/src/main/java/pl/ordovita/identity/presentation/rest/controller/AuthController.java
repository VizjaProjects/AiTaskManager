package pl.ordovita.identity.presentation.rest.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.ordovita.identity.application.port.in.*;
import pl.ordovita.identity.application.port.out.PasswordHasher;
import pl.ordovita.identity.presentation.dto.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/v1/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegisterUserUseCase registerUserService;
    private final PasswordHasher passwordHasher;
    private final LoginUseCase loginUseCase;
    private final LogoutUseCase logoutUseCase;
    private final RefreshTokenUseCase refreshTokenUseCase;
    private final SessionManagerUseCase sessionManagerUseCase;
    private final RemindPasswordUseCase remindPasswordUseCase;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request, HttpServletResponse response) {


        LoginUseCase.LoginCommand command = new LoginUseCase.LoginCommand(loginRequest.email(),
                loginRequest.password(),
                response,
                request);

        LoginUseCase.LoginResult loginResult = loginUseCase.login(command);

        return ResponseEntity.ok(new LoginResponse(loginResult.tokenPair().accessToken().value(),
                "Bearer",
                loginResult.userInfo().userId(),
                loginResult.userInfo().email(),
                loginResult.userInfo().fullName(),
                loginResult.userInfo().role().name()));
    }


    @DeleteMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = sessionManagerUseCase.getRefreshTokenFromCookie(request);

        LogoutUseCase.LogoutCommand command = new LogoutUseCase.LogoutCommand(refreshToken);
        logoutUseCase.logout(command);
        sessionManagerUseCase.clearRefreshTokenCookie(response);

        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));

    }


    @PostMapping("/register")
    public ResponseEntity<RegisterUserResponse> register(@RequestBody RegisterUserRequest request) {
        RegisterUserUseCase.RegisterUserCommand command = new RegisterUserUseCase.RegisterUserCommand(request.fullName(),
                request.email(),
                request.rawPassword(),
                passwordHasher);
        RegisterUserUseCase.RegisterUserResult registerUserResult = registerUserService.register(command);


        return ResponseEntity.status(201).body(new RegisterUserResponse(registerUserResult.userId(),
                registerUserResult.email(),
                Instant.now()));
    }

    @PutMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String refreshToken = sessionManagerUseCase.getRefreshTokenFromCookie(httpRequest);

        RefreshTokenUseCase.RefreshCommand command = new RefreshTokenUseCase.RefreshCommand(refreshToken);

        var tokenPair = refreshTokenUseCase.refresh(command, httpResponse, httpRequest);

        return ResponseEntity.ok(new TokenResponse(tokenPair.accessToken().value(), "Bearer"));
    }

    @PostMapping("/send/remindPasswordRequest/{email}")
    public ResponseEntity<RequestRemindPasswordResponse> remindPasswordRequest(@PathVariable @Email String email, HttpServletRequest request) {

        RemindPasswordUseCase.RemindPasswordRequestCommand command = new RemindPasswordUseCase.RemindPasswordRequestCommand(
                email);
        remindPasswordUseCase.createRemindPasswordRequest(command, request);
        return ResponseEntity.ok().body(new RequestRemindPasswordResponse(email, Instant.now()));
    }

    @PutMapping("/remindPassword")
    public ResponseEntity<RemindPasswordResponse> remind(@Valid @RequestBody RemindPasswordRequest request, HttpServletRequest httpRequest) {
        RemindPasswordUseCase.RemindPasswordCommand command = new RemindPasswordUseCase.RemindPasswordCommand(request.email(),
                request.token(),
                request.rawPassword());
        remindPasswordUseCase.remindPassword(command, httpRequest);

        return ResponseEntity.ok().body(new RemindPasswordResponse(command.token(), command.email(), Instant.now()));
    }

    @GetMapping("/o-auth")
    public String get() {
        return "SSSS";
    }
}
