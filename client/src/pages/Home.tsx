/* Dark Arabic Console / Home page: multilingual Hugging Face search with profile return navigation. */

import { useEffect, useState, type FormEvent } from "react";
import { ArrowDownToLine, ArrowRight, ExternalLink, FileCode2, FolderSearch, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { buildFileUrl, buildRepoUrl, findProfileRepositories, findRepository, getFriendlyError, validateOwner, validateRepoId, type ProfileRepository, type RepositoryResult } from "@/lib/huggingface";
import { getPreferredLanguage, savePreferredLanguage, type SiteLanguage } from "@/lib/i18n";
import { detectParameterSize, formatBytes, getPcProfile, getPcSuitability, parseGgufFiles, type GgufFile } from "@/lib/gguf";

const DEFAULT_REPO = "bartowski/Qwen2.5-Coder-7B-Instruct-GGUF";
type State = "idle" | "loading" | "success" | "error";
type View = "profile" | "repository";

const copy = {
  ar: { dir: "rtl", header: "تحميل نماذج GGUF من Hugging Face", eyebrow: "أداة بسيطة وسريعة", titleA: "لقا ملفات", titleB: "بسهولة", intro: "لسّق رابط المستودع، owner/repository، أو غير اسم الـowner وغادي نلقاو ليك موديلات GGUF.", label: "رابط المستودع أو اسم الـowner", placeholder: "owner/repository أو owner", search: "قلب على GGUF", searching: "كيقلب...", example: "مثال repository", ownerExample: "مثال owner", idle: "لسّق repository أو owner باش نبداو.", loading: "كنقرا Hugging Face...", retry: "عاود المحاولة", profile: "الـprofile", repository: "المستودع", profileCount: (count: number) => `${count} مستودع فيه GGUF`, openProfile: "فتح الـprofile", noProfile: "ما لقيت حتى مستودع GGUF لهاد الـprofile.", viewFiles: "شوف الملفات", files: (count: number) => `${count} ملف GGUF`, parameters: "بارامتر", pc: "للـPC ديالك", openRepo: "فتح المستودع", noFiles: "ما كاين حتى ملف GGUF فهاد المستودع.", download: "تحميل", back: "رجوع للـprofile", footer: "خدام بلا API key للمستودعات العامة", privacy: "سياسة الخصوصية", invalid: "دخل owner/repository أو غير اسم الـowner بحال bartowski", downloads: "تحميل", likes: "إعجاب" },
  fr: { dir: "ltr", header: "Télécharger des modèles GGUF depuis Hugging Face", eyebrow: "Outil simple et rapide", titleA: "Trouvez des fichiers", titleB: "facilement", intro: "Collez un lien de dépôt, owner/repository, ou seulement un nom d’utilisateur pour trouver les modèles GGUF.", label: "Lien du dépôt ou nom du propriétaire", placeholder: "owner/repository ou owner", search: "Chercher GGUF", searching: "Recherche...", example: "Exemple dépôt", ownerExample: "Exemple owner", idle: "Collez un dépôt ou un propriétaire pour commencer.", loading: "Lecture de Hugging Face...", retry: "Réessayer", profile: "Profil", repository: "Dépôt", profileCount: (count: number) => `${count} dépôt${count > 1 ? "s" : ""} avec GGUF`, openProfile: "Ouvrir le profil", noProfile: "Aucun dépôt GGUF trouvé pour ce profil.", viewFiles: "Voir les fichiers", files: (count: number) => `${count} fichier${count > 1 ? "s" : ""} GGUF`, parameters: "paramètres", pc: "Pour votre PC", openRepo: "Ouvrir le dépôt", noFiles: "Aucun fichier GGUF dans ce dépôt.", download: "Télécharger", back: "Retour au profil", footer: "Fonctionne sans clé API pour les dépôts publics", privacy: "Politique de confidentialité", invalid: "Saisissez owner/repository ou seulement un owner comme bartowski", downloads: "téléchargements", likes: "j’aime" },
  en: { dir: "ltr", header: "Download GGUF models from Hugging Face", eyebrow: "Simple, fast utility", titleA: "Find GGUF files", titleB: "with ease", intro: "Paste a repository link, owner/repository, or just an owner name to find GGUF models.", label: "Repository link or owner name", placeholder: "owner/repository or owner", search: "Find GGUF", searching: "Searching...", example: "Repository example", ownerExample: "Owner example", idle: "Paste a repository or owner to get started.", loading: "Reading Hugging Face...", retry: "Try again", profile: "Profile", repository: "Repository", profileCount: (count: number) => `${count} ${count === 1 ? "GGUF repository" : "GGUF repositories"}`, openProfile: "Open profile", noProfile: "No GGUF repositories found for this profile.", viewFiles: "View files", files: (count: number) => `${count} GGUF file${count === 1 ? "" : "s"}`, parameters: "parameters", pc: "For your PC", openRepo: "Open repository", noFiles: "No GGUF files in this repository.", download: "Download", back: "Back to profile", footer: "Works without an API key for public repositories", privacy: "Privacy Policy", invalid: "Enter owner/repository or an owner name such as bartowski", downloads: "downloads", likes: "likes" },
} as const;

function formatDownloads(value?: number) {
  if (!value) return "";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export default function Home() {
  const [language, setLanguage] = useState<SiteLanguage>(getPreferredLanguage);
  const [repoInput, setRepoInput] = useState(DEFAULT_REPO);
  const [state, setState] = useState<State>("idle");
  const [view, setView] = useState<View>("repository");
  const [canReturnToProfile, setCanReturnToProfile] = useState(false);
  const [error, setError] = useState("");
  const [owner, setOwner] = useState("");
  const [profileRepos, setProfileRepos] = useState<ProfileRepository[]>([]);
  const [repository, setRepository] = useState<RepositoryResult | null>(null);
  const [files, setFiles] = useState<GgufFile[]>([]);
  const [pcProfile] = useState(getPcProfile);
  const t = copy[language];
  const suitability = repository ? getPcSuitability(detectParameterSize(repository.metadata.id), pcProfile.ramGb, language) : null;

  useEffect(() => { document.documentElement.lang = language; document.documentElement.dir = t.dir; }, [language, t.dir]);

  const changeLanguage = (next: SiteLanguage) => { setLanguage(next); savePreferredLanguage(next); };

  const loadRepository = async (repoId: string, returnToProfile = false) => {
    setState("loading");
    setError("");
    setCanReturnToProfile(returnToProfile);
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
    if (repoId) { await loadRepository(repoId); return; }
    const profile = validateOwner(input);
    if (!profile) { setError(t.invalid); setState("error"); return; }
    setState("loading"); setError(""); setCanReturnToProfile(false);
    try {
      const repos = await findProfileRepositories(profile);
      setOwner(profile); setProfileRepos(repos); setRepository(null); setFiles([]); setView("profile"); setState("success");
    } catch (caught) { setError(getFriendlyError(caught)); setState("error"); }
  };

  const backToProfile = () => { setRepository(null); setFiles([]); setView("profile"); setState("success"); setCanReturnToProfile(false); };

  return (
    <div className="dark-app" dir={t.dir}>
      <header className="dark-header"><a className="dark-brand" href={import.meta.env.BASE_URL} aria-label="GGUF Finder"><span className="dark-logo">↓</span><span><strong>GGUF</strong> Finder</span></a><div className="dark-header-tools"><span className="dark-header-note">{t.header}</span><LanguageSwitcher language={language} onChange={changeLanguage} /></div></header>
      <main className="dark-main">
        <section className="dark-intro"><p className="dark-eyebrow">{t.eyebrow}</p><h1>{t.titleA}<br /><span>GGUF</span> {t.titleB}</h1><p>{t.intro}</p></section>
        <form className="dark-search" onSubmit={search}><label htmlFor="repo-input">{t.label}</label><div className="dark-input-row"><Search size={18} /><Input id="repo-input" value={repoInput} onChange={(event) => setRepoInput(event.target.value)} placeholder={t.placeholder} dir="ltr" /><button type="button" aria-label="Clear" onClick={() => setRepoInput("")}><X size={16} /></button></div><Button className="dark-search-button" type="submit" disabled={state === "loading"}>{state === "loading" ? <><Loader2 size={16} className="spin" /> {t.searching}</> : <><span>{t.search}</span><Search size={16} /></>}</Button><small>{t.example}: {DEFAULT_REPO} · {t.ownerExample}: bartowski</small></form>

        {state === "idle" && <div className="dark-empty"><FileCode2 size={30} /><p>{t.idle}</p></div>}
        {state === "loading" && <div className="dark-message"><Loader2 size={28} className="spin" /><p>{t.loading}</p></div>}
        {state === "error" && <div className="dark-message dark-error"><X size={28} /><p>{error}</p><button onClick={() => void search()}>{t.retry}</button></div>}

        {state === "success" && view === "profile" && <section className="dark-results"><div className="dark-result-head"><div><p className="dark-eyebrow">{t.profile}</p><h2>{owner}</h2><p>{t.profileCount(profileRepos.length)}</p></div><a href={`https://huggingface.co/${encodeURIComponent(owner)}`} target="_blank" rel="noreferrer" className="dark-repo-link">{t.openProfile} <ExternalLink size={14} /></a></div>{profileRepos.length === 0 ? <div className="dark-message"><FolderSearch size={28} /><p>{t.noProfile}</p></div> : <div className="dark-profile-list">{profileRepos.map((repo, index) => <article className="dark-profile-card" key={repo.id}><div><span className="dark-card-index">{String(index + 1).padStart(2, "0")}</span><h3>{repo.id.split("/").slice(1).join("/")}</h3><p>{repo.downloads ? `${formatDownloads(repo.downloads)} ${t.downloads}` : ""}{repo.likes ? ` · ${formatDownloads(repo.likes)} ${t.likes}` : ""}</p></div><button className="dark-open-button" onClick={() => void loadRepository(repo.id, true)}>{t.viewFiles} <ArrowDownToLine size={15} /></button></article>)}</div>}</section>}

        {state === "success" && view === "repository" && repository && <section className="dark-results"><div className="dark-result-head"><div>{canReturnToProfile && <button className="dark-back-results" type="button" onClick={backToProfile}><ArrowRight size={15} /> {t.back}</button>}<p className="dark-eyebrow">{t.repository}</p><h2>{repository.metadata.id.split("/").slice(1).join("/")}</h2><p>{t.files(files.length)}{detectParameterSize(repository.metadata.id) ? ` · ${detectParameterSize(repository.metadata.id)} ${t.parameters}` : ""}</p>{suitability && <div className={`dark-recommendation dark-recommendation--${suitability.status}`}><span>{suitability.label}</span><p>{t.pc} (RAM ≈ {pcProfile.ramGb}GB): {suitability.message}</p></div>}</div><a href={buildRepoUrl(repository.repoId)} target="_blank" rel="noreferrer" className="dark-repo-link">{t.openRepo} <ExternalLink size={14} /></a></div>{files.length === 0 ? <div className="dark-message"><FileCode2 size={28} /><p>{t.noFiles}</p></div> : <div className="dark-file-list">{files.map((file) => <article className="dark-file" key={file.path}><div className="dark-file-meta"><strong>{file.quantization}</strong><span title={file.name}>{file.name}</span><small>{file.parameterSize ? `${file.parameterSize} ${t.parameters} · ` : ""}{formatBytes(file.size)}</small></div><a className="dark-download" href={file.downloadUrl} download={file.name} target="_blank" rel="noreferrer"><ArrowDownToLine size={16} /> {t.download}</a></article>)}</div>}</section>}
      </main>
      <footer className="dark-footer">GGUF Finder · {t.footer} · <a href={`${import.meta.env.BASE_URL}?page=privacy`}>{t.privacy}</a></footer>
    </div>
  );
}
