/**
 * Ink and highlighter palettes for handwritten notes.
 *
 * These are literal colors on purpose, the same way EVENT_COLOR_OPTIONS is:
 * they are user content stored inside the note document, not UI chrome, so
 * they cannot come from theme tokens that change with the active mode. Pen
 * colors are drawn from the Arena palette; highlighter colors have to stay
 * light because the canvas composites them with `multiply`.
 */
import { isInkShapeTool, type InkTool } from "@/lib/types";

/** Near-black. The editor flips this to the light foreground on a dark page. */
export const DEFAULT_INK_COLOR = "#1a1a18";

export const DEFAULT_HIGHLIGHTER_COLOR = "#FDE68A";

export const INK_PEN_COLORS = [
  DEFAULT_INK_COLOR,
  "#5b4ee0",
  "#dc2c4f",
  "#B7770D",
  "#2E7D52",
  "#006b58",
  "#C0392B",
] as const;

export const INK_HIGHLIGHTER_COLORS = [
  DEFAULT_HIGHLIGHTER_COLOR,
  "#A7F3D0",
  "#BFDBFE",
  "#FBCFE8",
  "#FED7AA",
] as const;

/** Nib widths in logical page px (A4 @96dpi). */
export const INK_PEN_WIDTHS = [1.4, 2.4, 4.2] as const;
export const INK_HIGHLIGHTER_WIDTHS = [12, 18, 26] as const;
/** Drives the eraser hit radius (radius = max(6, width * 3)). */
export const INK_ERASER_WIDTHS = [3, 6, 11] as const;
/** Shapes get their own scale — a hairline outline reads badly at A4. */
export const INK_SHAPE_WIDTHS = [1.8, 3, 5] as const;

export const DEFAULT_INK_PEN_WIDTH = INK_PEN_WIDTHS[1];
export const DEFAULT_INK_HIGHLIGHTER_WIDTH = INK_HIGHLIGHTER_WIDTHS[1];
export const DEFAULT_INK_ERASER_WIDTH = INK_ERASER_WIDTHS[1];
export const DEFAULT_INK_SHAPE_WIDTH = INK_SHAPE_WIDTHS[1];

export function inkColorsForTool(tool: InkTool): readonly string[] {
  return tool === "highlighter" ? INK_HIGHLIGHTER_COLORS : INK_PEN_COLORS;
}

export function inkWidthsForTool(tool: InkTool): readonly number[] {
  if (tool === "highlighter") return INK_HIGHLIGHTER_WIDTHS;
  if (tool === "eraser") return INK_ERASER_WIDTHS;
  if (isInkShapeTool(tool)) return INK_SHAPE_WIDTHS;
  return INK_PEN_WIDTHS;
}

export function defaultInkWidthForTool(tool: InkTool): number {
  if (tool === "highlighter") return DEFAULT_INK_HIGHLIGHTER_WIDTH;
  if (tool === "eraser") return DEFAULT_INK_ERASER_WIDTH;
  if (isInkShapeTool(tool)) return DEFAULT_INK_SHAPE_WIDTH;
  return DEFAULT_INK_PEN_WIDTH;
}

export function defaultInkColorForTool(tool: InkTool): string {
  return tool === "highlighter"
    ? DEFAULT_HIGHLIGHTER_COLOR
    : DEFAULT_INK_COLOR;
}

/** Swatch outline that stays visible when the swatch matches the surface. */
export function inkSwatchBorder(hex: string, isDark: boolean): string {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (isDark) return luminance < 0.3 ? "rgba(255,255,255,0.45)" : "transparent";
  return luminance > 0.7 ? "rgba(0,0,0,0.28)" : "transparent";
}
