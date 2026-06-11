using Ordovita.Api.Common;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Note;
using Ordovita.Application.Note.CreateNote;
using Ordovita.Application.Note.CreateNoteFolder;
using Ordovita.Application.Note.DeleteNote;
using Ordovita.Application.Note.GetWorkspaceNoteFolders;
using Ordovita.Application.Note.GetWorkspaceNotes;
using Ordovita.Application.Note.UpdateNoteContent;
using Ordovita.Application.Note.UpdateNoteMetadata;

namespace Ordovita.Api.Note;

public static class NoteEndpoint
{
    public static RouteGroupBuilder MapNoteEndpoints(this IEndpointRouteBuilder root)
    {
        var g = root.MapGroup("/workspace/{workspaceId:guid}/note").WithTags("Notes").RequireAuthorization();

        g.MapPost("/folder/create", CreateFolder)
            .WithName("CreateNoteFolder")
            .Produces<CreateNoteFolderResult>(201)
            .Produces(400)
            .Produces(401);

        g.MapGet("/folder/all", GetWorkspaceNoteFolders)
            .WithName("GetWorkspaceNoteFolders")
            .Produces<IReadOnlyList<NoteFolderDto>>(200)
            .Produces(401);
            
        g.MapPost("/create", CreateNote)
            .WithName("CreateNote")
            .Produces<CreateNoteResult>(201)
            .Produces(400)
            .Produces(401);

        g.MapGet("/all", GetWorkspaceNotes)
            .WithName("GetWorkspaceNotes")
            .Produces<IReadOnlyList<NoteDto>>(200)
            .Produces(401);

        g.MapPut("/{noteId:guid}/content", UpdateNoteContent)
            .WithName("UpdateNoteContent")
            .Produces(200)
            .Produces(400)
            .Produces(401)
            .Produces(404);
        
        g.MapPut("/{noteId:guid}/metadata", UpdateNoteMetadata)
            .WithName("UpdateNoteMetadata")
            .Produces(200)
            .Produces(400)
            .Produces(401)
            .Produces(404);
        
        g.MapDelete("/{noteId:guid}", DeleteNote)
            .WithName("DeleteNote")
            .Produces(204)
            .Produces(401)
            .Produces(404);
        
        
        return g;
    }
    
    private static async Task<IResult> CreateFolder(
        Guid workspaceId, CreateNoteFolderRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new CreateNoteFolderCommand(workspaceId, request.Title), ct);
        return result.IsSuccess
            ? Results.Created(string.Empty, result.Value)
            : result.Error.ToProblem();
    }

    private static async Task<IResult> GetWorkspaceNoteFolders(Guid workspaceId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetWorkspaceNoteFoldersQuery(workspaceId), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }
    
    private static async Task<IResult> CreateNote(
        Guid workspaceId, CreateNoteRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new CreateNoteCommand(
            workspaceId, request.NoteFolderId, request.Title, request.NoteColor, request.ContentJson, request.NoteDescription), ct);
        return result.IsSuccess
            ? Results.Created($"/api/v1/workspace/{workspaceId}/note/{result.Value!.Id}", result.Value)
            : result.Error.ToProblem();
    }
    
    private static async Task<IResult> GetWorkspaceNotes(Guid workspaceId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetWorkspaceNotesQuery(workspaceId), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }
    
    private static async Task<IResult> UpdateNoteContent(
        Guid workspaceId, Guid noteId, UpdateNoteContentRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new UpdateNoteContentCommand(workspaceId, noteId, request.ContentJson), ct);
        return result.IsSuccess ? Results.Ok() : result.Error.ToProblem();
    }
    
    private static async Task<IResult> UpdateNoteMetadata(
        Guid workspaceId, Guid noteId, UpdateNoteMetadataRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new UpdateNoteMetadataCommand(
            workspaceId, noteId, request.Title, request.NoteColor, request.NoteDescription, request.NoteFolderId), ct);
        return result.IsSuccess ? Results.Ok() : result.Error.ToProblem();
    }
    
    private static async Task<IResult> DeleteNote(Guid workspaceId, Guid noteId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new DeleteNoteCommand(workspaceId, noteId), ct);
        return result.IsSuccess ? Results.NoContent() : result.Error.ToProblem();
    }

    
    private sealed record CreateNoteFolderRequest(string Title);
    private sealed record CreateNoteRequest(Guid? NoteFolderId, string Title, string NoteColor, string NoteDescription, string ContentJson);
    private sealed record UpdateNoteContentRequest(string ContentJson);
    private sealed record UpdateNoteMetadataRequest(string Title, string NoteColor, Guid? NoteFolderId, string NoteDescription);
    
}