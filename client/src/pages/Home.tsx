/* Paper Console / Home page: the asymmetric workbench for repository-to-file discovery. */

import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowDownToLine, ArrowUpRight, Check, ChevronDown, Clipboard, ExternalLink, FileCode2, Github, History, Info, Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildFileUrl, buildRepoUrl, findRepository, getFriendlyError, validateRepoId, type RepositoryResult } from "@/lib/huggingface";
import { formatBytes, formatNumber, parseGgufFiles, recommendationForRam, type GgufFile } from "@/lib/gguf";

const HISTORY_KEY = "gguf-finder:history";
const DEFAULT_REPO = "bartowski/Qwen2.5-Coder-7B-Instruct-GGUF";
type Status = "idle" | "searching" | "success" | "error";
type SortMode = "quantization" | "size-desc" | "size-asc";

function readHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as string[]; } catch { return []; }
}
function saveHistory(repoId: string) {
  const next = [repoId, ...readHistory().filter((item) => item !== repoId)].slice(0, 6);
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* optional storage */ }
  return next;
}
function AppMark() {
  return <div className="brand-mark" aria-hidden="true"><img src="/manus-storage/gguf-finder-logo_710914ed.png" alt="" /></div>;
}
function StatusPill({ status }: { status: Status }) {
  if (status === "searching") return <span className="status-pill status-pill-live"><span className="status-dot" /> Fetching repository</span>;
  if (status === "success") return <span className="status-pill"><Check size={13} /> Index ready</span>;
  if (status === "error") return <span className="status-pill status-pill-error"><X size={13} /> Search interrupted</span>;
  return <span className="status-pill"><span className="status-dot status-dot-muted" /> Ready for a repository</span>;
}

