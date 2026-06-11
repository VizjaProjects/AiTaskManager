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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { PageLayout } from "../PageLayout";
import { NoteCard } from "../../molecules/NoteCard";
import { RichTextEditor } from "./RichTextEditor";
import type { RichTextEditorHandle } from "./RichTextEditor.types";
import {
  NoteEditorToolbar,
  type EditorCommand,
} from "./NoteEditorToolbar";
import {
  useNotes,
  useNoteFolders,
  useCreateNote,
  useCreateNoteFolder,
  useUpdateNoteContent,
  useUpdateNoteMetadata,
  useDeleteNote,
} from "@/lib/hooks";
import { useThemeStore } from "@/lib/stores";
import type { Note } from "@/lib/types";

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

const ALL = "__all__";
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

function confirmDelete(onConfirm: () => void) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm("Usunąć tę notatkę?")) {
      onConfirm();
    }
    return;
  }
  Alert.alert("Usuń notatkę", "Czy na pewno chcesz usunąć tę notatkę?", [
    { text: "Anuluj", style: "cancel" },
    { text: "Usuń", style: "destructive", onPress: onConfirm },
  ]);
}

type MobilePane = "list" | "editor";

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

  const [selectedFolderId, setSelectedFolderId] = useState<string>(ALL);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [mobilePane, setMobilePane] = useState<MobilePane>("list");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");

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

  const visibleNotes = useMemo(() => {
    const list =
      selectedFolderId === ALL
        ? notes
        : notes.filter((n) => n.noteFolderId === selectedFolderId);
    return [...list].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [notes, selectedFolderId]);

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
    const targetFolder =
      selectedFolderId === ALL ? null : selectedFolderId;
    const res = await createNote.mutateAsync({
      title: "Nowa notatka",
      noteColor: color || NOTE_COLORS[0],
      noteFolderId: targetFolder,
      html: "",
    });
    const newId = (res.data as { id: string }).id;
    setSelectedNoteId(newId);
    setMobilePane("editor");
  }

  async function handleCreateFolder() {
    const name = folderName.trim();
    if (!name) return;
    await createFolder.mutateAsync(name);
    setFolderName("");
    setCreatingFolder(false);
  }

  function handleDelete() {
    if (!selectedNoteId) return;
    const id = selectedNoteId;
    confirmDelete(() => {
      deleteNote.mutate(id);
      setSelectedNoteId(null);
      setMobilePane("list");
    });
  }

  function command(cmd: EditorCommand) {
    editorRef.current?.sendCommand(cmd);
  }

  /* ---------- sub views ---------- */

  const foldersRail = (
    <View className="gap-1">
      <FolderItem
        icon="notes"
        label="Wszystkie notatki"
        count={notes.length}
        active={selectedFolderId === ALL}
        onPress={() => setSelectedFolderId(ALL)}
      />
      {folders.map((f) => (
        <FolderItem
          key={f.id}
          icon="folder"
          label={f.title}
          count={notes.filter((n) => n.noteFolderId === f.id).length}
          active={selectedFolderId === f.id}
          onPress={() => setSelectedFolderId(f.id)}
        />
      ))}

      {creatingFolder ? (
        <View className="flex-row items-center gap-2 mt-1 px-1">
          <TextInput
            value={folderName}
            onChangeText={setFolderName}
            placeholder="Nazwa folderu"
            placeholderTextColor="#9ca3af"
            autoFocus
            onSubmitEditing={handleCreateFolder}
            className="flex-1 bg-surface-container-low rounded-lg px-3 py-2 text-on-surface font-body text-sm border border-outline-variant"
            style={NO_OUTLINE}
          />
          <TouchableOpacity onPress={handleCreateFolder} className="p-1">
            <MaterialIcons name="check" size={20} color="#4d41df" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setCreatingFolder(true)}
          className="flex-row items-center gap-2 px-3 py-2.5 mt-1"
        >
          <MaterialIcons name="create-new-folder" size={18} color="#777587" />
          <Text className="text-on-surface-variant font-body text-sm">
            Nowy folder
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const notesList = (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
    >
      {isLoading ? (
        <Text className="text-on-surface-variant font-body text-sm py-6 text-center">
          Ładowanie…
        </Text>
      ) : visibleNotes.length === 0 ? (
        <View className="items-center py-10 gap-2">
          <MaterialIcons name="sticky-note-2" size={28} color="#9ca3af" />
          <Text className="text-on-surface-variant font-body text-sm text-center">
            Brak notatek. Utwórz pierwszą.
          </Text>
        </View>
      ) : (
        visibleNotes.map((n) => (
          <NoteCard
            key={n.id}
            note={n}
            active={isDesktop && n.id === selectedNoteId}
            onPress={() => {
              setSelectedNoteId(n.id);
              setMobilePane("editor");
            }}
          />
        ))
      )}
    </ScrollView>
  );

  const editorPane = selectedNote ? (
    <View className="flex-1 bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
      {/* header */}
      <View className="px-4 pt-3 pb-2 gap-3 border-b border-outline-variant/50">
        <View className="flex-row items-center gap-2">
          {!isDesktop && (
            <TouchableOpacity onPress={() => setMobilePane("list")} className="p-1 -ml-1">
              <MaterialIcons name="arrow-back" size={22} color="#777587" />
            </TouchableOpacity>
          )}
          <TextInput
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              scheduleMetaSave({ title: t });
            }}
            placeholder="Tytuł"
            placeholderTextColor="#9ca3af"
            className="flex-1 text-on-surface font-headline text-xl"
            style={NO_OUTLINE}
          />
          <TouchableOpacity onPress={handleDelete} className="p-1.5">
            <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, alignItems: "center" }}
        >
          {NOTE_COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => {
                setColor(c);
                scheduleMetaSave({ color: c });
              }}
              className={`w-6 h-6 rounded-full border ${color === c ? "border-primary border-2" : "border-outline-variant"}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <View className="w-px h-5 bg-outline-variant/50 mx-1" />
          <FolderChip
            label="Brak"
            active={!folderId}
            onPress={() => {
              setFolderId(null);
              scheduleMetaSave({ folderId: null });
            }}
          />
          {folders.map((f) => (
            <FolderChip
              key={f.id}
              label={f.title}
              active={folderId === f.id}
              onPress={() => {
                setFolderId(f.id);
                scheduleMetaSave({ folderId: f.id });
              }}
            />
          ))}
        </ScrollView>
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

      {/* bottom macOS toolbar */}
      <NoteEditorToolbar state={toolbarState} isDark={isDark} onCommand={command} />
    </View>
  ) : (
    <View className="flex-1 items-center justify-center gap-3">
      <MaterialIcons name="sticky-note-2" size={40} color="#9ca3af" />
      <Text className="text-on-surface-variant font-body text-sm">
        Wybierz notatkę lub utwórz nową.
      </Text>
    </View>
  );

  /* ---------- layout ---------- */

  if (isDesktop) {
    return (
      <PageLayout>
        <View className="flex-1 flex-row gap-4">
          {/* folders rail */}
          <View className="w-56 gap-3">
            <Text className="text-on-surface font-headline text-headline-md px-1">
              Notatki
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>{foldersRail}</ScrollView>
          </View>

          {/* notes list */}
          <View className="w-80">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-on-surface-variant font-label text-sm">
                {visibleNotes.length} notatek
              </Text>
              <TouchableOpacity
                onPress={handleCreateNote}
                className="flex-row items-center gap-1.5 bg-primary rounded-xl px-3 py-2"
              >
                <MaterialIcons name="add" size={16} color={isDark ? "#121212" : "#fff"} />
                <Text className="text-on-primary font-headline text-xs">Nowa</Text>
              </TouchableOpacity>
            </View>
            {notesList}
          </View>

          {/* editor */}
          <View className="flex-1">{editorPane}</View>
        </View>
      </PageLayout>
    );
  }

  // mobile: stacked
  return (
    <PageLayout>
      <View className="flex-1">
        {mobilePane === "editor" && selectedNote ? (
          editorPane
        ) : (
          <View className="flex-1 gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-on-surface font-headline text-headline-md">
                Notatki
              </Text>
              <TouchableOpacity
                onPress={handleCreateNote}
                className="flex-row items-center gap-1.5 bg-primary rounded-xl px-3 py-2"
              >
                <MaterialIcons name="add" size={16} color={isDark ? "#121212" : "#fff"} />
                <Text className="text-on-primary font-headline text-xs">Nowa</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
            >
              <FolderChip
                label="Wszystkie"
                active={selectedFolderId === ALL}
                onPress={() => setSelectedFolderId(ALL)}
              />
              {folders.map((f) => (
                <FolderChip
                  key={f.id}
                  label={f.title}
                  active={selectedFolderId === f.id}
                  onPress={() => setSelectedFolderId(f.id)}
                />
              ))}
              {creatingFolder ? (
                <View className="flex-row items-center gap-1">
                  <TextInput
                    value={folderName}
                    onChangeText={setFolderName}
                    placeholder="Folder"
                    placeholderTextColor="#9ca3af"
                    autoFocus
                    onSubmitEditing={handleCreateFolder}
                    className="bg-surface-container-low rounded-full px-3 py-1.5 text-on-surface font-body text-xs border border-outline-variant"
                    style={NO_OUTLINE}
                  />
                  <TouchableOpacity onPress={handleCreateFolder}>
                    <MaterialIcons name="check" size={18} color="#4d41df" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setCreatingFolder(true)}
                  className="flex-row items-center gap-1 px-3 py-1.5 rounded-full border border-outline-variant"
                >
                  <MaterialIcons name="add" size={14} color="#777587" />
                  <Text className="text-on-surface-variant font-body text-xs">Folder</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            {notesList}
          </View>
        )}
      </View>
    </PageLayout>
  );
}

function FolderItem({
  icon,
  label,
  count,
  active,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  count: number;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center gap-3 px-3 py-2.5 rounded-xl ${active ? "bg-surface-container-low" : ""}`}
    >
      <MaterialIcons name={icon} size={18} color={active ? "#4d41df" : "#777587"} />
      <Text
        className={`flex-1 font-body text-sm ${active ? "text-on-surface" : "text-on-surface-variant"}`}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text className="text-on-surface-variant font-label text-xs">{count}</Text>
    </TouchableOpacity>
  );
}

function FolderChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-3 py-1.5 rounded-full border ${active ? "bg-primary border-transparent" : "border-outline-variant"}`}
    >
      <Text
        className={`font-label text-xs ${active ? "text-on-primary" : "text-on-surface-variant"}`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
