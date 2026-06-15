import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  useWindowDimensions,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { PageLayout } from "../PageLayout";
import { LinkCheckboxModal } from "@/components/molecules";
import { RichTextEditor } from "./RichTextEditor";
import type { RichTextEditorHandle } from "./RichTextEditor.types";
import { NoteEditorToolbar, type EditorCommand } from "./NoteEditorToolbar";
import {
  useNotes,
  useNoteFolders,
  useCreateNote,
  useCreateNoteFolder,
  useUpdateNoteContent,
  useUpdateNoteMetadata,
  useDeleteNote,
  useUpdateNoteFolder,
  useDeleteNoteFolder,
  useSetNoteLinks,
  useTasks,
  useEvents,
} from "@/lib/hooks";
import { useAiPlanningRequestStore, useThemeStore } from "@/lib/stores";
import { useWorkspaceStore } from "@/lib/stores/workspace";
import type { Note, NoteFolder } from "@/lib/types";
import { getNoteThemeColors, NOTE_COLORS } from "@/lib/noteTheme";
import { formatDateTime } from "@/lib/utils";

const NO_OUTLINE =
  Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : undefined;

const EMPTY_STATE = {
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  insertUnorderedList: false,
  insertOrderedList: false,
};

const NOTE_DRAG_TYPE = "application/note-id";
const CONTEXT_MENU_WIDTH = 220;
const CONTEXT_MENU_ITEM_HEIGHT = 44;
const MAX_AI_PLAN_TEXT_LENGTH = 4000;

type ContextMenuState =
  | { kind: "folder"; folder: NoteFolder; x: number; y: number }
  | { kind: "note"; note: Note; x: number; y: number };

type RenameTarget =
  | { kind: "folder"; folder: NoteFolder }
  | { kind: "note"; note: Note };

function showMessage(title: string, message: string) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

