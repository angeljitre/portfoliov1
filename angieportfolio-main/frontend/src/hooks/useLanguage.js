import { useSyncExternalStore } from "react";
import { getSiteContent } from "../data/siteContent";

const STORAGE_KEY = "aj-portfolio-language";
const listeners = new Set();

const readStoredLanguage = () => {
  if (typeof window === "undefined") return "es";
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "es";
  } catch {
    return "es";
  }
};

let currentLanguage = readStoredLanguage();

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => currentLanguage;
const getServerSnapshot = () => "es";

export const setPortfolioLanguage = (language) => {
  const nextLanguage = language === "en" ? "en" : "es";
  if (currentLanguage === nextLanguage) return;

  currentLanguage = nextLanguage;
  if (typeof document !== "undefined") document.documentElement.lang = nextLanguage;

  try {
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
  } catch {
    // The page still works when storage is unavailable.
  }

  listeners.forEach((listener) => listener());
};

export const useLanguage = () => {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const content = getSiteContent(language);

  return {
    language,
    content,
    ui: content.ui,
    setLanguage: setPortfolioLanguage,
    toggleLanguage: () => setPortfolioLanguage(language === "es" ? "en" : "es"),
  };
};

if (typeof document !== "undefined") document.documentElement.lang = currentLanguage;
