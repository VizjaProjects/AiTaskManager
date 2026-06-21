export const NOTE_COLORS = [
  "#FFFFFF",
  "#F7BFFF",
  "#FFD9A0",
  "#FFE08A",
  "#A0D8FF",
  "#B5F1CC",
  "#E3D5FF",
  "#FFC9C9",
] as const;

const DARK_NOTE_BACKGROUNDS: Record<string, string> = {
  "#FFFFFF": "#222222",
  "#F7BFFF": "#5C4C5F",
  "#FFD9A0": "#5F5342",
  "#FFE08A": "#5F553C",
  "#A0D8FF": "#42535F",
  "#B5F1CC": "#495B4F",
  "#E3D5FF": "#56525F",
  "#FFC9C9": "#5F4F4F",
};

export interface NoteThemeColors {
  background: string;
  text: string;
  mutedText: string;
  border: string;
}

function normalizeHex(color?: string | null): string {
  const value = color?.trim().toUpperCase() ?? "";
  if (/^#[0-9A-F]{6}$/.test(value)) return value;
  if (/^#[0-9A-F]{3}$/.test(value)) {
    return `#${value
      .slice(1)
      .split("")
      .map((part) => part + part)
      .join("")}`;
  }
  return "#FFFFFF";
}

function mixHex(source: string, target: string, targetAmount: number): string {
  const sourceHex = normalizeHex(source);
  const targetHex = normalizeHex(target);
  const parts = [1, 3, 5].map((offset) => {
    const from = parseInt(sourceHex.slice(offset, offset + 2), 16);
    const to = parseInt(targetHex.slice(offset, offset + 2), 16);
    return Math.round(from * (1 - targetAmount) + to * targetAmount)
      .toString(16)
      .padStart(2, "0");
  });
  return `#${parts.join("")}`.toUpperCase();
}

function isLightColor(hex: string): boolean {
  const normalized = normalizeHex(hex);
  const red = parseInt(normalized.slice(1, 3), 16);
  const green = parseInt(normalized.slice(3, 5), 16);
  const blue = parseInt(normalized.slice(5, 7), 16);
  return (red * 299 + green * 587 + blue * 114) / 1000 > 150;
}

export function getNoteThemeColors(
  noteColor: string | null | undefined,
  isDark: boolean,
): NoteThemeColors {
  const source = normalizeHex(noteColor);

  if (isDark) {
    return {
      background:
        DARK_NOTE_BACKGROUNDS[source] ?? mixHex(source, "#1a1a18", 0.7),
      text: "#F4F4F5",
      mutedText: "rgba(244,244,245,0.72)",
      border: "rgba(255,255,255,0.14)",
    };
  }

  const lightBackground = isLightColor(source);
  return {
    background: source,
    text: lightBackground ? "#1a1a18" : "#FFFFFF",
    mutedText: lightBackground
      ? "rgba(26,26,26,0.72)"
      : "rgba(255,255,255,0.80)",
    border: "rgba(0,0,0,0.10)",
  };
}
