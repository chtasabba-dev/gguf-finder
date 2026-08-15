/* Paper Console / parser layer: deterministic, dependency-free GGUF file interpretation. */

import type { RepositoryFile } from "./huggingface";
import type { SiteLanguage } from "./i18n";

const QUANTIZATION_PATTERNS = [
  "Q2_K", "Q3_K_S", "Q3_K_M", "Q3_K_L", "Q4_0", "Q4_1", "Q4_K_S", "Q4_K_M",
  "Q5_0", "Q5_1", "Q5_K_S", "Q5_K_M", "Q6_K", "Q8_0", "IQ2", "IQ3", "IQ4", "IQ5", "IQ6", "F16", "F32",
];

export type GgufFile = {
  path: string;
  name: string;
  size: number;
  quantization: string;
  parameterSize: string;
  downloadUrl: string;
};

export function detectQuantization(filename: string) {
  const normalized = filename.toUpperCase().replace(/[-.]/g, "_");
  const match = QUANTIZATION_PATTERNS.find((candidate) => normalized.includes(candidate));
  return match ?? "Unknown";
}

export function isGguf(path: string) {
  return path.toLowerCase().endsWith(".gguf");
}

export function detectParameterSize(...sources: string[]) {
  const combined = sources.join(" ");
  const match = combined.match(/(?:^|[-_.\s])([0-9]+(?:\.[0-9]+)?)([BMT])(?=$|[-_.\s])/i);
  return match ? `${match[1]}${match[2].toUpperCase()}` : "";
}

