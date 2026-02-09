package pl.ordovita.identity.application.port.in;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import pl.ordovita.identity.domain.model.token.TokenPair;
import pl.ordovita.identity.domain.model.user.Role;

import java.util.UUID;

public interface LoginUseCase {

    record LoginCommand(String email, String password, HttpServletResponse response, HttpServletRequest request) {}
    record LoginResult(TokenPair tokenPair, UserInfo userInfo ){}
    record UserInfo(UUID userId, String email, String fullName, Role role){}

    LoginResult login(LoginCommand command);
}
