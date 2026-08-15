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