export function NotesScreen() {
  const { width, height } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const enqueueAiPlanningRequest = useAiPlanningRequestStore((s) => s.enqueue);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const router = useRouter();
  const params = useLocalSearchParams<{ noteId?: string }>();

  // Larger, device-aware base font so notes read comfortably on phones.
  const editorFontSize = Platform.OS !== "web" ? 19 : width < 768 ? 18.5 : 17.5;

  const { data: notes = [], isLoading } = useNotes();
  const { data: folders = [] } = useNoteFolders();
  const { data: tasks = [] } = useTasks();
  const { data: events = [] } = useEvents();
  const createNote = useCreateNote();
  const createFolder = useCreateNoteFolder();
  const updateContent = useUpdateNoteContent();
  const updateMetadata = useUpdateNoteMetadata();
  const deleteNote = useDeleteNote();
  const updateFolder = useUpdateNoteFolder();
  const deleteFolder = useDeleteNoteFolder();
  const setNoteLinks = useSetNoteLinks();

  // note → tasks/events linking modal
  const [linkNote, setLinkNote] = useState<Note | null>(null);
  const [linkTaskIds, setLinkTaskIds] = useState<string[]>([]);
  const [linkEventIds, setLinkEventIds] = useState<string[]>([]);

  // navigation: null = root overview, otherwise inside a folder
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null);

  // In-app confirmation modal (replaces window.confirm / native Alert).
  const [confirmState, setConfirmState] = useState<{
    message: string;
    confirmLabel: string;
    tone: "danger" | "default";
    onConfirm: () => void;
  } | null>(null);

  function requestConfirm(
    message: string,
    onConfirm: () => void,
    opts?: { confirmLabel?: string; tone?: "danger" | "default" },
  ) {
    setConfirmState({
      message,
      confirmLabel: opts?.confirmLabel ?? "Usuń",
      tone: opts?.tone ?? "danger",
      onConfirm,
    });
  }

  // folder context menu / edit
  const [menuFolder, setMenuFolder] = useState<NoteFolder | null>(null);
  const [menuTitle, setMenuTitle] = useState("");
  const [menuDesc, setMenuDesc] = useState("");
  // native "move note to folder" sheet
  const [moveNoteId, setMoveNoteId] = useState<string | null>(null);

  // editor buffers
  const [title, setTitle] = useState("");
  const [color, setColor] = useState<string>(NOTE_COLORS[0]);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [toolbarState, setToolbarState] = useState(EMPTY_STATE);
  const editorRef = useRef<RichTextEditorHandle>(null);
  const titleInputRef = useRef<TextInput>(null);
  const focusTitleRef = useRef(false);
  const finderDragSurfaceRef = useRef<View>(null);
  const htmlRef = useRef("");
  const contentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const metaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingMetaRef = useRef<{
    noteId: string;
    title: string;
    noteColor: string;
    noteFolderId: string | null;
    noteDescription: string;
  } | null>(null);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  );

  const currentFolder = useMemo(
    () => folders.find((f) => f.id === currentFolderId) ?? null,
    [folders, currentFolderId],
  );
  const editorTheme = useMemo(
    () => getNoteThemeColors(color, isDark),
    [color, isDark],
  );

  const notesInView = useMemo(() => {
    const list = notes.filter((n) =>
      currentFolderId ? n.noteFolderId === currentFolderId : !n.noteFolderId,
    );
    return [...list].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [notes, currentFolderId]);

  const linkSections = useMemo(() => {
    if (!linkNote) return [];

    return [
      {
        label: "Zadania",
        emptyMessage: "Brak zadań w tym workspace.",
        items: tasks.map((t) => ({
          id: t.taskId,
          label: t.title,
          subtitle: t.description?.trim() || undefined,
          searchText: t.description ?? "",
        })),
        selectedIds: linkTaskIds,
        onToggle: (id: string) =>
          setLinkTaskIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
          ),
      },
      {
        label: "Wydarzenia",
        emptyMessage: "Brak wydarzeń w tym workspace.",
        items: events.map((e) => ({
          id: e.eventId,
          label: e.title,
          subtitle:
            typeof e.startDateTime === "string" && e.startDateTime
              ? formatDateTime(e.startDateTime)
              : undefined,
        })),
        selectedIds: linkEventIds,
        onToggle: (id: string) =>
          setLinkEventIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
          ),
      },
    ];
  }, [linkNote, tasks, events, linkTaskIds, linkEventIds]);

  // load selected note into buffers
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setColor(selectedNote.noteColor || NOTE_COLORS[0]);
      setFolderId(selectedNote.noteFolderId);
      htmlRef.current = selectedNote.content.html;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNoteId]);

  // Autofocus the title field when a brand-new note is opened.
  useEffect(() => {
    if (!editorOpen || !selectedNote || !focusTitleRef.current) return;
    focusTitleRef.current = false;
    const t = setTimeout(() => {
      titleInputRef.current?.focus();
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorOpen, selectedNoteId]);

  // Deep-link: open a specific note when navigated with ?noteId=… (e.g. from a
  // task). Navigate into the note's folder first so it's found in any view.
  const handledNoteParamRef = useRef<string | null>(null);
  useEffect(() => {
    const noteId = params.noteId;
    if (!noteId || notes.length === 0) return;
    if (handledNoteParamRef.current === noteId) return;
    const target = notes.find((n) => n.id === noteId);
    if (!target) return;
    handledNoteParamRef.current = noteId;
    setCurrentFolderId(target.noteFolderId ?? null);
    openNote(noteId);
    // Clear the param so re-opening the same note later works.
    router.setParams({ noteId: undefined } as never);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.noteId, notes]);

  useEffect(() => {
    return () => {
      if (contentTimer.current) clearTimeout(contentTimer.current);
      if (metaTimer.current) clearTimeout(metaTimer.current);
    };
  }, []);

  useEffect(() => {
    setLinkNote(null);
    setLinkTaskIds([]);
    setLinkEventIds([]);
    setSelectedNoteId(null);
    setEditorOpen(false);
    setCurrentFolderId(null);
    handledNoteParamRef.current = null;
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (Platform.OS !== "web" || !contextMenu) return;

    const close = () => setContextMenu(null);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [contextMenu]);

  useEffect(() => {
    if (Platform.OS !== "web" || !finderDragSurfaceRef.current) return;
    const element = finderDragSurfaceRef.current as unknown as HTMLElement;

    const isNoteDrag = (event: DragEvent) =>
      Array.from(event.dataTransfer?.types ?? []).includes(NOTE_DRAG_TYPE);

    const handleDragOver = (event: DragEvent) => {
      if (!isNoteDrag(event) || !event.dataTransfer) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (event: DragEvent) => {
      if (!isNoteDrag(event)) return;
      event.preventDefault();
    };

    element.addEventListener("dragover", handleDragOver);
    element.addEventListener("drop", handleDrop);
    return () => {
      element.removeEventListener("dragover", handleDragOver);
      element.removeEventListener("drop", handleDrop);
    };
  }, []);

  function scheduleContentSave(html: string) {
    htmlRef.current = html;
    if (!selectedNoteId) return;
    if (contentTimer.current) clearTimeout(contentTimer.current);
    const id = selectedNoteId;
    contentTimer.current = setTimeout(() => {
      contentTimer.current = null;
      updateContent.mutate({ noteId: id, html });
    }, 800);
  }

  function scheduleMetaSave(next: {
    title?: string;
    color?: string;
    folderId?: string | null;
  }) {
    if (!selectedNoteId) return;
    const id = selectedNoteId;
    const payload = {
      noteId: id,
      title: next.title ?? title,
      noteColor: next.color ?? color,
      noteFolderId: next.folderId !== undefined ? next.folderId : folderId,
      noteDescription: selectedNote?.noteDescription ?? "",
    };
    pendingMetaRef.current = payload;
    if (metaTimer.current) clearTimeout(metaTimer.current);
    metaTimer.current = setTimeout(() => {
      metaTimer.current = null;
      pendingMetaRef.current = null;
      updateMetadata.mutate(payload);
    }, 600);
  }

  async function flushPendingEditorSaves() {
    const saves: Promise<unknown>[] = [];

    if (contentTimer.current && selectedNoteId) {
      clearTimeout(contentTimer.current);
      contentTimer.current = null;
      saves.push(
        updateContent.mutateAsync({
          noteId: selectedNoteId,
          html: htmlRef.current,
        }),
      );
    }

    if (metaTimer.current && pendingMetaRef.current) {
      clearTimeout(metaTimer.current);
      metaTimer.current = null;
      const payload = pendingMetaRef.current;
      pendingMetaRef.current = null;
      saves.push(updateMetadata.mutateAsync(payload));
    }

    await Promise.all(saves);
  }

  async function handleCreateNote() {
    const res = await createNote.mutateAsync({
      title: "Nowa notatka",
      noteColor: color || NOTE_COLORS[0],
      noteFolderId: currentFolderId,
      html: "",
    });
    const newId = (res.data as { id: string }).id;
    // New note → land with the cursor in the title field, text pre-selected.
    focusTitleRef.current = true;
    openNote(newId);
  }

  async function handleCreateFolder() {
    const name = folderName.trim();
    if (!name) return;
    await createFolder.mutateAsync(name);
    setFolderName("");
    setCreatingFolder(false);
  }

  function openNote(id: string) {
    setSelectedNoteId(id);
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
  }

  function handleDelete() {
    if (!selectedNoteId) return;
    deleteNoteById(selectedNoteId);
  }

  function deleteNoteById(id: string) {
    requestConfirm("Usunąć tę notatkę?", () => {
      deleteNote.mutate(id);
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
        setEditorOpen(false);
      }
    });
  }

  function moveNoteToFolder(noteId: string, targetFolderId: string | null) {
    const note = notes.find((n) => n.id === noteId);
    if (!note || note.noteFolderId === targetFolderId) return;
    updateMetadata.mutate({
      noteId,
      title: note.title,
      noteColor: note.noteColor,
      noteFolderId: targetFolderId,
      noteDescription: note.noteDescription ?? "",
    });
  }

  function openLinkModal(note: Note) {
    setLinkNote(note);
    setLinkTaskIds(note.linkedTaskIds ?? []);
    setLinkEventIds(note.linkedEventIds ?? []);
  }

  function saveLinks() {
    if (!linkNote) return;
    setNoteLinks.mutate({
      noteId: linkNote.id,
      taskIds: linkTaskIds,
      eventIds: linkEventIds,
    });
    setLinkNote(null);
  }

  function openFolderMenu(folder: NoteFolder) {
    setMenuFolder(folder);
    setMenuTitle(folder.title);
    setMenuDesc(folder.description ?? "");
  }

  function deleteFolderById(id: string) {
    requestConfirm(
      "Usunąć ten folder? Notatki zostaną przeniesione do „Bez folderu”.",
      () => {
        deleteFolder.mutate(id);
        if (menuFolder?.id === id) setMenuFolder(null);
        if (currentFolderId === id) setCurrentFolderId(null);
      },
    );
  }

  async function handleSaveFolder() {
    if (!menuFolder) return;
    const name = menuTitle.trim();
    if (!name) return;
    await updateFolder.mutateAsync({
      folderId: menuFolder.id,
      title: name,
      description: menuDesc.trim() || null,
    });
    setMenuFolder(null);
  }

  function handleDeleteFolder() {
    if (!menuFolder) return;
    deleteFolderById(menuFolder.id);
  }

  function openFolderContextMenu(
    folder: NoteFolder,
    point: { x: number; y: number },
  ) {
    setContextMenu({ kind: "folder", folder, ...point });
  }

  function openNoteContextMenu(note: Note, point: { x: number; y: number }) {
    setContextMenu({ kind: "note", note, ...point });
  }

  function commitRename(value: string) {
    const target = renameTarget;
    setRenameTarget(null);
    if (!target) return;

    const nextTitle = value.trim();
    if (!nextTitle) return;

    if (target.kind === "folder") {
      if (nextTitle === target.folder.title) return;
      updateFolder.mutate({
        folderId: target.folder.id,
        title: nextTitle,
        description: target.folder.description,
      });
      return;
    }

    if (nextTitle === target.note.title) return;
    updateMetadata.mutate({
      noteId: target.note.id,
      title: nextTitle,
      noteColor: target.note.noteColor,
      noteFolderId: target.note.noteFolderId,
      noteDescription: target.note.noteDescription ?? "",
    });
  }

  function beginRename(target: RenameTarget) {
    setContextMenu(null);
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.setTimeout(() => setRenameTarget(target), 0);
      return;
    }
    setRenameTarget(target);
  }

  async function handleScheduleSelection(rawText: string) {
    const selectedText = rawText.trim();
    if (!selectedText) return;
    if (selectedText.length > MAX_AI_PLAN_TEXT_LENGTH) {
      showMessage(
        "Zaznaczenie jest za długie",
        `Do planowania można wysłać maksymalnie ${MAX_AI_PLAN_TEXT_LENGTH} znaków.`,
      );
      return;
    }

    requestConfirm(
      "Wysłać zaznaczony tekst do AI, aby zaproponować zadania i wydarzenia?",
      () => {
        void runScheduleSelection(selectedText);
      },
      { confirmLabel: "Wyślij do AI", tone: "default" },
    );
  }

  async function runScheduleSelection(selectedText: string) {
    try {
      await flushPendingEditorSaves();
      enqueueAiPlanningRequest(selectedText);
      setEditorOpen(false);
      router.push("/(app)/ai-task" as never);
    } catch {
      showMessage(
        "Nie udało się zapisać notatki",
        "Spróbuj ponownie przed wysłaniem tekstu do planowania.",
      );
    }
  }

  function command(cmd: EditorCommand) {
    editorRef.current?.sendCommand(cmd);
  }

  /* ---------- editor modal ---------- */

  const editorBody = selectedNote ? (
    <View
      className="flex-1 overflow-hidden"
      style={{ backgroundColor: editorTheme.background }}
    >
      {/* header */}
      <View
        className="px-4 pt-3 pb-2"
        style={{ borderBottomWidth: 1, borderBottomColor: editorTheme.border }}
      >
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={closeEditor} className="p-1 -ml-1">
            <MaterialIcons
              name="arrow-back"
              size={22}
              color={editorTheme.text}
            />
          </TouchableOpacity>
          <TextInput
            ref={titleInputRef}
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              scheduleMetaSave({ title: t });
            }}
            placeholder="Tytuł"
            placeholderTextColor={editorTheme.mutedText}
            selectTextOnFocus
            className="flex-1 font-headline text-xl"
            style={[
              NO_OUTLINE,
              { color: editorTheme.text, textAlign: "center" },
            ]}
          />
          <TouchableOpacity
            onPress={() => selectedNote && openLinkModal(selectedNote)}
            className="flex-row items-center gap-1 p-1.5"
          >
            <MaterialIcons name="link" size={20} color={editorTheme.text} />
            {selectedNote &&
            (selectedNote.linkedTaskIds.length +
              selectedNote.linkedEventIds.length) >
              0 ? (
              <Text
                className="font-label text-xs"
                style={{ color: editorTheme.text }}
              >
                {selectedNote.linkedTaskIds.length +
                  selectedNote.linkedEventIds.length}
              </Text>
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} className="p-1.5">
            <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* editor surface */}
      <RichTextEditor
        key={selectedNote.id}
        ref={editorRef}
        initialHtml={selectedNote.content.html}
        isDark={isDark}
        backgroundColor={editorTheme.background}
        fontSize={editorFontSize}
        onChange={scheduleContentSave}
        onScheduleSelection={handleScheduleSelection}
        onStateChange={setToolbarState}
      />

      {/* colour picker — bottom right */}
      <View className="flex-row justify-end items-center gap-2 px-4 py-2">
        {NOTE_COLORS.map((c) => {
          const swatchTheme = getNoteThemeColors(c, isDark);
          return (
            <TouchableOpacity
              key={c}
              onPress={() => {
                setColor(c);
                scheduleMetaSave({ color: c });
              }}
              className="w-5 h-5 rounded-full"
              style={{
                backgroundColor: swatchTheme.background,
                borderWidth: color.toUpperCase() === c ? 2 : 1,
                borderColor:
                  color.toUpperCase() === c
                    ? editorTheme.text
                    : swatchTheme.border,
              }}
            />
          );
        })}
      </View>

      {/* bottom macOS toolbar */}
      <NoteEditorToolbar
        state={toolbarState}
        isDark={isDark}
        onCommand={command}
      />
    </View>
  ) : null;

  const editorModal = (
    <Modal
      visible={editorOpen && !!selectedNote}
      transparent
      animationType="fade"
      onRequestClose={closeEditor}
    >
      <View className="flex-1 bg-black/50 items-center justify-center">
        <Pressable
          style={{ position: "absolute", inset: 0 } as never}
          onPress={closeEditor}
        />
        <View
          className="bg-surface-container-lowest overflow-hidden shadow-lg"
          style={
            isDesktop
              ? {
                  width: Math.min(1320, width - 48),
                  height: "96%",
                  borderRadius: 20,
                }
              : { width: "100%", height: "100%" }
          }
        >
          {editorBody}
        </View>
      </View>
    </Modal>
  );

  /* ---------- folder edit modal ---------- */

  const folderEditModal = (
    <Modal
      visible={!!menuFolder}
      transparent
      animationType="fade"
      onRequestClose={() => setMenuFolder(null)}
    >
      <Pressable
        className="flex-1 bg-black/40 items-center justify-center px-6"
        onPress={() => setMenuFolder(null)}
      >
        <Pressable
          onPress={() => {}}
          className="w-full max-w-[360px] bg-surface-container-lowest rounded-2xl p-4 gap-3 border border-outline-variant"
        >
          <Text className="text-on-surface font-headline text-base">
            Edytuj folder
          </Text>
          <TextInput
            value={menuTitle}
            onChangeText={setMenuTitle}
            placeholder="Nazwa folderu"
            placeholderTextColor="#9ca3af"
            className="bg-surface-container-low rounded-lg px-3 py-2.5 text-on-surface font-body text-sm border border-outline-variant"
            style={NO_OUTLINE}
          />
          <TextInput
            value={menuDesc}
            onChangeText={setMenuDesc}
            placeholder="Opis (opcjonalnie)"
            placeholderTextColor="#9ca3af"
            multiline
            className="bg-surface-container-low rounded-lg px-3 py-2.5 text-on-surface font-body text-sm border border-outline-variant min-h-[64px]"
            style={NO_OUTLINE}
          />
          <View className="flex-row items-center justify-between mt-1">
            <TouchableOpacity
              onPress={handleDeleteFolder}
              className="flex-row items-center gap-1.5 px-2 py-2"
            >
              <MaterialIcons name="delete-outline" size={18} color="#ef4444" />
              <Text className="text-error font-label text-sm">Usuń</Text>
            </TouchableOpacity>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => setMenuFolder(null)}
                className="px-3 py-2"
              >
                <Text className="text-on-surface-variant font-label text-sm">
                  Anuluj
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveFolder}
                className="bg-primary rounded-xl px-4 py-2"
              >
                <Text className="text-on-primary font-headline text-sm">
                  Zapisz
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

  /* ---------- move-to-folder sheet (native fallback) ---------- */

  const moveSheet = (
    <Modal
      visible={!!moveNoteId}
      transparent
      animationType="fade"
      onRequestClose={() => setMoveNoteId(null)}
    >
      <Pressable
        className="flex-1 bg-black/40 justify-end"
        onPress={() => setMoveNoteId(null)}
      >
        <Pressable
          onPress={() => {}}
          className="bg-surface-container-lowest rounded-t-2xl p-4 gap-1 border-t border-outline-variant"
        >
          <Text className="text-on-surface font-headline text-base mb-1">
            Przenieś do folderu
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (moveNoteId) moveNoteToFolder(moveNoteId, null);
              setMoveNoteId(null);
            }}
            className="flex-row items-center gap-3 px-2 py-3"
          >
            <MaterialIcons name="inbox" size={20} color="#777587" />
            <Text className="text-on-surface font-body text-sm">
              Bez folderu
            </Text>
          </TouchableOpacity>
          {folders.map((f) => (
            <TouchableOpacity
              key={f.id}
              onPress={() => {
                if (moveNoteId) moveNoteToFolder(moveNoteId, f.id);
                setMoveNoteId(null);
              }}
              className="flex-row items-center gap-3 px-2 py-3"
            >
              <MaterialIcons name="folder" size={20} color="#4d41df" />
              <Text className="text-on-surface font-body text-sm">
                {f.title}
              </Text>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );

  /* ---------- finder context menu (web / desktop) ---------- */

  const contextMenuItemCount =
    contextMenu?.kind === "note"
      ? contextMenu.note.noteFolderId
        ? 4
        : 3
      : 2;
  const contextMenuHeight =
    contextMenuItemCount * CONTEXT_MENU_ITEM_HEIGHT + 25;
  const contextMenuLeft = contextMenu
    ? Math.max(
        8,
        Math.min(contextMenu.x, Math.max(8, width - CONTEXT_MENU_WIDTH - 8)),
      )
    : 8;
  const contextMenuTop = contextMenu
    ? Math.max(
        8,
        Math.min(contextMenu.y, Math.max(8, height - contextMenuHeight - 8)),
      )
    : 8;

  const finderContextMenu = (
    <Modal
      visible={Platform.OS === "web" && !!contextMenu}
      transparent
      animationType="none"
      onRequestClose={() => setContextMenu(null)}
    >
      <Pressable
        style={{ position: "absolute", inset: 0 } as never}
        onPress={() => setContextMenu(null)}
      />
      {contextMenu ? (
        <View
          className="bg-surface-container-lowest border border-outline-variant rounded-xl py-2 shadow-lg overflow-hidden"
          style={{
            position: "absolute",
            left: contextMenuLeft,
            top: contextMenuTop,
            width: CONTEXT_MENU_WIDTH,
          }}
        >
          <ContextMenuItem
            icon="drive-file-rename-outline"
            label="Zmień nazwę"
            onPress={() => {
              beginRename(
                contextMenu.kind === "folder"
                  ? { kind: "folder", folder: contextMenu.folder }
                  : { kind: "note", note: contextMenu.note },
              );
            }}
          />
          {contextMenu.kind === "note" && contextMenu.note.noteFolderId ? (
            <ContextMenuItem
              icon="drive-file-move-outline"
              label="Przenieś poza folder"
              onPress={() => {
                moveNoteToFolder(contextMenu.note.id, null);
                setContextMenu(null);
              }}
            />
          ) : null}
          {contextMenu.kind === "note" ? (
            <ContextMenuItem
              icon="link"
              label="Połącz z zadaniami / wydarzeniami"
              onPress={() => {
                const note = contextMenu.note;
                setContextMenu(null);
                openLinkModal(note);
              }}
            />
          ) : null}
          <View className="h-px bg-outline-variant/60 mx-2 my-1" />
          <ContextMenuItem
            icon="delete-outline"
            label="Usuń"
            destructive
            onPress={() => {
              const target = contextMenu;
              setContextMenu(null);
              if (target.kind === "folder") {
                deleteFolderById(target.folder.id);
              } else {
                deleteNoteById(target.note.id);
              }
            }}
          />
        </View>
      ) : null}
    </Modal>
  );

  /* ---------- finder ---------- */

  const newFolderControl = creatingFolder ? (
    <View className="flex-row items-center gap-2">
      <TextInput
        value={folderName}
        onChangeText={setFolderName}
        placeholder="Nazwa folderu"
        placeholderTextColor="#9ca3af"
        autoFocus
        onSubmitEditing={handleCreateFolder}
        className="bg-surface-container-low rounded-lg px-3 py-2 text-on-surface font-body text-sm border border-outline-variant"
        style={NO_OUTLINE}
      />
      <TouchableOpacity onPress={handleCreateFolder} className="p-1">
        <MaterialIcons name="check" size={20} color="#4d41df" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setCreatingFolder(false)}
        className="p-1"
      >
        <MaterialIcons name="close" size={20} color="#777587" />
      </TouchableOpacity>
    </View>
  ) : (
    <TouchableOpacity
      onPress={() => setCreatingFolder(true)}
      className="flex-row items-center gap-1.5 rounded-xl border border-outline-variant px-3 py-2"
    >
      <MaterialIcons name="create-new-folder" size={16} color="#777587" />
      <Text className="text-on-surface-variant font-label text-xs">
        Nowy folder
      </Text>
    </TouchableOpacity>
  );

  const finder = (
    <View className="flex-1 gap-4">
      {/* breadcrumb + actions */}
      <View className="flex-row items-center justify-between flex-wrap gap-2">
        <View className="flex-row items-center gap-1">
          <RootCrumb
            active={!currentFolderId}
            onPress={() => setCurrentFolderId(null)}
            onMoveNoteOut={(id) => moveNoteToFolder(id, null)}
          />
          {currentFolder && (
            <>
              <MaterialIcons name="chevron-right" size={20} color="#9ca3af" />
              <Text className="text-on-surface font-headline text-headline-md">
                {currentFolder.title}
              </Text>
              <TouchableOpacity
                onPress={() => openFolderMenu(currentFolder)}
                className="p-1"
              >
                <MaterialIcons name="more-horiz" size={20} color="#777587" />
              </TouchableOpacity>
            </>
          )}
        </View>
        <View className="flex-row items-center gap-2">
          {!currentFolderId && newFolderControl}
          <TouchableOpacity
            onPress={handleCreateNote}
            className="flex-row items-center gap-1.5 bg-primary rounded-xl px-3 py-2"
          >
            <MaterialIcons
              name="add"
              size={16}
              color={isDark ? "#121212" : "#fff"}
            />
            <Text className="text-on-primary font-headline text-xs">Nowa</Text>
          </TouchableOpacity>
        </View>
      </View>

      {currentFolder?.description ? (
        <Text className="text-on-surface-variant font-body text-sm">
          {currentFolder.description}
        </Text>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {isLoading ? (
          <Text className="text-on-surface-variant font-body text-sm py-6 text-center">
            Ładowanie…
          </Text>
        ) : (
          <View className="flex-row flex-wrap gap-3 items-start">
            {/* folders (only in root) live beside the notes */}
            {!currentFolderId &&
              folders.map((f) => (
                <FolderTile
                  key={f.id}
                  folder={f}
                  count={notes.filter((n) => n.noteFolderId === f.id).length}
                  isDark={isDark}
                  onOpen={() => setCurrentFolderId(f.id)}
                  onMoveNoteIn={(id) => moveNoteToFolder(id, f.id)}
                  onMenu={() => openFolderMenu(f)}
                  onContextMenu={(point) => openFolderContextMenu(f, point)}
                  renaming={
                    renameTarget?.kind === "folder" &&
                    renameTarget.folder.id === f.id
                  }
                  onRename={commitRename}
                  onCancelRename={() => setRenameTarget(null)}
                />
              ))}

            {notesInView.map((n) => (
              <NoteFileTile
                key={n.id}
                note={n}
                isDark={isDark}
                onOpen={() => openNote(n.id)}
                onMove={() => setMoveNoteId(n.id)}
                onContextMenu={(point) => openNoteContextMenu(n, point)}
                renaming={
                  renameTarget?.kind === "note" && renameTarget.note.id === n.id
                }
                onRename={commitRename}
                onCancelRename={() => setRenameTarget(null)}
              />
            ))}

            {notesInView.length === 0 && (
                <View className="items-center py-10 gap-2 w-full">
                  <MaterialIcons
                    name="sticky-note-2"
                    size={28}
                    color="#9ca3af"
                  />
                  <Text className="text-on-surface-variant font-body text-sm text-center">
                    {currentFolderId
                      ? "Folder jest pusty."
                      : "Brak notatek. Utwórz pierwszą."}
                  </Text>
                </View>
              )}
          </View>
        )}
      </ScrollView>
    </View>
  );

  const confirmModal = (
    <Modal
      visible={!!confirmState}
      transparent
      animationType="fade"
      onRequestClose={() => setConfirmState(null)}
    >
      <Pressable
        className="flex-1 bg-black/40 items-center justify-center px-6"
        onPress={() => setConfirmState(null)}
      >
        <Pressable
          onPress={() => {}}
          className="w-full max-w-[360px] bg-surface-container-lowest rounded-2xl p-5 gap-4 border border-outline-variant"
        >
          <Text className="text-on-surface font-headline text-base">
            {confirmState?.tone === "danger"
              ? "Potwierdź usunięcie"
              : "Potwierdź"}
          </Text>
          <Text className="text-on-surface-variant font-body text-sm">
            {confirmState?.message}
          </Text>
          <View className="flex-row items-center justify-end gap-2 mt-1">
            <TouchableOpacity
              onPress={() => setConfirmState(null)}
              className="px-4 py-2 rounded-md"
            >
              <Text className="text-on-surface-variant font-label text-sm">
                Anuluj
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const action = confirmState?.onConfirm;
                setConfirmState(null);
                action?.();
              }}
              className={`px-4 py-2 rounded-md ${
                confirmState?.tone === "danger"
                  ? "bg-[rgba(192,57,43,0.1)] border border-[rgba(192,57,43,0.4)]"
                  : "bg-action"
              }`}
            >
              <Text
                className={`font-headline text-sm ${
                  confirmState?.tone === "danger"
                    ? "text-[#C0392B]"
                    : "text-on-action"
                }`}
              >
                {confirmState?.confirmLabel ?? "OK"}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

  const linkModal = (
    <LinkCheckboxModal
      visible={!!linkNote}
      title="Połącz notatkę"
      searchPlaceholder="Szukaj zadań i wydarzeń…"
      sections={linkSections}
      onClose={() => setLinkNote(null)}
      onSave={saveLinks}
    />
  );

  return (
    <PageLayout>
      <View ref={finderDragSurfaceRef} className="flex-1">
        {finder}
      </View>
      {editorModal}
      {folderEditModal}
      {moveSheet}
      {finderContextMenu}
      {confirmModal}
      {linkModal}
    </PageLayout>
  );
}

/* ---------- drag & drop (web) ---------- */

function useNoteDrop(onDropNote: (noteId: string) => void) {
  const ref = useRef<View>(null);
  const [over, setOver] = useState(false);
  useEffect(() => {
    if (Platform.OS !== "web" || !ref.current) return;
    const el = ref.current as unknown as HTMLElement;
    const onOver = (e: DragEvent) => {
      if (!e.dataTransfer) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setOver(true);
    };
    const onLeave = () => setOver(false);
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      setOver(false);
      const id = e.dataTransfer?.getData(NOTE_DRAG_TYPE);
      if (id) onDropNote(id);
    };
    el.addEventListener("dragover", onOver);
    el.addEventListener("dragleave", onLeave);
    el.addEventListener("drop", onDrop);
    return () => {
      el.removeEventListener("dragover", onOver);
      el.removeEventListener("dragleave", onLeave);
      el.removeEventListener("drop", onDrop);
    };
  }, [onDropNote]);
  return { ref, over };
}

