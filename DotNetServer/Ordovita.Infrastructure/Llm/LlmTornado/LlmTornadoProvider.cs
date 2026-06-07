using LlmTornado;
using LlmTornado.Chat;
using LlmTornado.Chat.Models;
using LlmTornado.Code;
using LlmTornado.Code.Models;
using LlmTornado.Models;
using Ordovita.Application.Abstraction.Llm;
using Ordovita.Domain.Common;
using Ordovita.Infrastructure.Llm.Groq;

namespace Ordovita.Infrastructure.Llm.LlmTornado;

public class LlmTornadoProvider(GroqConfiguration configuration) : IAiClient
{
    public async Task<Result<AiResponse>> AskAsync(AiRequest request, CancellationToken ct)
    {
        // TornadoApi api = new TornadoApi(new[]
        // {
        //     new ProviderAuthentication(LLmProviders.Groq, configuration.ApiKey)
        // });
        // var result = await api.Chat.CreateChatCompletion(new ChatRequest
        // {
        //     Model = ChatModel.Groq.OpenAi.GptOss120B,
        //     Messages = [
        //         new ChatMessage(ChatMessageRoles.User, request.Prompt)
        //     ]
        // });


        // string[] prodivers = System.Enum.GetNames(typeof(LLmProviders));
        // foreach (var prodiver in prodivers)
        // {
        //     Console.WriteLine("provider " + prodiver);
        // }
        //
        // foreach (var VARIABLE in ChatModel.AllModels)
        // {
        //     Console.WriteLine("------------------------");
        //     // Console.WriteLine("model " + VARIABLE.Name);
        //     Console.WriteLine("provider " + VARIABLE.Provider);
        //     Console.WriteLine("model " + VARIABLE.ApiName);
        // }
        //
        var newModel = new ChatModel("openai/o4-mini:high");


        Console.WriteLine("model: " + newModel.Name);
        Console.WriteLine("Provider: " + newModel.Provider);

        var newModel2 = new ChatModel("okimi-k2-0905-preview");


        Console.WriteLine("model: " + newModel2.Name);
        Console.WriteLine("Provider: " + newModel2.Provider);


        foreach (var provider in ChatModel.AllProviders)
        {
            Console.WriteLine("provider " + provider.Provider);

            foreach (var model in provider.AllModels.OrderBy(x => x.GetApiName))
            {
                var aliases = model.Aliases is { Count: > 0 }
                    ? string.Join(", ", model.Aliases)
                    : "-";

                Console.WriteLine(
                    $"Name: {model.Name}\n" +
                    $"ApiName: {model.GetApiName}\n" +
                    $"Aliases: {aliases}");
            }
        }


        return Result.Success(new AiResponse(null, 123, request.Prompt));
    }
}