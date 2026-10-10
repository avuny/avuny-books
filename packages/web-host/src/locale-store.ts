// packages/web-host/src/locale-store.ts
// Module-level store, so non-React code (the API client) can read the
// locale too, e.g. createApiClient({ getLocale }) -> Accept-Language header.
// Web only (uses document, localStorage, navigator).
import { getDirection, isLocale, resolveLocale, type Locale } from "@avuny/i18n";
import { setZodLocale } from "@avuny/zod";

const STORAGE_KEY = "locale";
const listeners = new Set<() => void>();

const readInitial = (): Locale => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // storage can be unavailable; fall through to the browser language
  }
  return resolveLocale(navigator.language);
};

const apply = (locale: Locale) => {
  document.documentElement.lang = locale;
  document.documentElement.dir = getDirection(locale);
  setZodLocale(locale);
};

let current = readInitial();
apply(current);

export const getLocale = (): Locale => current;

export const subscribeLocale = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const setLocale = (next: Locale) => {
  if (next === current) return;
  current = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // ignore: the locale still applies for this session
  }
  apply(next);
  listeners.forEach((listener) => listener());
};
