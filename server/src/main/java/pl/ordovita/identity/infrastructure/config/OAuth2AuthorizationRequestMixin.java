package pl.ordovita.identity.infrastructure.config;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.util.Map;
import java.util.Set;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OAuth2AuthorizationRequestMixin {

    private String authorizationUri;
    private String clientId;
    private String redirectUri;
    private Set<String> scopes;
    private String state;
    private String responseType;
    private Map<String, Object> additionalParameters;
    private Map<String, Object> attributes;
    private String authorizationRequestUri;

    public OAuth2AuthorizationRequestMixin() {}

    public static OAuth2AuthorizationRequestMixin from(OAuth2AuthorizationRequest request) {
        OAuth2AuthorizationRequestMixin mixin = new OAuth2AuthorizationRequestMixin();
        mixin.authorizationUri = request.getAuthorizationUri();
        mixin.clientId = request.getClientId();
        mixin.redirectUri = request.getRedirectUri();
        mixin.scopes = request.getScopes();
        mixin.state = request.getState();
        mixin.responseType = request.getResponseType() != null ? request.getResponseType().getValue() : "code";
        mixin.additionalParameters = request.getAdditionalParameters();
        mixin.attributes = request.getAttributes();
        mixin.authorizationRequestUri = request.getAuthorizationRequestUri();
        return mixin;
    }

    public OAuth2AuthorizationRequest toOAuth2AuthorizationRequest() {
        return OAuth2AuthorizationRequest.authorizationCode()
                .authorizationUri(authorizationUri)
                .clientId(clientId)
                .redirectUri(redirectUri)
                .scopes(scopes)
                .state(state)
                .additionalParameters(additionalParameters != null ? additionalParameters : Map.of())
                .attributes(attrs -> {
                    if (attributes != null) attrs.putAll(attributes);
                })
                .authorizationRequestUri(authorizationRequestUri)
                .build();
    }

    // Jackson needs getters/setters
    public String getAuthorizationUri() { return authorizationUri; }
    public void setAuthorizationUri(String authorizationUri) { this.authorizationUri = authorizationUri; }
    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }
    public String getRedirectUri() { return redirectUri; }
    public void setRedirectUri(String redirectUri) { this.redirectUri = redirectUri; }
    public Set<String> getScopes() { return scopes; }
    public void setScopes(Set<String> scopes) { this.scopes = scopes; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getResponseType() { return responseType; }
    public void setResponseType(String responseType) { this.responseType = responseType; }
    public Map<String, Object> getAdditionalParameters() { return additionalParameters; }
    public void setAdditionalParameters(Map<String, Object> additionalParameters) { this.additionalParameters = additionalParameters; }
    public Map<String, Object> getAttributes() { return attributes; }
    public void setAttributes(Map<String, Object> attributes) { this.attributes = attributes; }
    public String getAuthorizationRequestUri() { return authorizationRequestUri; }
    public void setAuthorizationRequestUri(String authorizationRequestUri) { this.authorizationRequestUri = authorizationRequestUri; }
}
