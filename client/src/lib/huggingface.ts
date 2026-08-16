/* Paper Console / API layer: keep all Hugging Face communication here so the UI stays replaceable. */

export const HF_ORIGIN = "https://huggingface.co";
const API_ORIGIN = `${HF_ORIGIN}/api`;
const CACHE_TTL = 5 * 60 * 1000;

type FetchOptions = { token?: string };

export type RepositoryMetadata = {
  id: string;
  author?: string;
  cardData?: Record<string, unknown>;
  pipeline_tag?: string;
  tags?: string[];
  downloads?: number;
  likes?: number;
  private?: boolean;
  gated?: boolean | string;
  siblings?: Array<{ rfilename: string; size?: number; lfs?: { size?: number } }>;
};

export type RepositoryFile = {
  type?: string;
  path?: string;
  oid?: string;
  size?: number;
  lfs?: { size?: number };
};

export type RepositoryResult = {
  metadata: RepositoryMetadata;
  files: RepositoryFile[];
  repoId: string;
};

export type ProfileRepository = {
  id: string;
  author?: string;
  downloads?: number;
  likes?: number;
  lastModified?: string;
  tags?: string[];
  pipeline_tag?: string;
};

export class HuggingFaceError extends Error {
  status: number;
  kind: "not-found" | "auth" | "rate-limit" | "network" | "unexpected";

  constructor(message: string, status = 0, kind: HuggingFaceError["kind"] = "unexpected") {
    super(message);
    this.name = "HuggingFaceError";
    this.status = status;
    this.kind = kind;
  }
}

function cacheKey(repoId: string) {
  return `gguf-finder:v1:${repoId}`;
}

function getCached(repoId: string): RepositoryResult | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(repoId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedAt: number; value: RepositoryResult };
    return Date.now() - parsed.savedAt < CACHE_TTL ? parsed.value : null;
  } catch {
    return null;
  }
}

function setCached(repoId: string, value: RepositoryResult) {
  try {
    sessionStorage.setItem(cacheKey(repoId), JSON.stringify({ savedAt: Date.now(), value }));
  } catch {
    // Storage is an optimization only; a blocked storage context must not break search.
  }
}

async function requestJson<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const headers: HeadersInit = { Accept: "application/json" };
  if (options.token?.trim()) headers.Authorization = `Bearer ${options.token.trim()}`;

  let response: Response;
  try {
    response = await fetch(url, { headers });
  } catch {
    throw new HuggingFaceError("No internet connection. The application is ready, but Hugging Face cannot be reached.", 0, "network");
  }

  if (response.ok) return response.json() as Promise<T>;

  if (response.status === 401 || response.status === 403) {
    throw new HuggingFaceError("This repository requires authentication or access approval.", response.status, "auth");
  }
  if (response.status === 404) {
    throw new HuggingFaceError("Repository not found. The repository may be private, deleted, or the name may be incorrect.", response.status, "not-found");
  }
  if (response.status === 429) {
    throw new HuggingFaceError("Hugging Face is rate limiting requests. Please wait a moment and try again.", response.status, "rate-limit");
  }
  throw new HuggingFaceError("Hugging Face is temporarily unavailable. Please try again later.", response.status);
}

function normalizeHuggingFacePath(value: string) {
  return value.trim().replace(/^https?:\/\/huggingface\.co\//i, "").replace(/^@/, "").replace(/\/$/, "");
}

export function validateRepoId(value: string): string | null {
  const normalized = normalizeHuggingFacePath(value);
  if (!/^[^/\s]+\/[^/\s]+$/.test(normalized)) return null;
  return normalized;
}

export function validateOwner(value: string): string | null {
  const normalized = normalizeHuggingFacePath(value);
  if (!/^[^/\s]+$/.test(normalized)) return null;
  return normalized;
}

export async function findProfileRepositories(owner: string, options: FetchOptions = {}): Promise<ProfileRepository[]> {
  const normalizedOwner = validateOwner(owner);
  if (!normalizedOwner) throw new HuggingFaceError("اسم الـprofile ما صالحش. استعمل owner فقط أو رابط profile ديال Hugging Face.", 400, "not-found");
  const url = `${API_ORIGIN}/models?author=${encodeURIComponent(normalizedOwner)}&filter=gguf&limit=50&full=false&sort=downloads&direction=-1`;
  return requestJson<ProfileRepository[]>(url, options);
}

export async function findRepository(repoId: string, options: FetchOptions = {}): Promise<RepositoryResult> {
  const cached = getCached(repoId);
  if (cached) return cached;

  const encodedRepo = repoId.split("/").map(encodeURIComponent).join("/");
  const metadataUrl = `${API_ORIGIN}/models/${encodedRepo}?expand[]=cardData&expand[]=siblings&expand[]=gated`;
  const treeUrl = `${API_ORIGIN}/models/${encodedRepo}/tree/main?recursive=true&expand=true`;
  const [metadata, files] = await Promise.all([
    requestJson<RepositoryMetadata>(metadataUrl, options),
    requestJson<RepositoryFile[]>(treeUrl, options),
  ]);

  if (metadata.gated) {
    throw new HuggingFaceError("This repository requires access approval.", 403, "auth");
  }

  const result = { metadata, files, repoId };
  setCached(repoId, result);
  return result;
}

export function buildFileUrl(repoId: string, path: string, revision = "main") {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${HF_ORIGIN}/${repoId.split("/").map(encodeURIComponent).join("/")}/resolve/${encodeURIComponent(revision)}/${encodedPath}`;
}

export function buildRepoUrl(repoId: string) {
  return `${HF_ORIGIN}/${repoId.split("/").map(encodeURIComponent).join("/")}`;
}

export function getFriendlyError(error: unknown) {
  if (error instanceof HuggingFaceError) return error.message;
  return "Something unexpected happened. Please try again.";
}
