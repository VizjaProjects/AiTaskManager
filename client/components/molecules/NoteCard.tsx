import { View, Text, TouchableOpacity } from "react-native";
import type { Note } from "@/lib/types";
import { getNoteThemeColors } from "@/lib/noteTheme";
import { useThemeStore } from "@/lib/stores";
import { useT, useLocale } from "@/lib/i18n";

function relativeDate(
  iso: string,
  locale: string,
  t: (key: string) => string,
): string {
  const d = new Date(iso);
  const now = new Date();
  const startOfDay = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round(
    (startOfDay(now) - startOfDay(d)) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 0) return t("common.today");
  if (diffDays === 1) return t("common.yesterday");
  if (diffDays < 7) return d.toLocaleDateString(locale, { weekday: "long" });
  return d.toLocaleDateString(locale, { day: "2-digit", month: "short" });
}

interface NoteCardProps {
  note: Note;
  active?: boolean;
  onPress: () => void;
}

export function NoteCard({ note, active, onPress }: NoteCardProps) {
  const t = useT();
  const locale = useLocale();
  const isDark = useThemeStore((state) => state.mode) === "dark";
  const noteTheme = getNoteThemeColors(note.noteColor, isDark);
  const preview = note.content.text;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="rounded-2xl p-4 gap-2"
      style={{
        backgroundColor: noteTheme.background,
        borderWidth: active ? 2 : 1,
        borderColor: active
          ? isDark
            ? "#E8E8E8"
            : "#111111"
          : noteTheme.border,
      }}
    >
      <Text
        className="font-headline text-base"
        style={{ color: noteTheme.text }}
        numberOfLines={2}
      >
        {note.title || t("taskModal.noteFallback")}
      </Text>
      {preview ? (
        <Text
          className="font-body text-sm"
          style={{ color: noteTheme.mutedText }}
          numberOfLines={4}
        >
          {preview}
        </Text>
      ) : (
        <Text
          className="font-body text-sm italic"
          style={{ color: noteTheme.mutedText }}
        >
          {t("notes.emptyNote")}
        </Text>
      )}
      <Text
        className="font-label text-xs mt-1"
        style={{ color: noteTheme.mutedText }}
      >
        {relativeDate(note.updatedAt, locale, t)}
      </Text>
    </TouchableOpacity>
  );
}
