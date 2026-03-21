package pl.ordovita.surveys.application.port.in;

import pl.ordovita.surveys.application.dto.UserResponseResult;

import java.util.Set;

public interface GetAllUserResponseUseCase {

    record GetAllUserResponseResult(Set<UserResponseResult> userResponseResultSet){}

    GetAllUserResponseResult getAllUserResponse();

}
