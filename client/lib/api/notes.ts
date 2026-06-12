import { api } from "./client";
import { mapNoteDto, mapNoteFolderDto, normalizeArray } from "./adapters";
import type {
  CreateNoteFolderRequest,
  CreateNoteRequest,
  UpdateNoteContentRequest,
  UpdateNoteFolderRequest,
  UpdateNoteMetadataRequest,
} from "../types";

function noteBase(workspaceId: string) {
  return `/workspace/${encodeURIComponent(workspaceId)}/note`;
}

export const noteApi = {
  getFolders: async (workspaceId: string) => {
    const { data } = await api.get(noteBase(workspaceId) + "/folder/all");
    return { folders: normalizeArray(data, mapNoteFolderDto) };
  },

  createFolder: (workspaceId: string, data: CreateNoteFolderRequest) =>
    api.post<{ id: string; createdAt: string }>(
      noteBase(workspaceId) + "/folder/create",
      data,
    ),

  updateFolder: (
    workspaceId: string,
    folderId: string,
    data: UpdateNoteFolderRequest,
  ) =>
    api.put(`${noteBase(workspaceId)}/folder/${encodeURIComponent(folderId)}`, {
      title: data.title,
      description: data.description ?? null,
    }),

  deleteFolder: (workspaceId: string, folderId: string) =>
    api.delete(
      `${noteBase(workspaceId)}/folder/${encodeURIComponent(folderId)}`,
    ),

  getAll: async (workspaceId: string) => {
    const { data } = await api.get(noteBase(workspaceId) + "/all");
    return { notes: normalizeArray(data, mapNoteDto) };
  },

  create: (workspaceId: string, data: CreateNoteRequest) =>
    api.post<{ id: string; createdAt: string }>(
      noteBase(workspaceId) + "/create",
      {
        noteFolderId: data.noteFolderId ?? null,
        title: data.title,
        noteColor: data.noteColor,
        noteDescription: data.noteDescription ?? "",
        contentJson: data.contentJson,
      },
    ),

  updateContent: (
    workspaceId: string,
    noteId: string,
    data: UpdateNoteContentRequest,
  ) =>
    api.put(
      `${noteBase(workspaceId)}/${encodeURIComponent(noteId)}/content`,
      data,
    ),

  updateMetadata: (
    workspaceId: string,
    noteId: string,
    data: UpdateNoteMetadataRequest,
  ) =>
    api.put(`${noteBase(workspaceId)}/${encodeURIComponent(noteId)}/metadata`, {
      title: data.title,
      noteColor: data.noteColor,
      noteFolderId: data.noteFolderId ?? null,
      noteDescription: data.noteDescription ?? "",
    }),

  delete: (workspaceId: string, noteId: string) =>
    api.delete(`${noteBase(workspaceId)}/${encodeURIComponent(noteId)}`),
};
