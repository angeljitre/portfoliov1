import { useSyncExternalStore } from "react";

const STORAGE_KEY = "aj-portfolio-theme";
const listeners = new Set();

const readStoredTheme = () => {
  if (typeof window === "undefined") return "dark";
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
};

let currentTheme = readStoredTheme();

const applyTheme = (theme) => {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
};

applyTheme(currentTheme);

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => currentTheme;
const getServerSnapshot = () => "dark";

export const setPortfolioTheme = (theme) => {
  const nextTheme = theme === "light" ? "light" : "dark";
  if (currentTheme === nextTheme) return;

  currentTheme = nextTheme;
  applyTheme(nextTheme);

  try {
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  } catch {
    // Theme still changes even when local storage is unavailable.
  }

  listeners.forEach((listener) => listener());
};

export const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    theme,
    setTheme: setPortfolioTheme,
    toggleTheme: () => setPortfolioTheme(theme === "dark" ? "light" : "dark"),
  };
};
