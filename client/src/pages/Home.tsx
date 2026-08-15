/* Dark Arabic Console / Home page: minimal RTL workflow for finding and downloading GGUF files. */

import { useState, type FormEvent } from "react";
import { ArrowDownToLine, ExternalLink, FileCode2, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildFileUrl, buildRepoUrl, findRepository, getFriendlyError, validateRepoId, type RepositoryResult } from "@/lib/huggingface";
import { formatBytes, parseGgufFiles, type GgufFile } from "@/lib/gguf";

const DEFAULT_REPO = "bartowski/Qwen2.5-Coder-7B-Instruct-GGUF";

type State = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [repoInput, setRepoInput] = useState(DEFAULT_REPO);
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const [repository, setRepository] = useState<RepositoryResult | null>(null);
  const [files, setFiles] = useState<GgufFile[]>([]);

  const search = async (event?: FormEvent) => {
    event?.preventDefault();
    const repoId = validateRepoId(repoInput);
    if (!repoId) {
      setError("دخل اسم المستودع بهاد الشكل: owner/repository");
      setState("error");
      return;
    }
    setState("loading");
    setError("");
    try {
      const data = await findRepository(repoId);
      const ggufFiles = parseGgufFiles(data.files, (path) => buildFileUrl(repoId, path));
      setRepository(data);
      setFiles(ggufFiles);
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
        <section className="dark-intro"><p className="dark-eyebrow">أداة بسيطة وسريعة</p><h1>لقا ملفات<br /><span>GGUF</span> بسهولة</h1><p>دخل رابط المستودع ديالك، وغادي يبانولك غير الملفات اللي تقدر تحمل مباشرة.</p></section>
        <form className="dark-search" onSubmit={search}><label htmlFor="repo-input">رابط المستودع</label><div className="dark-input-row"><Search size={18} /><Input id="repo-input" value={repoInput} onChange={(event) => setRepoInput(event.target.value)} placeholder="owner/repository" dir="ltr" /><button type="button" aria-label="مسح" onClick={() => setRepoInput("")}><X size={16} /></button></div><Button className="dark-search-button" type="submit" disabled={state === "loading"}>{state === "loading" ? <><Loader2 size={16} className="spin" /> كيقلب...</> : <><span>قلب على الملفات</span><Search size={16} /></>}</Button><small>مثال: {DEFAULT_REPO}</small></form>

        {state === "idle" && <div className="dark-empty"><FileCode2 size={30} /><p>مازال ما قلبتي على حتى مستودع.</p></div>}
        {state === "loading" && <div className="dark-message"><Loader2 size={28} className="spin" /><p>كنقرا ملفات المستودع...</p></div>}
        {state === "error" && <div className="dark-message dark-error"><X size={28} /><p>{error}</p><button onClick={() => void search()}>عاود المحاولة</button></div>}
        {state === "success" && repository && <section className="dark-results"><div className="dark-result-head"><div><p className="dark-eyebrow">المستودع</p><h2>{repository.metadata.id.split("/").slice(1).join("/")}</h2><p>{files.length} ملف GGUF</p></div><a href={buildRepoUrl(repository.repoId)} target="_blank" rel="noreferrer" className="dark-repo-link">فتح المستودع <ExternalLink size={14} /></a></div>{files.length === 0 ? <div className="dark-message"><FileCode2 size={28} /><p>ما كاين حتى ملف GGUF فهاد المستودع.</p></div> : <div className="dark-file-list">{files.map((file) => <article className="dark-file" key={file.path}><div className="dark-file-meta"><strong>{file.quantization}</strong><span title={file.name}>{file.name}</span><small>{formatBytes(file.size)}</small></div><a className="dark-download" href={file.downloadUrl} download={file.name} target="_blank" rel="noreferrer"><ArrowDownToLine size={16} /> تحميل</a></article>)}</div>}</section>}
      </main>
      <footer className="dark-footer">GGUF Finder · خدام بلا API key للمستودعات العامة</footer>
    </div>
  );
}
