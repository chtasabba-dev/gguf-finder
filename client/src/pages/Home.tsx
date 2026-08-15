/* Dark Arabic Console / Home page: paste an HF repo or owner and find GGUFs with minimal steps. */

import { useState, type FormEvent } from "react";
import { ArrowDownToLine, ExternalLink, FileCode2, FolderSearch, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildFileUrl, buildRepoUrl, findProfileRepositories, findRepository, getFriendlyError, validateOwner, validateRepoId, type ProfileRepository, type RepositoryResult } from "@/lib/huggingface";
import { detectParameterSize, formatBytes, getPcProfile, parseGgufFiles, recommendForPc, type GgufFile } from "@/lib/gguf";

const DEFAULT_REPO = "bartowski/Qwen2.5-Coder-7B-Instruct-GGUF";
type State = "idle" | "loading" | "success" | "error";
type View = "profile" | "repository";

function formatDownloads(value?: number) {
  if (!value) return "";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export default function Home() {
  const [repoInput, setRepoInput] = useState(DEFAULT_REPO);
  const [state, setState] = useState<State>("idle");
  const [view, setView] = useState<View>("repository");
  const [error, setError] = useState("");
  const [owner, setOwner] = useState("");
  const [profileRepos, setProfileRepos] = useState<ProfileRepository[]>([]);
  const [repository, setRepository] = useState<RepositoryResult | null>(null);
  const [files, setFiles] = useState<GgufFile[]>([]);
  const [pcProfile] = useState(getPcProfile);

  const loadRepository = async (repoId: string) => {
    setState("loading");
    setError("");
    try {
      const data = await findRepository(repoId);
      const ggufFiles = parseGgufFiles(data.files, (path) => buildFileUrl(repoId, path), repoId);
      setRepository(data);
      setFiles(ggufFiles);
      setView("repository");
      setState("success");
    } catch (caught) {
      setError(getFriendlyError(caught));
      setState("error");
    }
  };

  const search = async (event?: FormEvent) => {
    event?.preventDefault();
    const input = repoInput.trim();
    const repoId = validateRepoId(input);
    if (repoId) {
      await loadRepository(repoId);
      return;
    }
    const profile = validateOwner(input);
    if (!profile) {
      setError("دخل owner/repository أو غير اسم الـowner بحال bartowski");
      setState("error");
      return;
    }
    setState("loading");
    setError("");
    try {
      const repos = await findProfileRepositories(profile);
      setOwner(profile);
      setProfileRepos(repos);
      setRepository(null);
      setFiles([]);
      setView("profile");
      setState("success");
    } catch (caught) {
      setError(getFriendlyError(caught));
      setState("error");
    }
  };

  return (
    <div className="dark-app" dir="rtl">
      <header className="dark-header"><a className="dark-brand" href="/" aria-label="GGUF Finder الرئيسية"><span className="dark-logo">↓</span><span><strong>GGUF</strong> Finder</span></a><span className="dark-header-note">تحميل نماذج GGUF من Hugging Face</span></header>
      <main className="dark-main">
        <section className="dark-intro"><p className="dark-eyebrow">أداة بسيطة وسريعة</p><h1>لقا ملفات<br /><span>GGUF</span> بسهولة</h1><p>لسّق رابط المستودع، owner/repository، أو غير اسم الـowner وغادي نلقاو ليك موديلات GGUF.</p></section>
        <form className="dark-search" onSubmit={search}><label htmlFor="repo-input">رابط المستودع أو اسم الـowner</label><div className="dark-input-row"><Search size={18} /><Input id="repo-input" value={repoInput} onChange={(event) => setRepoInput(event.target.value)} placeholder="owner/repository أو owner" dir="ltr" /><button type="button" aria-label="مسح" onClick={() => setRepoInput("")}><X size={16} /></button></div><Button className="dark-search-button" type="submit" disabled={state === "loading"}>{state === "loading" ? <><Loader2 size={16} className="spin" /> كيقلب...</> : <><span>قلب على GGUF</span><Search size={16} /></>}</Button><small>مثال repository: {DEFAULT_REPO} · مثال owner: bartowski</small></form>

        {state === "idle" && <div className="dark-empty"><FileCode2 size={30} /><p>لسّق repository أو owner باش نبداو.</p></div>}
        {state === "loading" && <div className="dark-message"><Loader2 size={28} className="spin" /><p>كنقرا Hugging Face...</p></div>}
        {state === "error" && <div className="dark-message dark-error"><X size={28} /><p>{error}</p><button onClick={() => void search()}>عاود المحاولة</button></div>}

        {state === "success" && view === "profile" && <section className="dark-results"><div className="dark-result-head"><div><p className="dark-eyebrow">الـprofile</p><h2>{owner}</h2><p>{profileRepos.length} مستودع فيه GGUF</p></div><a href={`https://huggingface.co/${encodeURIComponent(owner)}`} target="_blank" rel="noreferrer" className="dark-repo-link">فتح الـprofile <ExternalLink size={14} /></a></div>{profileRepos.length === 0 ? <div className="dark-message"><FolderSearch size={28} /><p>ما لقيت حتى مستودع GGUF لهاد الـprofile.</p></div> : <div className="dark-profile-list">{profileRepos.map((repo, index) => <article className="dark-profile-card" key={repo.id}><div><span className="dark-card-index">{String(index + 1).padStart(2, "0")}</span><h3>{repo.id.split("/").slice(1).join("/")}</h3><p>{repo.downloads ? `${formatDownloads(repo.downloads)} تحميل` : ""}{repo.likes ? ` · ${formatDownloads(repo.likes)} إعجاب` : ""}</p></div><button className="dark-open-button" onClick={() => void loadRepository(repo.id)}>شوف الملفات <ArrowDownToLine size={15} /></button></article>)}</div>}</section>}

        {state === "success" && view === "repository" && repository && <section className="dark-results"><div className="dark-result-head"><div><p className="dark-eyebrow">المستودع</p><h2>{repository.metadata.id.split("/").slice(1).join("/")}</h2><p>{files.length} ملف GGUF{detectParameterSize(repository.metadata.id) ? ` · ${detectParameterSize(repository.metadata.id)} بارامتر` : ""}</p><p className="dark-recommendation">اقتراح للـPC ديالك (RAM تقريباً {pcProfile.ramGb}GB): {recommendForPc(detectParameterSize(repository.metadata.id), pcProfile.ramGb)}</p></div><a href={buildRepoUrl(repository.repoId)} target="_blank" rel="noreferrer" className="dark-repo-link">فتح المستودع <ExternalLink size={14} /></a></div>{files.length === 0 ? <div className="dark-message"><FileCode2 size={28} /><p>ما كاين حتى ملف GGUF فهاد المستودع.</p></div> : <div className="dark-file-list">{files.map((file) => <article className="dark-file" key={file.path}><div className="dark-file-meta"><strong>{file.quantization}</strong><span title={file.name}>{file.name}</span><small>{file.parameterSize ? `${file.parameterSize} بارامتر · ` : ""}{formatBytes(file.size)}</small></div><a className="dark-download" href={file.downloadUrl} download={file.name} target="_blank" rel="noreferrer"><ArrowDownToLine size={16} /> تحميل</a></article>)}</div>}</section>}
      </main>
      <footer className="dark-footer">GGUF Finder · خدام بلا API key للمستودعات العامة · <a href={`${import.meta.env.BASE_URL}?page=privacy`}>سياسة الخصوصية</a></footer>
    </div>
  );
}