export default function Home() {
  const [repoInput, setRepoInput] = useState(DEFAULT_REPO);
  const [result, setResult] = useState<RepositoryResult | null>(null);
  const [files, setFiles] = useState<GgufFile[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<string[]>(readHistory);
  const [fileSearch, setFileSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("quantization");
  const [ram, setRam] = useState("8");
  const [copied, setCopied] = useState<string | null>(null);

  const handleSearch = async (event?: FormEvent) => {
    event?.preventDefault();
    const repoId = validateRepoId(repoInput);
    if (!repoId) {
      setStatus("error");
      setError("Enter a repository in owner/repository format, such as bartowski/Qwen2.5-Coder-7B-Instruct-GGUF.");
      return;
    }
    setStatus("searching"); setError(""); setResult(null); setFiles([]);
    try {
      const repository = await findRepository(repoId);
      const parsed = parseGgufFiles(repository.files, (path) => buildFileUrl(repoId, path));
      setResult(repository); setFiles(parsed); setHistory(saveHistory(repoId)); setStatus("success");
    } catch (caught) { setStatus("error"); setError(getFriendlyError(caught)); }
  };

  const filteredFiles = useMemo(() => {
    const query = fileSearch.trim().toLowerCase();
    return files.filter((file) => !query || `${file.name} ${file.quantization}`.toLowerCase().includes(query)).sort((a, b) => {
      if (sortMode === "size-desc") return b.size - a.size;
      if (sortMode === "size-asc") return a.size - b.size;
      return a.quantization.localeCompare(b.quantization) || a.name.localeCompare(b.name);
    });
  }, [files, fileSearch, sortMode]);

  const copyLink = async (url: string, key: string) => {
    try { await navigator.clipboard.writeText(url); setCopied(key); window.setTimeout(() => setCopied(null), 1600); }
    catch { toast.error("Copy is unavailable in this browser."); }
  };

  const license = typeof result?.metadata.cardData?.license === "string" ? result.metadata.cardData.license : "License not listed";
  const repoName = result?.metadata.id.split("/").slice(1).join("/") ?? "";
  const recommendations = recommendationForRam(ram);

  return (
    <div className="app-shell">
      <header className="topbar"><div className="topbar-inner">
        <a className="brand" href="/" aria-label="GGUF Finder home"><AppMark /><span><strong>GGUF</strong> FINDER</span></a>
        <div className="topbar-context"><span className="topbar-kicker">HUGGING FACE UTILITY</span><span className="topbar-rule" /><span className="topbar-note">No token required for public repositories</span></div>
        <a className="github-link" href="https://huggingface.co" target="_blank" rel="noreferrer"><Github size={15} /><span>Source context</span></a>
      </div></header>

      <main className="workbench">
        <section className="search-rail" aria-labelledby="page-title">
          <div className="index-label"><span className="index-number">01</span><span>REPOSITORY LOOKUP</span></div>
          <h1 id="page-title">Find the right<br /><em>GGUF file.</em></h1>
          <p className="hero-copy">A quiet, direct path from a Hugging Face repository to the quantization you actually need.</p>
          <form className="search-form" onSubmit={handleSearch}>
            <label htmlFor="repo-input">Repository ID</label>
            <div className="search-input-wrap"><Search size={17} aria-hidden="true" /><Input id="repo-input" value={repoInput} onChange={(event) => setRepoInput(event.target.value)} placeholder="owner/repository" autoComplete="off" /><button className="clear-input" type="button" onClick={() => setRepoInput("")} aria-label="Clear repository field"><X size={15} /></button></div>
            <Button className="find-button" type="submit" disabled={status === "searching"}>{status === "searching" ? <><Loader2 size={16} className="spin" /> Reading repository</> : <><span>Find GGUF</span><ArrowUpRight size={17} /></>}</Button>
            <p className="form-hint"><span className="kbd">↵</span> Press Enter to search <span className="hint-separator">·</span> Public repositories only</p>
          </form>
          <StatusPill status={status} />
          <div className="rail-divider" />
          <div className="rail-section-label"><History size={14} /> Recent repositories</div>
          {history.length > 0 ? <div className="history-list">{history.map((item) => <button key={item} className="history-item" onClick={() => { setRepoInput(item); void handleSearch(); }}><span>{item.split("/")[0]}<b>/</b>{item.split("/").slice(1).join("/")}</span><ArrowUpRight size={13} /></button>)}</div> : <p className="empty-history">Your recent lookups will appear here.</p>}
          <div className="rail-footer"><span className="footer-mark">⌁</span><span>Fast, local-first interface<br />Official Hub endpoints</span></div>
        </section>

        <section className="results-surface" aria-live="polite">
          <div className="surface-topline"><div className="index-label"><span className="index-number">02</span><span>FILE MANIFEST</span></div><span className="surface-meta">{result ? `${result.files.length} total repository entries` : "Waiting for a repository"}</span></div>
          {status === "idle" && <IdleState onExample={() => setRepoInput(DEFAULT_REPO)} />}
          {status === "searching" && <LoadingState />}
          {status === "error" && <ErrorState error={error} onRetry={() => void handleSearch()} />}
          {status === "success" && result && <SuccessState result={result} files={files} repoName={repoName} license={license} filteredFiles={filteredFiles} fileSearch={fileSearch} setFileSearch={setFileSearch} sortMode={sortMode} setSortMode={setSortMode} copyLink={copyLink} copied={copied} ram={ram} setRam={setRam} recommendations={recommendations} />}
          <footer className="surface-footer"><span>GGUF FINDER / v0.1</span><span className="surface-footer-center">Built for public Hugging Face repositories</span><span><a href="https://huggingface.co/docs/huggingface_hub/en/package_reference/file_download" target="_blank" rel="noreferrer">API reference <ArrowUpRight size={12} /></a></span></footer>
        </section>
      </main>
    </div>
  );
}

function IdleState({ onExample }: { onExample: () => void }) {
  return <div className="empty-state"><div className="empty-illustration"><FileCode2 size={38} strokeWidth={1.3} /><span className="empty-spark">✦</span></div><div className="empty-copy"><p className="eyebrow">Start with a public model repository</p><h2>GGUF files, without the noise.</h2><p>Enter a Hugging Face repository on the left. GGUF Finder ignores every non-GGUF artifact, then gives you direct links to the files that matter.</p></div><button className="example-chip" onClick={onExample}><span>TRY AN EXAMPLE</span><code>{DEFAULT_REPO}</code><ArrowUpRight size={15} /></button></div>;
}
function LoadingState() {
  return <div className="loading-state"><div className="loading-orbit"><span /><span /><span /></div><p className="eyebrow">Reading the Hub tree</p><h2>Indexing repository files…</h2><p>Metadata first, then the complete file tree. Large repositories may take a little longer.</p></div>;
}
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return <div className="error-state"><div className="error-icon"><X size={26} /></div><p className="eyebrow">Could not complete lookup</p><h2>{error.includes("not found") ? "Repository not found." : "The lookup needs another try."}</h2><p>{error}</p><Button className="retry-button" onClick={onRetry}><ArrowUpRight size={16} /> Try again</Button></div>;
}

type SuccessProps = { result: RepositoryResult; files: GgufFile[]; repoName: string; license: string; filteredFiles: GgufFile[]; fileSearch: string; setFileSearch: (value: string) => void; sortMode: SortMode; setSortMode: (value: SortMode) => void; copyLink: (url: string, key: string) => void; copied: string | null; ram: string; setRam: (value: string) => void; recommendations: string[] };
function SuccessState({ result, files, repoName, license, filteredFiles, fileSearch, setFileSearch, sortMode, setSortMode, copyLink, copied, ram, setRam, recommendations }: SuccessProps) {
  return <div className="success-content">
    <div className="repo-overview"><div className="repo-heading"><div className="repo-icon"><FileCode2 size={23} /></div><div><p className="eyebrow">{result.metadata.author ?? result.metadata.id.split("/")[0]} / MODEL REPOSITORY</p><h2>{repoName}</h2><div className="repo-submeta"><span>License: <b>{license}</b></span>{result.metadata.pipeline_tag && <><span className="submeta-dot" /><span>{result.metadata.pipeline_tag}</span></>}{result.metadata.downloads !== undefined && <><span className="submeta-dot" /><span>{formatNumber(result.metadata.downloads)} downloads</span></>}</div></div></div><div className="repo-actions"><a className="quiet-button" href={buildRepoUrl(result.repoId)} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Open Hugging Face</a><div className="repo-count"><strong>{files.length}</strong><span>GGUF files<br />found</span></div></div></div>
    {files.length === 0 ? <div className="no-files"><div><p className="eyebrow">No compatible files</p><h3>This repository has no .gguf files.</h3><p>Try another model conversion repository, or open the model card to review its available artifacts.</p></div><a className="quiet-button" href={buildRepoUrl(result.repoId)} target="_blank" rel="noreferrer">Open repository <ArrowUpRight size={15} /></a></div> : <div className="file-results">
      <div className="tools-row"><div className="manifest-search"><Search size={15} /><Input value={fileSearch} onChange={(event) => setFileSearch(event.target.value)} placeholder="Search within GGUF files" aria-label="Search within GGUF files" /></div><div className="tool-controls"><label htmlFor="sort-mode" className="sr-only">Sort files</label><select id="sort-mode" value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}><option value="quantization">Sort: quantization</option><option value="size-desc">Sort: largest first</option><option value="size-asc">Sort: smallest first</option></select><ChevronDown size={15} /></div></div>
      <div className="manifest-list"><div className="manifest-header"><span>QUANTIZATION</span><span>FILE NAME</span><span>SIZE</span><span>ACTION</span></div>{filteredFiles.map((file, index) => <FileRow key={file.path} file={file} index={index} onCopy={copyLink} copied={copied === file.path} />)}</div>
      {filteredFiles.length === 0 && <div className="filtered-empty">No files match “{fileSearch}”. <button onClick={() => setFileSearch("")}>Clear filter</button></div>}
      <Recommendation ram={ram} setRam={setRam} recommendations={recommendations} />
    </div>}
  </div>;
}
function Recommendation({ ram, setRam, recommendations }: { ram: string; setRam: (value: string) => void; recommendations: string[] }) {
  return <aside className="recommendation"><div className="recommendation-icon"><Info size={16} /></div><div className="recommendation-copy"><p className="eyebrow">Approximate recommendation</p><h3>Which quantization fits your RAM?</h3><p>Actual memory use also depends on context size, runtime, operating system, and GPU.</p></div><div className="ram-control"><label htmlFor="ram-select">RAM</label><div><select id="ram-select" value={ram} onChange={(event) => setRam(event.target.value)}><option value="4">4 GB</option><option value="8">8 GB</option><option value="16">16 GB</option><option value="32">32 GB</option><option value="64">64 GB</option></select><ChevronDown size={14} /></div></div><div className="recommendation-tags">{recommendations.map((item) => <span key={item}>{item}</span>)}</div></aside>;
}
function FileRow({ file, index, onCopy, copied }: { file: GgufFile; index: number; onCopy: (url: string, key: string) => void; copied: boolean }) {
  const style = { "--row-delay": `${Math.min(index, 9) * 35}ms` } as CSSProperties;
  return <article className="manifest-row" style={style}><div className={`quantization ${file.quantization === "Unknown" ? "quantization-unknown" : ""}`}><span className="quantization-dot" />{file.quantization}</div><div className="filename-cell"><FileCode2 size={16} /><div><strong title={file.name}>{file.name}</strong><span>{file.path.includes("/") ? file.path.slice(0, file.path.lastIndexOf("/")) : "Repository root"}</span></div></div><div className="file-size">{formatBytes(file.size)}</div><div className="file-actions"><button className="icon-button" onClick={() => onCopy(file.downloadUrl, file.path)} title="Copy direct download link" aria-label={`Copy link for ${file.name}`}>{copied ? <Check size={15} /> : <Clipboard size={15} />}</button><a className="download-button" href={file.downloadUrl} download={file.name} target="_blank" rel="noreferrer"><ArrowDownToLine size={15} /><span>Download</span></a></div></article>;
}
