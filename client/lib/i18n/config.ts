/**
 * Single source of truth for supported languages.
 * To add a language: add an entry here, then add its dictionary in translations.ts.
 * Everything else (the Lang type, the switcher, the store) derives from this list.
 */
export const LANGUAGES = [
  { code: "pl", label: "Polski", short: "PL" },
  { code: "en", label: "English", short: "EN" },
] as const;

export type Lang = (typeof LANGUAGES)[number]["code"];

export const DEFAULT_LANG: Lang = "pl";

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code) as readonly Lang[];

export function isLang(value: unknown): value is Lang {
  return (
    typeof value === "string" && (LANGUAGE_CODES as readonly string[]).includes(value)
  );
}
