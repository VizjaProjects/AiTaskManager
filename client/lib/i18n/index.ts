import { useLanguageStore } from "./store";
import { translations } from "./translations";
import { DEFAULT_LANG, localeFor } from "./config";

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

/** Translate outside React (utils, imperative code). */
export function tr(key: string, vars?: Vars): string {
  return translate(useLanguageStore.getState().lang, key, vars);
}

/** Intl locale for the active language — use instead of a hardcoded "pl-PL". */
export function useLocale(): string {
  return localeFor(useLanguageStore((s) => s.lang));
}

/** Same, outside React. Components prefer useLocale() so they re-render on switch. */
export function getLocale(): string {
  return localeFor(useLanguageStore.getState().lang);
}

export { useLanguageStore } from "./store";
export {
  LANGUAGES,
  DEFAULT_LANG,
  LANGUAGE_CODES,
  isLang,
  localeFor,
} from "./config";
export type { Lang } from "./config";
