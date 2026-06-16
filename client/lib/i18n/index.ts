import { useLanguageStore } from "./store";
import { translations } from "./translations";
import { DEFAULT_LANG } from "./config";

type Vars = Record<string, string | number>;

/**
 * Translate a key for the active language.
 * Falls back to the default language, then to the key itself.
 * Supports simple {name} interpolation.
 */
export function translate(
  lang: string,
  key: string,
  vars?: Vars,
): string {
  const dict = translations[lang as keyof typeof translations];
  let value = dict?.[key] ?? translations[DEFAULT_LANG][key] ?? key;
  if (vars) {
    for (const k of Object.keys(vars)) {
      value = value.split("{" + k + "}").join(String(vars[k]));
    }
  }
  return value;
}

/** Hook returning a `t(key, vars?)` function bound to the active language. */
export function useT() {
  const lang = useLanguageStore((s) => s.lang);
  return (key: string, vars?: Vars) => translate(lang, key, vars);
}

export { useLanguageStore } from "./store";
export { LANGUAGES, DEFAULT_LANG, LANGUAGE_CODES, isLang } from "./config";
export type { Lang } from "./config";