function DraggableNote({
  noteId,
  children,
  disabled = false,
}: {
  noteId: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const ref = useRef<View>(null);
  useEffect(() => {
    if (Platform.OS !== "web" || !ref.current) return;
    const el = ref.current as unknown as HTMLElement;
    if (disabled) {
      el.draggable = false;
      el.style.cursor = "";
      return;
    }
    el.draggable = true;
    el.style.cursor = "grab";
    const onStart = (e: DragEvent) => {
      if (!e.dataTransfer) return;
      e.dataTransfer.setData(NOTE_DRAG_TYPE, noteId);
      e.dataTransfer.setData("text/plain", noteId);
      e.dataTransfer.effectAllowed = "move";
      el.style.opacity = "0.5";
    };
    const onEnd = () => {
      el.style.opacity = "1";
    };
    el.addEventListener("dragstart", onStart);
    el.addEventListener("dragend", onEnd);
    return () => {
      el.removeEventListener("dragstart", onStart);
      el.removeEventListener("dragend", onEnd);
      el.draggable = false;
      el.style.cursor = "";
    };
  }, [disabled, noteId]);
  return <View ref={ref}>{children}</View>;
}

/* ---------- finder tiles ---------- */

function RootCrumb({
  active,
  onPress,
  onMoveNoteOut,
}: {
  active: boolean;
  onPress: () => void;
  onMoveNoteOut: (noteId: string) => void;
}) {
  const { ref, over } = useNoteDrop(onMoveNoteOut);
  return (
    <View ref={ref}>
      <TouchableOpacity
        onPress={onPress}
        className={`rounded-lg px-1 ${over ? "bg-primary-fixed" : ""}`}
      >
        <Text
          className={`font-headline text-headline-md ${active ? "text-on-surface" : "text-on-surface-variant"}`}
        >
          Notatki
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function FolderTile({
  folder,
  count,
  isDark,
  onOpen,
  onMoveNoteIn,
  onMenu,
  onContextMenu,
  renaming,
  onRename,
  onCancelRename,
}: {
  folder: NoteFolder;
  count: number;
  isDark: boolean;
  onOpen: () => void;
  onMoveNoteIn: (noteId: string) => void;
  onMenu: () => void;
  onContextMenu: (point: { x: number; y: number }) => void;
  renaming: boolean;
  onRename: (value: string) => void;
  onCancelRename: () => void;
}) {
  const { ref, over } = useNoteDrop(onMoveNoteIn);
  const tile = (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={renaming ? undefined : onOpen}
      onLongPress={Platform.OS === "web" ? undefined : onMenu}
      className="items-center gap-1 w-[112px] py-2 rounded-xl"
      style={over ? { backgroundColor: "rgba(77,65,223,0.12)" } : undefined}
    >
      <MaterialIcons
        name="folder"
        size={64}
        color={over ? "#4d41df" : isDark ? "#9b8cff" : "#4d41df"}
      />
      {renaming ? (
        <InlineRename
          initialValue={folder.title}
          width={108}
          onCommit={onRename}
          onCancel={onCancelRename}
        />
      ) : (
        <Text
          className="font-body text-sm text-on-surface text-center w-[108px]"
          numberOfLines={1}
        >
          {folder.title}
        </Text>
      )}
      <Text className="font-label text-xs text-on-surface-variant">
        {count}
      </Text>
    </TouchableOpacity>
  );

  if (Platform.OS === "web") {
    return (
      <div
        ref={ref as unknown as React.Ref<HTMLDivElement>}
        onContextMenu={(event: ReactMouseEvent<HTMLDivElement>) => {
          event.preventDefault();
          event.stopPropagation();
          if (!renaming) {
            onContextMenu({ x: event.clientX, y: event.clientY });
          }
        }}
      >
        {tile}
      </div>
    );
  }

  return <View ref={ref}>{tile}</View>;
}

function NoteFileTile({
  note,
  isDark,
  folderLabel,
  onOpen,
  onMove,
  onContextMenu,
  renaming,
  onRename,
  onCancelRename,
}: {
  note: Note;
  isDark: boolean;
  folderLabel?: string;
  onOpen: () => void;
  onMove: () => void;
  onContextMenu: (point: { x: number; y: number }) => void;
  renaming: boolean;
  onRename: (value: string) => void;
  onCancelRename: () => void;
}) {
  const noteTheme = getNoteThemeColors(note.noteColor, isDark);
  const preview = note.content.text;

  const tile = (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={renaming ? undefined : onOpen}
      onLongPress={Platform.OS === "web" ? undefined : onMove}
      className="items-center gap-1.5 w-[120px]"
    >
      <View
        className="w-[104px] h-[128px] rounded-lg p-2 overflow-hidden"
        style={{
          backgroundColor: noteTheme.background,
          borderColor: noteTheme.border,
          borderWidth: 1,
        }}
      >
        <Text
          className="font-headline"
          style={{ color: noteTheme.text, fontSize: 9, lineHeight: 12 }}
          numberOfLines={1}
        >
          {note.title || "Bez tytułu"}
        </Text>
        {preview ? (
          <Text
            className="font-body mt-1"
            style={{
              color: noteTheme.mutedText,
              fontSize: 9,
              lineHeight: 12,
            }}
            numberOfLines={8}
          >
            {preview}
          </Text>
        ) : null}
      </View>
      {renaming ? (
        <InlineRename
          initialValue={note.title}
          width={120}
          onCommit={onRename}
          onCancel={onCancelRename}
        />
      ) : (
        <View className="items-center w-[120px] gap-0.5">
          <Text
            className="font-body text-xs text-on-surface text-center w-[120px]"
            numberOfLines={2}
          >
            {note.title || "Bez tytułu"}
          </Text>
          {folderLabel ? (
            <Text
              className="font-body text-[10px] text-on-surface-variant text-center w-[120px]"
              numberOfLines={1}
            >
              {folderLabel}
            </Text>
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <DraggableNote noteId={note.id} disabled={renaming}>
      {Platform.OS === "web" ? (
        <div
          onContextMenu={(event: ReactMouseEvent<HTMLDivElement>) => {
            event.preventDefault();
            event.stopPropagation();
            if (!renaming) {
              onContextMenu({ x: event.clientX, y: event.clientY });
            }
          }}
        >
          {tile}
        </div>
      ) : (
        <View>{tile}</View>
      )}
    </DraggableNote>
  );
}

function InlineRename({
  initialValue,
  width,
  onCommit,
  onCancel,
}: {
  initialValue: string;
  width: number;
  onCommit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const settledRef = useRef(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    const element =
      Platform.OS === "web"
        ? (inputRef.current as unknown as HTMLElement | null)
        : null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      cancel();
    };
    element?.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      element?.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function commit() {
    if (settledRef.current) return;
    settledRef.current = true;
    onCommit(value);
  }

  function cancel() {
    if (settledRef.current) return;
    settledRef.current = true;
    onCancel();
  }

  return (
    <TextInput
      ref={inputRef}
      value={value}
      onChangeText={setValue}
      selectTextOnFocus
      onBlur={commit}
      onSubmitEditing={commit}
      onKeyPress={(event: any) => {
        event.stopPropagation?.();
      }}
      className="bg-surface-container-lowest border border-primary rounded-md px-1.5 py-1 text-on-surface font-body text-xs text-center"
      style={[NO_OUTLINE, { width }]}
    />
  );
}

function ContextMenuItem({
  icon,
  label,
  destructive = false,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  const ref = useRef<View>(null);
  const color = destructive ? "#ef4444" : "#4b5563";

  useEffect(() => {
    if (Platform.OS !== "web" || !ref.current) return;
    const element = ref.current as unknown as HTMLElement;
    element.tabIndex = 0;
    element.setAttribute("role", "menuitem");
    element.style.cursor = "pointer";

    const handleClick = () => onPress();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      onPress();
    };

    element.addEventListener("click", handleClick);
    element.addEventListener("keydown", handleKeyDown);
    return () => {
      element.removeEventListener("click", handleClick);
      element.removeEventListener("keydown", handleKeyDown);
    };
  }, [onPress]);

  return (
    <View
      ref={ref}
      className="h-11 flex-row items-center gap-3 px-3 hover:bg-surface-container-low"
    >
      <MaterialIcons name={icon} size={19} color={color} />
      <Text
        className={`font-body text-sm ${
          destructive ? "text-error" : "text-on-surface"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}
