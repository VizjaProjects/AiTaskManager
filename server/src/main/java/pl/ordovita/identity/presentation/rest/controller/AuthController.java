package pl.ordovita.identity.presentation.rest.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nl.basjes.parse.useragent.UserAgent;
import nl.basjes.parse.useragent.UserAgentAnalyzer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.ordovita.identity.application.port.in.LoginUseCase;
import pl.ordovita.identity.application.port.in.RegisterUserUseCase;
import pl.ordovita.identity.application.port.out.PasswordHasher;
import pl.ordovita.identity.presentation.dto.LoginRequest;
import pl.ordovita.identity.presentation.dto.LoginResponse;
import pl.ordovita.identity.presentation.dto.RegisterUserRequest;
import pl.ordovita.identity.presentation.dto.RegisterUserResponse;

import java.time.Instant;

@RestController
@RequestMapping("/v1/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_TOKEN_COOKIE = "refreshToken";
    private static final int REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;
    private final RegisterUserUseCase registerUserService;
    private final PasswordHasher passwordHasher;
    private final LoginUseCase loginUseCase;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request, HttpServletResponse response) {
        String ipAddress = getClientIp(request);
        String deviceName = request.getHeader("User-Agent");


        LoginUseCase.LoginCommand command = new LoginUseCase.LoginCommand(loginRequest.email(),
                loginRequest.password(),
                parseDeviceName(deviceName),
                ipAddress);

        LoginUseCase.LoginResult loginResult = loginUseCase.login(command);

        setRefreshTokenCookie(loginResult.tokenPair().refreshToken(), response);

        return ResponseEntity.ok(new LoginResponse(
                loginResult.tokenPair().accessToken().value(),
                "Bearer",
                loginResult.userInfo().userId(),
                loginResult.userInfo().email(),
                loginResult.userInfo().fullName(),
                loginResult.userInfo().role().name()
        ));
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

    private void setRefreshTokenCookie(String refreshToken, HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE, refreshToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(REFRESH_TOKEN_MAX_AGE)
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

    }


    private String getClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-FORWARDED-FOR");
        if (forwardedFor != null && !forwardedFor.isEmpty()) {
            return forwardedFor.split(",")[0];
        }

        return request.getRemoteAddr();
    }


    private String parseDeviceName(String userAgent) {
        UserAgentAnalyzer agentAnalyzer = UserAgentAnalyzer.newBuilder().hideMatcherLoadStats().withCache(10000).build();

        UserAgent agent = agentAnalyzer.parse(userAgent);

        return String.format("%s %s on %s",
                agent.getValue("DeviceClass"),
                agent.getValue("AgentNameVersion"),
                agent.getValue("OperatingSystemNameVersion"));
    }

}
