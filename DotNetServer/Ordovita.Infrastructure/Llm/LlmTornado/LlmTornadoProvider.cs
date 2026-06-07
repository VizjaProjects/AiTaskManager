using LlmTornado;
using LlmTornado.Chat;
using LlmTornado.Chat.Models;
using LlmTornado.Code;
using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Llm;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.LlmSettings;
using Ordovita.Domain.LlmSettings.Port;
using Ordovita.Infrastructure.Llm.Groq;

namespace Ordovita.Infrastructure.Llm.LlmTornado;

public class LlmTornadoProvider(
    GroqConfiguration configuration,
    ILlmSettingsRepository repository,
    IUserRepository userRepository,
    IUserContext context) : IAiClient
{
    public async Task<Result<AiResponse>> AskAsync(AiRequest request, Guid? llmSettingId, Uri? customUrl, CancellationToken ct)
    {
        if (context.UserId == null)
            return Result.Failure<AiResponse>(Error.Unauthorized("AskAsync", "Access denied"));

        var user = await userRepository.GetAsyncByAspId(context.UserId.Value.ToString(), ct);

        if (user == null)
            return Result.Failure<AiResponse>(Error.NotFound("AskAsync", "User not found"));

        Domain.LlmSettings.LlmSettings llmSettings;

        if (llmSettingId != null)
            llmSettings = await repository.GetByIdAsync(LlmSettingsId.From(llmSettingId.Value), user.Id, ct);
        else
            llmSettings = null;
        
        TornadoApi api;
        ChatModel model;
        if (llmSettings == null)
        {
            api = GetTornadoApi("Groq", configuration.ApiKey);
            model = ChatModel.Groq.OpenAi.GptOss120B;
        }
        else if (llmSettings != null && llmSettings.CustomUrl != null)
        {
            api = GetTornadoApi(llmSettings.CustomUrl);
            model = new ChatModel(llmSettings.Model);
        }
        else
        {
            api = GetTornadoApi(llmSettings.Provider, llmSettings.ApiKey);
            model = new ChatModel(llmSettings.Model, llmSettings.ApiKey);
        }


        var result = await api.Chat.CreateChatCompletion(new ChatRequest
        {
            Model = model,
            Messages =
            [
                new ChatMessage(ChatMessageRoles.User, request.Prompt)
            ]
        });

        var content = result?.Choices?[0].Message?.Content;
        if (content == null) return Result.Failure<AiResponse>(Error.NotFound("AskAsync", "Message is empty!"));

        return Result.Success(new AiResponse(content, 123, request.Prompt));
    }

    private static TornadoApi GetTornadoApi(string provider, string apiKey)
    {
        if (!Enum.TryParse<LLmProviders>(provider, true, out var providerEnum))
            throw new ArgumentException($"Unsupported LLM provider: {provider}", nameof(provider));

        var tornadoApi = new TornadoApi(new[]
        {
            new ProviderAuthentication(providerEnum, apiKey)
        });

        return tornadoApi;
    }

    private static TornadoApi GetTornadoApi(Uri customUrl)
    {
        return new TornadoApi(customUrl);
    }
}