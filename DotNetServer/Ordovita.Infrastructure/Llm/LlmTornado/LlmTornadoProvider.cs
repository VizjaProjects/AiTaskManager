using LlmTornado;
using LlmTornado.Chat;
using LlmTornado.Chat.Models;
using LlmTornado.Code;
using Ordovita.Application.Abstraction.Crypto;
using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Llm;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.LlmSettings;
using Ordovita.Domain.LlmSettings.Port;
using Ordovita.Domain.LlmStatistic;
using Ordovita.Infrastructure.Llm.Groq;
using RequestType = Ordovita.Application.Abstraction.Llm.RequestType;

namespace Ordovita.Infrastructure.Llm.LlmTornado;

public class LlmTornadoProvider(
    GroqConfiguration configuration,
    ILlmSettingsRepository repository,
    IUserRepository userRepository,
    ICryptoService cryptoService,
    ILlmStatisticRepository llmStatisticRepository,
    IUserContext context,IUnitOfWork uow) : IAiClient
{
    public async Task<Result<AiResponse>> AskAsync(
        AiRequest request,
        Guid? llmSettingId,
        CancellationToken ct)
    {
        if (context.UserId is null)
            return Result.Failure<AiResponse>(Error.Unauthorized("AskAsync", "Access denied"));

        var user = await userRepository.GetAsyncByAspId(context.UserId.Value.ToString(), ct);

        if (user is null)
            return Result.Failure<AiResponse>(Error.NotFound("AskAsync", "User not found"));


        var llmSettings = llmSettingId.HasValue
            ? await repository.GetByIdAsync(LlmSettingsId.From(llmSettingId.Value), user.Id, ct)
            : null;

        var (api, model, requestType) = ResolveApiAndModel(llmSettings);

        var result = await api.Chat.CreateChatCompletion(new ChatRequest
        {
            Model = model,
            Messages = [new ChatMessage(ChatMessageRoles.User, request.Prompt)]
        });
        

        var content = result?.Choices?[0].Message?.Content;

        if (content is null)
            return Result.Failure<AiResponse>(Error.NotFound("AskAsync", "Message is empty!"));
        
        var inputTokens = result?.Usage?.PromptTokens;
        var outputTokens = result?.Usage?.CompletionTokens;
        var totalToken = result?.Usage?.TotalTokens;
        var domainRequestType = Enum.Parse<Ordovita.Domain.LlmStatistic.RequestType>(requestType.ToString());

        var llmStatistic = Domain.LlmStatistic.LlmStatistic.Create(request.Prompt, outputTokens!.Value, inputTokens!.Value,
            totalToken!.Value, user.Id, domainRequestType);
        
        await llmStatisticRepository.AddAsync(llmStatistic.Value!, ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success(new AiResponse(content, inputTokens!.Value,outputTokens!.Value,totalToken!.Value, request.Prompt, requestType));
    }

    private (TornadoApi Api, ChatModel Model, RequestType requestType) ResolveApiAndModel(Domain.LlmSettings.LlmSettings? llmSettings)
    {
 
        if (llmSettings is null)
            return (GetTornadoApi("Groq", configuration.ApiKey), ChatModel.Groq.OpenAi.GptOss120B,  RequestType.Standard);

        if (llmSettings.CustomUrl is not null)
            return (GetTornadoApi(llmSettings.CustomUrl), new ChatModel(llmSettings.Model),  RequestType.Custom);

        if (llmSettings.Provider is null || llmSettings.ApiKey is null)
            throw new InvalidOperationException($"LlmSettings '{llmSettings.Id}' is missing Provider or ApiKey.");

        if (!Enum.TryParse<LLmProviders>(llmSettings.Provider, true, out var providerEnum))
            throw new ArgumentException($"Unsupported LLM provider: {llmSettings.Provider}",
                nameof(llmSettings.Provider));

        var decryptedApiKey = cryptoService.Decrypt(llmSettings.ApiKey);
        var api = new TornadoApi([new ProviderAuthentication(providerEnum, decryptedApiKey)]);

        ChatModel model;

        if (llmSettings.Model.Contains("gpt-oss-120b", StringComparison.OrdinalIgnoreCase))
        {
            model = ChatModel.Groq.OpenAi.GptOss120B;
        }
        else
        {
            var cleanModelName = llmSettings.Model.Contains('/')
                ? llmSettings.Model.Split('/').Last()
                : llmSettings.Model;

            model = new ChatModel(cleanModelName, providerEnum);
        }

        return (api, model, RequestType.Custom);
    }

    private static TornadoApi GetTornadoApi(string provider, string apiKey)
    {
        if (!Enum.TryParse<LLmProviders>(provider, true, out var providerEnum))
            throw new ArgumentException($"Unsupported LLM provider: {provider}", nameof(provider));

        return new TornadoApi([new ProviderAuthentication(providerEnum, apiKey)]);
    }

    private static TornadoApi GetTornadoApi(Uri customUrl)
    {
        return new TornadoApi(customUrl);
    }
}