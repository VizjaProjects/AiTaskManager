package pl.ordovita.identity.infrastructure.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import pl.ordovita.identity.application.port.in.OAuth2LoginUseCase;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@RequiredArgsConstructor
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final OAuth2LoginUseCase oAuth2LoginUseCase;
    private final String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        if (email == null || email.isBlank()) {
            log.error("OAuth2 login failed: email not provided by Google");
            response.sendRedirect(frontendUrl + "/login?error=oauth_no_email");
            return;
        }

        if (name == null || name.isBlank()) {
            name = email.split("@")[0];
        }

        try {
            OAuth2LoginUseCase.OAuth2LoginCommand command = new OAuth2LoginUseCase.OAuth2LoginCommand(
                    email, name, request, response
            );

            OAuth2LoginUseCase.OAuth2LoginResult result = oAuth2LoginUseCase.loginWithOAuth2(command);

            String accessToken = result.tokenPair().accessToken().value();
            String userId = result.userInfo().userId().toString();
            String userEmail = URLEncoder.encode(result.userInfo().email(), StandardCharsets.UTF_8);
            String fullName = URLEncoder.encode(result.userInfo().fullName(), StandardCharsets.UTF_8);
            String role = result.userInfo().role().name();

            String redirectUrl = frontendUrl + "/oauth-callback"
                    + "?token=" + accessToken
                    + "&userId=" + userId
                    + "&email=" + userEmail
                    + "&fullName=" + fullName
                    + "&role=" + role;

            response.sendRedirect(redirectUrl);
        } catch (Exception e) {
            log.error("OAuth2 login processing failed", e);
            response.sendRedirect(frontendUrl + "/login?error=oauth_failed");
        }
    }
}
