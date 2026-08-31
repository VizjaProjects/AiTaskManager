/**
 * Runtime helpers for the handwritten ("ink") note document.
 *
 * Division of labour with the editor:
 *  - `inkEditorHtml.ts` (inside the iframe/WebView) owns stroke capture and
 *    produces already-quantized, delta-encoded point arrays. It only ever
 *    speaks plain `number[]`.
 *  - This module owns validation of untrusted documents coming back from the
 *    API and the compact wire encoding (`InkEncoding`) applied on the way to
 *    the backend. The editor never sees an encoded document.
 */
import type {
  InkDocument,
  InkEncoding,
  InkPage,
  InkPageTemplate,
  InkStroke,
} from "@/lib/types";

/** A4 at 96dpi, in logical CSS px. Every page in a document shares this size. */
export const INK_PAGE_A4 = { w: 794, h: 1123 } as const;

/**
 * Legacy coordinate scale (1/4 logical px). Strokes without `cs` unpack at
 * this scale so notes written before the finer grid still open at the
 * right size. Do not change this number.
 */
export const INK_COORD_SCALE = 4;

/** New strokes pack at 1/32 page px so a letter at 40× zoom is not a dot. */
export const INK_COORD_SCALE_FINE = 32;

/** Pressure is stored as 0-255 rather than a float 0-1. */
export const INK_PRESSURE_SCALE = 255;

const INK_TEMPLATES: readonly InkPageTemplate[] = [
  "blank",
  "lines",
  "grid",
  "dots",
];

function newPageId(): string {
  return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function createInkPage(template: InkPageTemplate = "lines"): InkPage {
  return { id: newPageId(), template, strokes: [] };
}

export function createEmptyInkDocument(
  template: InkPageTemplate = "lines",
): InkDocument {
  return {
    pageSize: { w: INK_PAGE_A4.w, h: INK_PAGE_A4.h },
    pages: [createInkPage(template)],
  };
}

/* ───────── validation of untrusted documents ───────── */

function sanitizeStroke(raw: unknown): InkStroke | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  const d = s.d;
  if (!Array.isArray(d) || d.length < 3) return null;

  const points: number[] = [];
  for (const value of d) {
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    points.push(value);
  }
  // Triplets only — a truncated tail would desync the whole stroke.
  if (points.length % 3 !== 0) points.length -= points.length % 3;
  if (points.length < 3) return null;

  const width = typeof s.w === "number" && s.w > 0 ? s.w : 2;
  const cs =
    typeof s.cs === "number" && Number.isFinite(s.cs) && s.cs >= 1
      ? Math.round(s.cs)
      : undefined;
  return {
    t: s.t === "h" ? "h" : s.t === "s" ? "s" : "p",
    c: typeof s.c === "string" && s.c.length > 0 ? s.c : "#1a1a18",
    w: width,
    d: points,
    ...(cs && cs !== INK_COORD_SCALE ? { cs } : {}),
  };
}

function sanitizePage(raw: unknown, index: number): InkPage {
  const page = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const rawStrokes = Array.isArray(page.strokes) ? page.strokes : [];
  const strokes: InkStroke[] = [];
  for (const candidate of rawStrokes) {
    const stroke = sanitizeStroke(candidate);
    if (stroke) strokes.push(stroke);
  }
  const template = INK_TEMPLATES.includes(page.template as InkPageTemplate)
    ? (page.template as InkPageTemplate)
    : "lines";
  return {
    id: typeof page.id === "string" && page.id ? page.id : `p${index}`,
    template,
    strokes,
  };
}

/**
 * Coerce arbitrary parsed JSON into a usable document, dropping anything
 * malformed. Never throws: a corrupt note must still open, even if empty.
 */
export function sanitizeInkDocument(raw: unknown): InkDocument {
  if (!raw || typeof raw !== "object") return createEmptyInkDocument();
  const doc = raw as Record<string, unknown>;
  const size = (
    doc.pageSize && typeof doc.pageSize === "object" ? doc.pageSize : {}
  ) as Record<string, unknown>;
  const w = typeof size.w === "number" && size.w > 0 ? size.w : INK_PAGE_A4.w;
  const h = typeof size.h === "number" && size.h > 0 ? size.h : INK_PAGE_A4.h;

  const rawPages = Array.isArray(doc.pages) ? doc.pages : [];
  const pages = rawPages.map(sanitizePage);
  return {
    pageSize: { w, h },
    pages: pages.length > 0 ? pages : [createInkPage()],
  };
}

