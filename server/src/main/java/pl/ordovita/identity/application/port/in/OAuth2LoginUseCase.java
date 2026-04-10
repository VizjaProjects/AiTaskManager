package pl.ordovita.identity.application.port.in;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import pl.ordovita.identity.domain.model.token.TokenPair;

public interface OAuth2LoginUseCase {

    record OAuth2LoginCommand(String email, String fullName, HttpServletRequest request, HttpServletResponse response) {}

    record OAuth2LoginResult(TokenPair tokenPair, LoginUseCase.UserInfo userInfo) {}

    OAuth2LoginResult loginWithOAuth2(OAuth2LoginCommand command);
}
