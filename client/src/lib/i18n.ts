export type SiteLanguage = "ar" | "fr" | "en";

export const languageOptions: Array<{ code: SiteLanguage; label: string }> = [
  { code: "ar", label: "AR" },
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
];

const STORAGE_KEY = "gguf-finder:language";

export function getPreferredLanguage(): SiteLanguage {
  if (typeof window === "undefined") return "ar";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "fr" || saved === "en" || saved === "ar" ? saved : "ar";
}

export function savePreferredLanguage(language: SiteLanguage) {
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, language);
}
