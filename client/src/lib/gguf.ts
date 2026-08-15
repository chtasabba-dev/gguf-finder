/* Paper Console / parser layer: deterministic, dependency-free GGUF file interpretation. */

import type { RepositoryFile } from "./huggingface";

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

export function getPcSuitability(parameterSize: string, ramGb: number): PcSuitability {
  const value = Number.parseFloat(parameterSize);
  const unit = parameterSize.slice(-1).toUpperCase();
  const billions = unit === "T" ? value * 1000 : value;
  if (!Number.isFinite(billions)) return { status: "medium", label: "متوسط", message: "ما قدرناش نحدد الحجم؛ جرّب Q4_K_M وموديل صغير أولاً." };

  if (ramGb <= 4) {
    if (billions <= 2) return { status: "good", label: "مناسب", message: "غالباً غادي يخدم مزيان مع Q4_K_M." };
    if (billions <= 4) return { status: "medium", label: "متوسط", message: "ممكن يخدم، ولكن اختار Q3_K_M أو Q4_K_S وسد البرامج الأخرى." };
    return { status: "bad", label: "ثقيل", message: "ما منصحش به لهاد الـPC؛ جرّب موديل 2B–3B." };
  }
  if (ramGb <= 8) {
    if (billions <= 7) return { status: "good", label: "مناسب", message: "غالباً غادي يخدم مزيان مع Q4_K_M أو Q4_K_S." };
    if (billions <= 13) return { status: "medium", label: "متوسط", message: "ممكن يخدم ببطء؛ اختار Q3 أو Q4 وخلي الذاكرة فارغة." };
    return { status: "bad", label: "ثقيل", message: "ما منصحش به؛ جرّب موديل أصغر من 7B." };
  }
  if (ramGb <= 16) {
    if (billions <= 13) return { status: "good", label: "مناسب", message: "مناسب غالباً مع Q4_K_M أو Q5_K_M." };
    if (billions <= 34) return { status: "medium", label: "متوسط", message: "ممكن، ولكن استعمل Q4_K_M وتوقع بطء شوية." };
    return { status: "bad", label: "ثقيل", message: "ثقيل على هاد الـPC؛ اختار موديل أصغر أو quantization أخف." };
  }
  if (billions <= 34) return { status: "good", label: "مناسب", message: "مناسب غالباً مع Q5_K_M أو Q6_K." };
  if (billions <= 70) return { status: "medium", label: "متوسط", message: "ممكن مع Q4_K_M، ولكن التجربة كتختلف حسب GPU وcontext." };
  return { status: "bad", label: "ثقيل", message: "كبير بزاف لهاد الإعداد؛ اختار موديل أصغر أو جهاز أقوى." };
}

export function recommendForPc(parameterSize: string, ramGb: number) {
  return getPcSuitability(parameterSize, ramGb).message;
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