/* ───────── compact wire encoding ───────── */

const B64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// Built once; Hermes gives no guarantee about btoa/atob, so base64 is hand-rolled.
const B64_LOOKUP: Record<string, number> = {};
for (let i = 0; i < B64_ALPHABET.length; i += 1) {
  B64_LOOKUP[B64_ALPHABET[i]] = i;
}

function bytesToBase64(bytes: number[]): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : -1;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : -1;
    out += B64_ALPHABET[b0 >> 2];
    if (b1 < 0) {
      out += B64_ALPHABET[(b0 & 0x03) << 4];
      out += "==";
      break;
    }
    out += B64_ALPHABET[((b0 & 0x03) << 4) | (b1 >> 4)];
    if (b2 < 0) {
      out += B64_ALPHABET[(b1 & 0x0f) << 2];
      out += "=";
      break;
    }
    out += B64_ALPHABET[((b1 & 0x0f) << 2) | (b2 >> 6)];
    out += B64_ALPHABET[b2 & 0x3f];
  }
  return out;
}

function base64ToBytes(text: string): number[] {
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "=") break;
    const value = B64_LOOKUP[ch];
    if (value === undefined) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return bytes;
}

/** Zigzag + LEB128 varints, then base64. Deltas are small, so most take one byte. */
function encodeVarints(nums: number[]): string {
  const bytes: number[] = [];
  for (const n of nums) {
    const rounded = Math.round(n);
    let v = ((rounded << 1) ^ (rounded >> 31)) >>> 0;
    while (v >= 0x80) {
      bytes.push((v & 0x7f) | 0x80);
      v = v >>> 7;
    }
    bytes.push(v);
  }
  return bytesToBase64(bytes);
}

function decodeVarints(text: string): number[] {
  const bytes = base64ToBytes(text);
  const nums: number[] = [];
  let value = 0;
  let shift = 0;
  for (const byte of bytes) {
    value |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) {
      const unsigned = value >>> 0;
      nums.push((unsigned >>> 1) ^ -(unsigned & 1));
      value = 0;
      shift = 0;
    } else {
      shift += 7;
    }
  }
  return nums;
}

/**
 * Encode a document for storage. `none` keeps it readable for debugging.
 *
 * `b64v` roughly halves the point payload, but measured on a densely written
 * A4 page (~1500 strokes, ~6900 points) that is only a ~25% saving overall:
 * the per-stroke JSON keys dominate at that stroke count. Collapsing repeated
 * (tool, colour, width) triples into a style table is the bigger win and is
 * still open.
 */
export function encodeInkDocument(
  doc: InkDocument,
  enc: InkEncoding,
): Record<string, unknown> {
  if (enc === "none") return doc as unknown as Record<string, unknown>;
  return {
    pageSize: doc.pageSize,
    pages: doc.pages.map((page) => ({
      id: page.id,
      template: page.template,
      strokes: page.strokes.map((stroke) => ({
        t: stroke.t,
        c: stroke.c,
        w: stroke.w,
        d: encodeVarints(stroke.d),
        ...(stroke.cs ? { cs: stroke.cs } : {}),
      })),
    })),
  };
}

/** Inverse of `encodeInkDocument`, tolerant of either encoding regardless of the declared one. */
export function decodeInkDocument(
  raw: unknown,
  enc: InkEncoding,
): InkDocument {
  if (!raw || typeof raw !== "object") return createEmptyInkDocument();
  if (enc === "none") return sanitizeInkDocument(raw);

  const doc = raw as Record<string, unknown>;
  const rawPages = Array.isArray(doc.pages) ? doc.pages : [];
  const expanded = {
    ...doc,
    pages: rawPages.map((page) => {
      const p = (page && typeof page === "object" ? page : {}) as Record<
        string,
        unknown
      >;
      const rawStrokes = Array.isArray(p.strokes) ? p.strokes : [];
      return {
        ...p,
        strokes: rawStrokes.map((stroke) => {
          const s = (stroke && typeof stroke === "object" ? stroke : {}) as
            Record<string, unknown>;
          return typeof s.d === "string"
            ? { ...s, d: decodeVarints(s.d) }
            : s;
        }),
      };
    }),
  };
  return sanitizeInkDocument(expanded);
}
