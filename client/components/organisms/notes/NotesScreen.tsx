import { useEffect, useMemo, useRef, useState } from "react";
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
import { PageLayout } from "../PageLayout";
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
} from "@/lib/hooks";
import { useThemeStore } from "@/lib/stores";
import type { Note, NoteFolder } from "@/lib/types";

const NOTE_COLORS = [
  "#FFFFFF",
  "#F7BFFF",
  "#FFD9A0",
  "#FFE08A",
  "#A0D8FF",
  "#B5F1CC",
  "#E3D5FF",
  "#FFC9C9",
];

const NO_OUTLINE =
  Platform.OS === "web" ? ({ outlineStyle: "none" } as const) : undefined;

const EMPTY_STATE = {
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  insertUnorderedList: false,
  insertOrderedList: false,
};

const NOTE_DRAG_TYPE = "application/note-id";

function confirmDelete(message: string, onConfirm: () => void) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(message)) {
      onConfirm();
    }
    return;
  }
  Alert.alert("Potwierdź", message, [
    { text: "Anuluj", style: "cancel" },
    { text: "Usuń", style: "destructive", onPress: onConfirm },
  ]);
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length < 6) return true;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

export function NotesScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const isDark = useThemeStore((s) => s.mode) === "dark";

  const { data: notes = [], isLoading } = useNotes();
  const { data: folders = [] } = useNoteFolders();
  const createNote = useCreateNote();
  const createFolder = useCreateNoteFolder();
  const updateContent = useUpdateNoteContent();
  const updateMetadata = useUpdateNoteMetadata();
  const deleteNote = useDeleteNote();
  const updateFolder = useUpdateNoteFolder();
  const deleteFolder = useDeleteNoteFolder();

  // navigation: null = root overview, otherwise inside a folder
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");

  // folder context menu / edit
  const [menuFolder, setMenuFolder] = useState<NoteFolder | null>(null);
  const [menuTitle, setMenuTitle] = useState("");
  const [menuDesc, setMenuDesc] = useState("");
  // native "move note to folder" sheet
  const [moveNoteId, setMoveNoteId] = useState<string | null>(null);

  // editor buffers
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(NOTE_COLORS[0]);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [toolbarState, setToolbarState] = useState(EMPTY_STATE);
  const editorRef = useRef<RichTextEditorHandle>(null);
  const htmlRef = useRef("");
  const contentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const metaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  );

  const currentFolder = useMemo(
    () => folders.find((f) => f.id === currentFolderId) ?? null,
    [folders, currentFolderId],
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

  useEffect(() => {
    return () => {
      if (contentTimer.current) clearTimeout(contentTimer.current);
      if (metaTimer.current) clearTimeout(metaTimer.current);
    };
  }, []);

  function scheduleContentSave(html: string) {
    htmlRef.current = html;
    if (!selectedNoteId) return;
    if (contentTimer.current) clearTimeout(contentTimer.current);
    const id = selectedNoteId;
    contentTimer.current = setTimeout(() => {
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
      title: next.title ?? title,
      noteColor: next.color ?? color,
      noteFolderId: next.folderId !== undefined ? next.folderId : folderId,
    };
    if (metaTimer.current) clearTimeout(metaTimer.current);
    metaTimer.current = setTimeout(() => {
      updateMetadata.mutate({ noteId: id, ...payload });
    }, 600);
  }

  async function handleCreateNote() {
    const res = await createNote.mutateAsync({
      title: "Nowa notatka",
      noteColor: color || NOTE_COLORS[0],
      noteFolderId: currentFolderId,
      html: "",
    });
    const newId = (res.data as { id: string }).id;
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
    const id = selectedNoteId;
    confirmDelete("Usunąć tę notatkę?", () => {
      deleteNote.mutate(id);
      setSelectedNoteId(null);
      setEditorOpen(false);
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

  function openFolderMenu(folder: NoteFolder) {
    setMenuFolder(folder);
    setMenuTitle(folder.title);
    setMenuDesc(folder.description ?? "");
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
    const id = menuFolder.id;
    confirmDelete(
      "Usunąć ten folder? Notatki zostaną przeniesione do „Bez folderu”.",
      () => {
        deleteFolder.mutate(id);
        setMenuFolder(null);
        if (currentFolderId === id) setCurrentFolderId(null);
      },
    );
  }

  function command(cmd: EditorCommand) {
    editorRef.current?.sendCommand(cmd);
  }

  /* ---------- editor modal ---------- */

  const editorBody = selectedNote ? (
    <View className="flex-1 overflow-hidden" style={{ backgroundColor: color }}>
      {/* header */}
      <View
        className="px-4 pt-3 pb-2"
        style={{ borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.08)" }}
      >
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={closeEditor} className="p-1 -ml-1">
            <MaterialIcons name="arrow-back" size={22} color="#3a3a3a" />
          </TouchableOpacity>
          <TextInput
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              scheduleMetaSave({ title: t });
            }}
            placeholder="Tytuł"
            placeholderTextColor="rgba(26,26,26,0.4)"
            className="flex-1 font-headline text-xl"
            style={[NO_OUTLINE, { color: "#1a1a1a", textAlign: "center" }]}
          />
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
        onChange={scheduleContentSave}
        onStateChange={setToolbarState}
      />

      {/* colour picker — bottom right */}
      <View className="flex-row justify-end items-center gap-2 px-4 py-2">
        {NOTE_COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => {
              setColor(c);
              scheduleMetaSave({ color: c });
            }}
            className="w-5 h-5 rounded-full"
            style={{
              backgroundColor: c,
              borderWidth: color === c ? 2 : 1,
              borderColor: color === c ? "#1a1a1a" : "rgba(0,0,0,0.15)",
            }}
          />
        ))}
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
                  width: Math.min(960, width - 80),
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
                />
              ))}

            {notesInView.map((n) => (
              <NoteFileTile
                key={n.id}
                note={n}
                onOpen={() => openNote(n.id)}
                onMove={() => setMoveNoteId(n.id)}
              />
            ))}

            {notesInView.length === 0 &&
              (currentFolderId || folders.length === 0) && (
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

  return (
    <PageLayout>
      <View className="flex-1">{finder}</View>
      {editorModal}
      {folderEditModal}
      {moveSheet}
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
}: {
  noteId: string;
  children: React.ReactNode;
}) {
  const ref = useRef<View>(null);
  useEffect(() => {
    if (Platform.OS !== "web" || !ref.current) return;
    const el = ref.current as unknown as HTMLElement;
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
  }, [noteId]);
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
}: {
  folder: NoteFolder;
  count: number;
  isDark: boolean;
  onOpen: () => void;
  onMoveNoteIn: (noteId: string) => void;
  onMenu: () => void;
}) {
  const { ref, over } = useNoteDrop(onMoveNoteIn);
  useEffect(() => {
    if (Platform.OS !== "web" || !ref.current) return;
    const el = ref.current as unknown as HTMLElement;
    const onDbl = () => onOpen();
    const onCtx = (e: MouseEvent) => {
      e.preventDefault();
      onMenu();
    };
    el.addEventListener("dblclick", onDbl);
    el.addEventListener("contextmenu", onCtx);
    return () => {
      el.removeEventListener("dblclick", onDbl);
      el.removeEventListener("contextmenu", onCtx);
    };
  }, [ref, onOpen, onMenu]);

  return (
    <View ref={ref}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={Platform.OS === "web" ? undefined : onOpen}
        onLongPress={Platform.OS === "web" ? undefined : onMenu}
        className="items-center gap-1 w-[112px] py-2 rounded-xl"
        style={over ? { backgroundColor: "rgba(77,65,223,0.12)" } : undefined}
      >
        <MaterialIcons
          name="folder"
          size={64}
          color={over ? "#4d41df" : isDark ? "#9b8cff" : "#4d41df"}
        />
        <Text
          className="font-body text-sm text-on-surface text-center w-[108px]"
          numberOfLines={1}
        >
          {folder.title}
        </Text>
        <Text className="font-label text-xs text-on-surface-variant">
          {count}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function NoteFileTile({
  note,
  onOpen,
  onMove,
}: {
  note: Note;
  onOpen: () => void;
  onMove: () => void;
}) {
  const bg = note.noteColor || "#FFFFFF";
  const previewColor = isLightColor(bg)
    ? "rgba(26,26,26,0.75)"
    : "rgba(255,255,255,0.85)";
  const preview = note.content.text;

  return (
    <DraggableNote noteId={note.id}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onOpen}
        onLongPress={onMove}
        className="items-center gap-1.5 w-[120px]"
      >
        <View
          className="w-[104px] h-[128px] rounded-lg border border-black/10 p-2 overflow-hidden"
          style={{ backgroundColor: bg }}
        >
          <Text
            className="font-headline"
            style={{ color: previewColor, fontSize: 9, lineHeight: 12 }}
            numberOfLines={1}
          >
            {note.title || "Bez tytułu"}
          </Text>
          {preview ? (
            <Text
              className="font-body mt-1"
              style={{ color: previewColor, fontSize: 9, lineHeight: 12 }}
              numberOfLines={8}
            >
              {preview}
            </Text>
          ) : null}
        </View>
        <Text
          className="font-body text-xs text-on-surface text-center w-[120px]"
          numberOfLines={2}
        >
          {note.title || "Bez tytułu"}
        </Text>
      </TouchableOpacity>
    </DraggableNote>
  );
}
