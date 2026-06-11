import { View, Text, TouchableOpacity } from "react-native";
import type { Note } from "@/lib/types";

function relativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOfDay = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round(
    (startOfDay(now) - startOfDay(d)) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 0) return "Dziś";
  if (diffDays === 1) return "Wczoraj";
  if (diffDays < 7) return d.toLocaleDateString("pl-PL", { weekday: "long" });
  return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "short" });
}

/** Light text color for readability over the colored card background. */
function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length < 6) return true;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

interface NoteCardProps {
  note: Note;
  active?: boolean;
  onPress: () => void;
}

export function NoteCard({ note, active, onPress }: NoteCardProps) {
  const bg = note.noteColor || "#FFFFFF";
  const light = isLightColor(bg);
  const titleColor = light ? "#1a1a1a" : "#ffffff";
  const bodyColor = light ? "rgba(26,26,26,0.7)" : "rgba(255,255,255,0.8)";
  const preview = note.content.text;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={`rounded-2xl p-4 gap-2 ${active ? "border-2 border-primary" : "border border-black/5"}`}
      style={{ backgroundColor: bg }}
    >
      <Text className="font-headline text-base" style={{ color: titleColor }} numberOfLines={2}>
        {note.title || "Bez tytułu"}
      </Text>
      {preview ? (
        <Text className="font-body text-sm" style={{ color: bodyColor }} numberOfLines={4}>
          {preview}
        </Text>
      ) : (
        <Text className="font-body text-sm italic" style={{ color: bodyColor }}>
          Pusta notatka
        </Text>
      )}
      <Text className="font-label text-xs mt-1" style={{ color: bodyColor }}>
        {relativeDate(note.updatedAt)}
      </Text>
    </TouchableOpacity>
  );
}
