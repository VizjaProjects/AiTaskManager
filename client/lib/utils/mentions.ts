import type { WorkspaceMember } from "../types";

export const MENTION_TRIGGER = "@";

const MAX_QUERY_LENGTH = 40;
const REGEX_SPECIAL = /[.*+?^${}()|[\]\\]/g;

// Hermes nie gwarantuje String.normalize, a "ł" i tak nie ma dekompozycji NFD.
const DIACRITICS: Record<string, string> = {
  ą: "a",
  ć: "c",
  ę: "e",
  ł: "l",
  ń: "n",
  ó: "o",
  ś: "s",
  ź: "z",
  ż: "z",
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[ąćęłńóśźż]/g, (ch) => DIACRITICS[ch] ?? ch);
}

export interface MentionQuery {
  start: number;
  query: string;
}

export function findMentionQuery(
  text: string,
  caret: number,
): MentionQuery | null {
  const position = Math.max(0, Math.min(caret, text.length));

  const charAfter = text.slice(position, position + 1);
  if (charAfter && !/\s/.test(charAfter)) return null;

  const upToCaret = text.slice(0, position);
  const start = upToCaret.lastIndexOf(MENTION_TRIGGER);
  if (start < 0) return null;

  const charBefore = start > 0 ? upToCaret[start - 1] : "";
  if (charBefore && !/\s/.test(charBefore)) return null;

  // Spacja/enter w zapytaniu zamyka liste — i to samo gasi ja po wyborze,
  // bo wstawiona wzmianka "@Imie Nazwisko " zawiera spacje.
  const query = upToCaret.slice(start + 1);
  if (query.length > MAX_QUERY_LENGTH || /[\s@]/.test(query)) return null;

  return { start, query };
}

export function matchMentionCandidates(
  members: WorkspaceMember[],
  query: string,
): WorkspaceMember[] {
  const needle = normalize(query.trim());
  if (!needle) return members;
  return members.filter((member) => {
    const name = normalize(member.fullName);
    return (
      name.startsWith(needle) ||
      name.split(/\s+/).some((word) => word.startsWith(needle))
    );
  });
}

export function applyMention(
  text: string,
  mention: MentionQuery,
  fullName: string,
): { text: string; caret: number } {
  const before = text.slice(0, mention.start);
  const after = text.slice(mention.start + 1 + mention.query.length);
  const inserted = `${MENTION_TRIGGER}${fullName.trim()}`;
  const spacer = after.startsWith(" ") ? "" : " ";
  return {
    text: `${before}${inserted}${spacer}${after}`,
    caret: before.length + inserted.length + spacer.length,
  };
}

export interface MentionSegment {
  text: string;
  member?: WorkspaceMember;
}

// Bez \p{L} — Hermes nie gwarantuje unicode property escapes.
const WORD_CHAR = /[0-9a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;

function hasMentionBoundaries(
  content: string,
  index: number,
  length: number,
): boolean {
  const before = index > 0 ? content[index - 1] : "";
  if (before && !/\s/.test(before)) return false;
  const after = content[index + length] ?? "";
  return !after || !WORD_CHAR.test(after);
}

export function splitMentionText(
  content: string,
  members: WorkspaceMember[],
): MentionSegment[] {
  const named = members.filter((member) => member.fullName.trim());
  if (!named.length || !content.includes(MENTION_TRIGGER))
    return [{ text: content }];

  const byLongestName = [...named].sort(
    (a, b) => b.fullName.trim().length - a.fullName.trim().length,
  );
  const pattern = byLongestName
    .map((member) => member.fullName.trim().replace(REGEX_SPECIAL, "\\$&"))
    .join("|");
  const regex = new RegExp(`@(${pattern})`, "gi");

  const segments: MentionSegment[] = [];
  let cursor = 0;
  for (const match of content.matchAll(regex)) {
    const index = match.index ?? 0;
    if (index < cursor) continue;
    if (!hasMentionBoundaries(content, index, match[0].length)) continue;

    if (index > cursor) segments.push({ text: content.slice(cursor, index) });
    const matchedName = normalize(match[1]);
    segments.push({
      text: match[0],
      member: byLongestName.find(
        (member) => normalize(member.fullName.trim()) === matchedName,
      ),
    });
    cursor = index + match[0].length;
  }
  if (cursor < content.length) segments.push({ text: content.slice(cursor) });
  return segments;
}

export function extractMentionedMembers(
  content: string,
  members: WorkspaceMember[],
): WorkspaceMember[] {
  const seen = new Set<string>();
  const mentioned: WorkspaceMember[] = [];
  for (const segment of splitMentionText(content, members)) {
    if (!segment.member || seen.has(segment.member.userId)) continue;
    seen.add(segment.member.userId);
    mentioned.push(segment.member);
  }
  return mentioned;
}