export function parseGgufFiles(files: RepositoryFile[], buildUrl: (path: string) => string, context = ""): GgufFile[] {
  return files
    .filter((file) => file.type !== "directory" && typeof file.path === "string" && isGguf(file.path))
    .map((file) => {
      const path = file.path as string;
      const name = path.split("/").pop() ?? path;
      return {
        path,
        name,
        size: file.lfs?.size ?? file.size ?? 0,
        quantization: detectQuantization(name),
        parameterSize: detectParameterSize(name, context),
        downloadUrl: buildUrl(path),
      };
    });
}

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "Size unavailable";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 2)} ${units[index]}`;
}

export function formatNumber(value?: number) {
  if (typeof value !== "number") return null;
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function getPcProfile() {
  const browserNavigator = typeof navigator !== "undefined" ? (navigator as Navigator & { deviceMemory?: number }) : null;
  const deviceMemory = typeof browserNavigator?.deviceMemory === "number" ? browserNavigator.deviceMemory : 4;
  const cores = typeof navigator !== "undefined" && typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : 2;
  return { ramGb: deviceMemory, cores };
}

export type PcSuitability = {
  status: "good" | "medium" | "bad";
  label: string;
  message: string;
};

const suitabilityCopy = {
  ar: {
    labels: { good: "مناسب", medium: "متوسط", bad: "ثقيل" },
    unknown: "ما قدرناش نحدد الحجم؛ جرّب Q4_K_M وموديل صغير أولاً.",
    lowGood: "غالباً غادي يخدم مزيان مع Q4_K_M.",
    lowMedium: "ممكن يخدم، ولكن اختار Q3_K_M أو Q4_K_S وسد البرامج الأخرى.",
    lowBad: "ما منصحش به لهاد الـPC؛ جرّب موديل 2B–3B.",
    midGood: "غالباً غادي يخدم مزيان مع Q4_K_M أو Q4_K_S.",
    midMedium: "ممكن يخدم ببطء؛ اختار Q3 أو Q4 وخلي الذاكرة فارغة.",
    midBad: "ما منصحش به؛ جرّب موديل أصغر من 7B.",
    highGood: "مناسب غالباً مع Q4_K_M أو Q5_K_M.",
    highMedium: "ممكن، ولكن استعمل Q4_K_M وتوقع بطء شوية.",
    highBad: "ثقيل على هاد الـPC؛ اختار موديل أصغر أو quantization أخف.",
    maxGood: "مناسب غالباً مع Q5_K_M أو Q6_K.",
    maxMedium: "ممكن مع Q4_K_M، ولكن التجربة كتختلف حسب GPU وcontext.",
    maxBad: "كبير بزاف لهاد الإعداد؛ اختار موديل أصغر أو جهاز أقوى.",
  },
  fr: {
    labels: { good: "Adapté", medium: "À vérifier", bad: "Trop lourd" },
    unknown: "Taille inconnue : commencez par un petit modèle en Q4_K_M.",
    lowGood: "Devrait bien fonctionner avec Q4_K_M.",
    lowMedium: "Possible, mais choisissez Q3_K_M ou Q4_K_S et fermez les autres applications.",
    lowBad: "Déconseillé pour ce PC : essayez un modèle de 2B à 3B.",
    midGood: "Devrait bien fonctionner avec Q4_K_M ou Q4_K_S.",
    midMedium: "Possible mais lent : choisissez Q3 ou Q4 et libérez la mémoire.",
    midBad: "Déconseillé : essayez un modèle inférieur à 7B.",
    highGood: "Généralement adapté avec Q4_K_M ou Q5_K_M.",
    highMedium: "Possible avec Q4_K_M, mais attendez-vous à une vitesse réduite.",
    highBad: "Trop lourd pour ce PC : choisissez un modèle plus petit ou une quantification plus légère.",
    maxGood: "Généralement adapté avec Q5_K_M ou Q6_K.",
    maxMedium: "Possible avec Q4_K_M, selon le GPU et le contexte.",
    maxBad: "Trop grand pour cette configuration : choisissez un modèle plus petit ou un PC plus puissant.",
  },
  en: {
    labels: { good: "Suitable", medium: "Conditional", bad: "Too heavy" },
    unknown: "Unknown size: start with a smaller model using Q4_K_M.",
    lowGood: "Should run well with Q4_K_M.",
    lowMedium: "May work, but choose Q3_K_M or Q4_K_S and close other apps.",
    lowBad: "Not recommended for this PC: try a 2B–3B model.",
    midGood: "Should run well with Q4_K_M or Q4_K_S.",
    midMedium: "May run slowly: choose Q3 or Q4 and free up memory.",
    midBad: "Not recommended: try a model smaller than 7B.",
    highGood: "Generally suitable with Q4_K_M or Q5_K_M.",
    highMedium: "Possible with Q4_K_M, but expect slower performance.",
    highBad: "Too heavy for this PC: choose a smaller model or lighter quantization.",
    maxGood: "Generally suitable with Q5_K_M or Q6_K.",
    maxMedium: "Possible with Q4_K_M, depending on GPU and context size.",
    maxBad: "Too large for this setup: choose a smaller model or a stronger PC.",
  },
} as const;

export function getPcSuitability(parameterSize: string, ramGb: number, language: SiteLanguage = "ar"): PcSuitability {
  const copy = suitabilityCopy[language];
  const result = (status: PcSuitability["status"], message: string): PcSuitability => ({ status, label: copy.labels[status], message });
  const value = Number.parseFloat(parameterSize);
  const unit = parameterSize.slice(-1).toUpperCase();
  const billions = unit === "T" ? value * 1000 : value;
  if (!Number.isFinite(billions)) return result("medium", copy.unknown);

  if (ramGb <= 4) {
    if (billions <= 2) return result("good", copy.lowGood);
    if (billions <= 4) return result("medium", copy.lowMedium);
    return result("bad", copy.lowBad);
  }
  if (ramGb <= 8) {
    if (billions <= 7) return result("good", copy.midGood);
    if (billions <= 13) return result("medium", copy.midMedium);
    return result("bad", copy.midBad);
  }
  if (ramGb <= 16) {
    if (billions <= 13) return result("good", copy.highGood);
    if (billions <= 34) return result("medium", copy.highMedium);
    return result("bad", copy.highBad);
  }
  if (billions <= 34) return result("good", copy.maxGood);
  if (billions <= 70) return result("medium", copy.maxMedium);
  return result("bad", copy.maxBad);
}

export function recommendForPc(parameterSize: string, ramGb: number, language: SiteLanguage = "ar") {
  return getPcSuitability(parameterSize, ramGb, language).message;
}

export function recommendationForRam(ram: string) {
  const map: Record<string, string[]> = {
    "4": ["Q3_K_S", "Q3_K_M", "Q2_K"],
    "8": ["Q4_K_M", "Q4_K_S", "Q3_K_M"],
    "16": ["Q5_K_M", "Q5_K_S", "Q4_K_M"],
    "32": ["Q6_K", "Q5_K_M", "Q4_K_M"],
    "64": ["Q8_0", "Q6_K", "Q5_K_M"],
  };
  return map[ram] ?? map["8"];
}

export type ManualPcProfile = { ramGb: number; gpu: string };

export function getDefaultManualPcProfile(): ManualPcProfile {
  return { ramGb: getPcProfile().ramGb, gpu: "" };
}

export function getPcProfileStorageKey() {
  return "gguf-finder:manual-pc-profile";
}
