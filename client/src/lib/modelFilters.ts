export type ModelTask = "all" | "coder" | "text" | "tts" | "vision" | "chat" | "other";

export const modelTaskLabels = {
  ar: { all: "الكل", coder: "Coder", text: "Text", tts: "TTS", vision: "Vision", chat: "Chat", other: "أخرى" },
  fr: { all: "Tous", coder: "Coder", text: "Texte", tts: "TTS", vision: "Vision", chat: "Chat", other: "Autres" },
  en: { all: "All", coder: "Coder", text: "Text", tts: "TTS", vision: "Vision", chat: "Chat", other: "Other" },
} as const;

export function detectModelTask(...sources: Array<string | string[] | undefined>): Exclude<ModelTask, "all"> {
  const value = sources.flatMap((source) => Array.isArray(source) ? source : source ? [source] : []).join(" ").toLowerCase();
  if (/\b(coder|code|coding|programming|codegen|starcoder|codellama)\b/.test(value)) return "coder";
  if (/\b(tts|text-to-speech|text_to_speech|speech-synthesis|speech synthesis|voice|audio)\b/.test(value)) return "tts";
  if (/\b(vision|image|visual|multimodal|vlm|llava|clip)\b/.test(value)) return "vision";
  if (/\b(chat|instruct|conversational|assistant|dialogue|dialog)\b/.test(value)) return "chat";
  if (/\b(text-generation|text generation|causal-lm|causal language|language-model|language model|llm|transformer)\b/.test(value)) return "text";
  return "other";
}

export function matchesModelTask(task: ModelTask, ...sources: Array<string | string[] | undefined>) {
  return task === "all" || detectModelTask(...sources) === task;
}
