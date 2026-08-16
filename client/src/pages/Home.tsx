/* Dark Arabic Console / Home page: multilingual GGUF search, local favorites, filters, sort, and copy actions. */

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowDownToLine, ArrowRight, ChevronDown, Copy, ExternalLink, FileCode2, FolderSearch, GitCompareArrows, Heart, Loader2, Search, Settings2, Share2, Terminal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { buildFileUrl, buildRepoUrl, findProfileRepositories, findRepository, getFriendlyError, validateOwner, validateRepoId, type ProfileRepository, type RepositoryResult } from "@/lib/huggingface";
import { getPreferredLanguage, savePreferredLanguage, type SiteLanguage } from "@/lib/i18n";
import { detectParameterSize, formatBytes, getDefaultManualPcProfile, getPcProfileStorageKey, getPcSuitability, parseGgufFiles, type GgufFile, type ManualPcProfile } from "@/lib/gguf";
import { detectModelTask, modelTaskLabels, type ModelTask } from "@/lib/modelFilters";

const EXAMPLE_OWNERS = "Google · NVIDIA · DeepSeek · Qwen";
const FAVORITES_KEY = "gguf-finder:favorites";
type State = "idle" | "loading" | "success" | "error";
type View = "profile" | "repository";
type FilterMode = "all" | "good" | "medium" | "bad";
type SortMode = "size-desc" | "size-asc" | "parameters" | "quantization";
type ProfileSortMode = "downloads" | "name";
type Favorite = GgufFile & { repoId: string };

const copy = {
  ar: { dir: "rtl", header: "تحميل نماذج GGUF من Hugging Face", eyebrow: "أداة بسيطة وسريعة", titleA: "لقا ملفات", titleB: "بسهولة", intro: "لسّق رابط المستودع، owner/repository، أو غير اسم الـowner وغادي نلقاو ليك موديلات GGUF.", label: "رابط المستودع أو اسم الـowner", placeholder: "owner/repository أو owner", search: "قلب على GGUF", searching: "كيقلب...", example: "مثال repository", ownerExample: "مثال owner", idle: "لسّق repository أو owner باش نبداو.", loading: "كنقرا Hugging Face...", retry: "عاود المحاولة", profile: "الـprofile", repository: "المستودع", profileCount: (count: number) => `${count} مستودع فيه GGUF`, openProfile: "فتح الـprofile", noProfile: "ما لقيت حتى مستودع GGUF لهاد الـprofile.", viewFiles: "شوف الملفات", files: (count: number) => `${count} ملف GGUF`, parameters: "بارامتر", pc: "للـPC ديالك", openRepo: "فتح المستودع", noFiles: "ما كاين حتى ملف GGUF فهاد المستودع.", download: "تحميل", back: "رجوع للـprofile", footer: "خدام بلا API key للمستودعات العامة", privacy: "سياسة الخصوصية", invalid: "دخل owner/repository أو غير اسم الـowner بحال bartowski", downloads: "تحميل", likes: "إعجاب", favorites: "المفضلة", noFavorites: "مازال ما حفظتي حتى ملف.", removeFavorite: "حيد من المفضلة", addFavorite: "زيد للمفضلة", filters: "فلتر", all: "الكل", suitable: "مناسب", conditional: "متوسط", sort: "ترتيب", sizeLarge: "الحجم: الكبير أولاً", sizeSmall: "الحجم: الصغير أولاً", params: "عدد الـparameters", quantization: "Quantization", copyLink: "نسخ الرابط", copyCommand: "نسخ command", copied: "تنسخ", noFilterFiles: "ما كاين حتى ملف مطابق لهاد الفلتر.", backToResults: "الرجوع للنتائج" },
  fr: { dir: "ltr", header: "Télécharger des modèles GGUF depuis Hugging Face", eyebrow: "Outil simple et rapide", titleA: "Trouvez des fichiers", titleB: "facilement", intro: "Collez un lien de dépôt, owner/repository, ou seulement un nom d’utilisateur pour trouver les modèles GGUF.", label: "Lien du dépôt ou nom du propriétaire", placeholder: "owner/repository ou owner", search: "Chercher GGUF", searching: "Recherche...", example: "Exemple dépôt", ownerExample: "Exemple owner", idle: "Collez un dépôt ou un propriétaire pour commencer.", loading: "Lecture de Hugging Face...", retry: "Réessayer", profile: "Profil", repository: "Dépôt", profileCount: (count: number) => `${count} dépôt${count > 1 ? "s" : ""} avec GGUF`, openProfile: "Ouvrir le profil", noProfile: "Aucun dépôt GGUF trouvé pour ce profil.", viewFiles: "Voir les fichiers", files: (count: number) => `${count} fichier${count > 1 ? "s" : ""} GGUF`, parameters: "paramètres", pc: "Pour votre PC", openRepo: "Ouvrir le dépôt", noFiles: "Aucun fichier GGUF dans ce dépôt.", download: "Télécharger", back: "Retour au profil", footer: "Fonctionne sans clé API pour les dépôts publics", privacy: "Politique de confidentialité", invalid: "Saisissez owner/repository ou seulement un owner comme bartowski", downloads: "téléchargements", likes: "j’aime", favorites: "Favoris", noFavorites: "Aucun fichier enregistré.", removeFavorite: "Retirer des favoris", addFavorite: "Ajouter aux favoris", filters: "Filtre", all: "Tous", suitable: "Adapté", conditional: "À vérifier", sort: "Trier", sizeLarge: "Taille : grand d’abord", sizeSmall: "Taille : petit d’abord", params: "Nombre de paramètres", quantization: "Quantification", copyLink: "Copier le lien", copyCommand: "Copier la commande", copied: "Copié", noFilterFiles: "Aucun fichier ne correspond à ce filtre.", backToResults: "Retour aux résultats" },
  en: { dir: "ltr", header: "Download GGUF models from Hugging Face", eyebrow: "Simple, fast utility", titleA: "Find GGUF files", titleB: "with ease", intro: "Paste a repository link, owner/repository, or just an owner name to find GGUF models.", label: "Repository link or owner name", placeholder: "owner/repository or owner", search: "Find GGUF", searching: "Searching...", example: "Repository example", ownerExample: "Owner example", idle: "Paste a repository or owner to get started.", loading: "Reading Hugging Face...", retry: "Try again", profile: "Profile", repository: "Repository", profileCount: (count: number) => `${count} ${count === 1 ? "GGUF repository" : "GGUF repositories"}`, openProfile: "Open profile", noProfile: "No GGUF repositories found for this profile.", viewFiles: "View files", files: (count: number) => `${count} GGUF file${count === 1 ? "" : "s"}`, parameters: "parameters", pc: "For your PC", openRepo: "Open repository", noFiles: "No GGUF files in this repository.", download: "Download", back: "Back to profile", footer: "Works without an API key for public repositories", privacy: "Privacy Policy", invalid: "Enter owner/repository or an owner name such as bartowski", downloads: "downloads", likes: "likes", favorites: "Favorites", noFavorites: "No saved files yet.", removeFavorite: "Remove from favorites", addFavorite: "Add to favorites", filters: "Filter", all: "All", suitable: "Suitable", conditional: "Conditional", sort: "Sort", sizeLarge: "Size: large first", sizeSmall: "Size: small first", params: "Parameter count", quantization: "Quantization", copyLink: "Copy link", copyCommand: "Copy command", copied: "Copied", noFilterFiles: "No file matches this filter.", backToResults: "Back to results" },
} as const;

const extraCopy = {
  ar: { pc: "إعدادات PC", ram: "RAM", gpu: "GPU", gpuPlaceholder: "مثال RTX 3060 أو Radeon", save: "حفظ", automatic: "تلقائي", task: "نوع الموديل", compare: "قارن", share: "مشاركة", compareFiles: "اختار جوج ملفات للمقارنة", clear: "مسح", comparison: "مقارنة quantization", linkCopied: "تنسخ الرابط", manualNote: "الاقتراح غادي يعتمد على هاد الإعدادات." },
  fr: { pc: "Réglages PC", ram: "RAM", gpu: "GPU", gpuPlaceholder: "ex. RTX 3060 ou Radeon", save: "Enregistrer", automatic: "Auto", task: "Type de modèle", compare: "Comparer", share: "Partager", compareFiles: "Choisissez deux fichiers", clear: "Effacer", comparison: "Comparer les quantifications", linkCopied: "Lien copié", manualNote: "La recommandation utilisera ces réglages." },
  en: { pc: "PC settings", ram: "RAM", gpu: "GPU", gpuPlaceholder: "e.g. RTX 3060 or Radeon", save: "Save", automatic: "Auto", task: "Model type", compare: "Compare", share: "Share", compareFiles: "Choose two files", clear: "Clear", comparison: "Quantization comparison", linkCopied: "Link copied", manualNote: "Recommendations will use these settings." },
} as const;

function formatDownloads(value?: number) { return value ? new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value) : ""; }
function favoriteKey(file: Favorite) { return `${file.repoId}:${file.path}`; }
function loadFavorites(): Favorite[] { try { const saved = localStorage.getItem(FAVORITES_KEY); return saved ? JSON.parse(saved) as Favorite[] : []; } catch { return []; } }
function persistFavorites(next: Favorite[]) { try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); } catch { /* Local favorites are optional. */ } }

export default function Home() {
  const [language, setLanguage] = useState<SiteLanguage>(getPreferredLanguage);
  const [repoInput, setRepoInput] = useState("");
  const [state, setState] = useState<State>("idle");
  const [view, setView] = useState<View>("repository");
  const [canReturnToProfile, setCanReturnToProfile] = useState(false);
  const [error, setError] = useState("");
  const [owner, setOwner] = useState("");
  const [profileRepos, setProfileRepos] = useState<ProfileRepository[]>([]);
  const [repository, setRepository] = useState<RepositoryResult | null>(null);
  const [files, setFiles] = useState<GgufFile[]>([]);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [sortMode, setSortMode] = useState<SortMode>("size-desc");
  const [favorites, setFavorites] = useState<Favorite[]>(loadFavorites);
  const [showFavorites, setShowFavorites] = useState(false);
  const [copied, setCopied] = useState("");
  const [manualPcProfile, setManualPcProfile] = useState<ManualPcProfile>(() => { try { const saved = localStorage.getItem(getPcProfileStorageKey()); return saved ? JSON.parse(saved) as ManualPcProfile : getDefaultManualPcProfile(); } catch { return getDefaultManualPcProfile(); } });
  const [showPcSettings, setShowPcSettings] = useState(false);
  const [taskFilter, setTaskFilter] = useState<ModelTask>("all");
  const [comparePaths, setComparePaths] = useState<string[]>([]);
  const [shareCopied, setShareCopied] = useState(false);
  const [profileSearch, setProfileSearch] = useState("");
  const [profileSortMode, setProfileSortMode] = useState<ProfileSortMode>("downloads");
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null);
  const t = copy[language];
  const extra = extraCopy[language];
  const taskLabels = modelTaskLabels[language];
  const filterLabels: Record<FilterMode, string> = { all: t.all, good: t.suitable, medium: t.conditional, bad: language === "ar" ? "ثقيل" : language === "fr" ? "Lourd" : "Heavy" };
  const profileListCopy = language === "ar"
    ? { search: "قلب بالاسم وسط الموديلات", sort: "ترتيب", downloads: "الأكثر تحميلاً", name: "الاسم", details: "تفاصيل", hide: "سد التفاصيل", model: "الموديل", parameters: "بارامتر", fit: "اقتراح الـPC" }
    : language === "fr"
      ? { search: "Rechercher un modèle", sort: "Trier", downloads: "Plus téléchargés", name: "Nom", details: "Détails", hide: "Masquer", model: "Modèle", parameters: "Paramètres", fit: "PC" }
      : { search: "Search models by name", sort: "Sort", downloads: "Most downloaded", name: "Name", details: "Details", hide: "Hide details", model: "Model", parameters: "Parameters", fit: "PC fit" };
  const suitability = repository ? getPcSuitability(detectParameterSize(repository.metadata.id), manualPcProfile.ramGb, language) : null;
  const repositoryTask = repository ? detectModelTask(repository.metadata.pipeline_tag, repository.metadata.tags, repository.metadata.id, Object.keys(repository.metadata.cardData ?? {})) : "other";

  useEffect(() => { document.documentElement.lang = language; document.documentElement.dir = t.dir; }, [language, t.dir]);
  const changeLanguage = (next: SiteLanguage) => { setLanguage(next); savePreferredLanguage(next); };

  const visibleProfileRepos = useMemo(() => {
    const normalizedSearch = profileSearch.trim().toLowerCase();
    const filtered = profileRepos.filter((repo) => (
      (filterMode === "all" || getPcSuitability(detectParameterSize(repo.id), manualPcProfile.ramGb, language).status === filterMode)
      && (taskFilter === "all" || detectModelTask(repo.pipeline_tag, repo.tags, repo.id) === taskFilter)
      && (!normalizedSearch || repo.id.toLowerCase().includes(normalizedSearch))
    ));
    return filtered.sort((a, b) => profileSortMode === "downloads"
      ? (b.downloads ?? 0) - (a.downloads ?? 0)
      : a.id.localeCompare(b.id));
  }, [profileRepos, filterMode, manualPcProfile.ramGb, language, taskFilter, profileSearch, profileSortMode]);
  const visibleFiles = useMemo(() => {
    const filtered = (!suitability || filterMode === "all" || suitability.status === filterMode) && (taskFilter === "all" || repositoryTask === taskFilter) ? [...files] : [];
    return filtered.sort((a, b) => {
      if (sortMode === "size-desc") return b.size - a.size;
      if (sortMode === "size-asc") return a.size - b.size;
      if (sortMode === "parameters") return Number.parseFloat(b.parameterSize) - Number.parseFloat(a.parameterSize);
      return a.quantization.localeCompare(b.quantization);
    });
  }, [files, filterMode, suitability, sortMode, taskFilter, repositoryTask]);

  const loadRepository = async (repoId: string, returnToProfile = false) => {
    setState("loading"); setError(""); setCanReturnToProfile(returnToProfile);
    try { const data = await findRepository(repoId); const ggufFiles = parseGgufFiles(data.files, (path) => buildFileUrl(repoId, path), repoId); setRepository(data); setFiles(ggufFiles); setView("repository"); setState("success"); }
    catch (caught) { setError(getFriendlyError(caught)); setState("error"); }
  };
  const search = async (event?: FormEvent) => {
    event?.preventDefault(); const input = repoInput.trim(); const repoId = validateRepoId(input);
    if (repoId) { await loadRepository(repoId); return; }
    const profile = validateOwner(input);
    if (!profile) { setError(t.invalid); setState("error"); return; }
    setState("loading"); setError(""); setCanReturnToProfile(false);
    try { const repos = await findProfileRepositories(profile); setOwner(profile); setProfileRepos(repos); setProfileSearch(""); setProfileSortMode("downloads"); setExpandedProfileId(null); setRepository(null); setFiles([]); setView("profile"); setState("success"); }
    catch (caught) { setError(getFriendlyError(caught)); setState("error"); }
  };
  const backToProfile = () => { setRepository(null); setFiles([]); setView("profile"); setState("success"); setCanReturnToProfile(false); };
  const toggleFavorite = (file: GgufFile) => {
    if (!repository) return;
    const favorite: Favorite = { ...file, repoId: repository.repoId };
    const exists = favorites.some((item) => favoriteKey(item) === favoriteKey(favorite));
    const next = exists ? favorites.filter((item) => favoriteKey(item) !== favoriteKey(favorite)) : [favorite, ...favorites];
    setFavorites(next); persistFavorites(next);
  };
  const isFavorite = (file: GgufFile) => repository ? favorites.some((item) => item.repoId === repository.repoId && item.path === file.path) : false;
  const copyText = async (value: string) => { try { await navigator.clipboard.writeText(value); setCopied(value); window.setTimeout(() => setCopied(""), 1600); } catch { setCopied(""); } };
  const savePcSettings = (event: FormEvent) => { event.preventDefault(); localStorage.setItem(getPcProfileStorageKey(), JSON.stringify(manualPcProfile)); setShowPcSettings(false); };
  const shareCurrent = async () => { const target = repository?.repoId ?? (owner || repoInput); const url = `${window.location.origin}${import.meta.env.BASE_URL}?repo=${encodeURIComponent(target)}&lang=${language}`; await copyText(url); setShareCopied(true); window.setTimeout(() => setShareCopied(false), 1600); };
  const toggleCompare = (path: string) => setComparePaths((current) => current.includes(path) ? current.filter((item) => item !== path) : current.length < 2 ? [...current, path] : [current[1], path]);

  return <div className="dark-app" dir={t.dir}>
    <header className="dark-header"><a className="dark-brand" href={import.meta.env.BASE_URL} aria-label="GGUF Finder"><span className="dark-logo">↓</span><span><strong>GGUF</strong> Finder</span></a><div className="dark-header-tools"><button className="dark-favorites-toggle" type="button" onClick={() => setShowFavorites((current) => !current)}><Heart size={14} fill={favorites.length ? "currentColor" : "none"} /> {t.favorites} {favorites.length ? `(${favorites.length})` : ""}</button><button className="dark-favorites-toggle" type="button" onClick={() => setShowPcSettings((current) => !current)}><Settings2 size={14} /> {extra.pc}</button><span className="dark-header-note">{t.header}</span><LanguageSwitcher language={language} onChange={changeLanguage} /></div></header>
    <main className="dark-main">
      <section className="dark-intro"><p className="dark-eyebrow">{t.eyebrow}</p><h1>{t.titleA}<br /><span>GGUF</span> {t.titleB}</h1><p>{t.intro}</p></section>
      <form className="dark-search" onSubmit={search}><label htmlFor="repo-input">{t.label}</label><div className="dark-input-row"><Search size={18} /><Input id="repo-input" value={repoInput} onChange={(event) => setRepoInput(event.target.value)} placeholder={t.placeholder} dir="ltr" /><button type="button" aria-label="Clear" onClick={() => setRepoInput("")}><X size={16} /></button></div><Button className="dark-search-button" type="submit" disabled={state === "loading"}>{state === "loading" ? <><Loader2 size={16} className="spin" /> {t.searching}</> : <><span>{t.search}</span><Search size={16} /></>}</Button><small>{t.ownerExample}: {EXAMPLE_OWNERS}</small></form>
      {showPcSettings && <form className="dark-pc-panel" onSubmit={savePcSettings}><div><strong>{extra.pc}</strong><small>{extra.manualNote}</small></div><label>{extra.ram}<select value={manualPcProfile.ramGb} onChange={(event) => setManualPcProfile((current) => ({ ...current, ramGb: Number(event.target.value) }))}><option value={4}>4GB</option><option value={8}>8GB</option><option value={16}>16GB</option><option value={32}>32GB</option><option value={64}>64GB+</option></select></label><label>{extra.gpu}<input value={manualPcProfile.gpu} onChange={(event) => setManualPcProfile((current) => ({ ...current, gpu: event.target.value }))} placeholder={extra.gpuPlaceholder} dir="ltr" /></label><button type="submit" className="dark-open-button">{extra.save}</button></form>}

      {showFavorites && <section className="dark-favorites-panel"><div className="dark-favorites-head"><h2>{t.favorites}</h2><button type="button" onClick={() => setShowFavorites(false)} aria-label="Close"><X size={16} /></button></div>{favorites.length === 0 ? <p>{t.noFavorites}</p> : <div>{favorites.map((item) => <article className="dark-favorite-row" key={favoriteKey(item)}><div><strong>{item.name}</strong><small>{item.repoId} · {item.quantization}</small></div><div><button type="button" onClick={() => void copyText(item.downloadUrl)}><Copy size={14} /></button><button type="button" onClick={() => { const next = favorites.filter((favorite) => favoriteKey(favorite) !== favoriteKey(item)); setFavorites(next); persistFavorites(next); }}><X size={14} /></button></div></article>)}</div>}</section>}

      {state === "idle" && <div className="dark-empty"><FileCode2 size={30} /><p>{t.idle}</p></div>}
      {state === "loading" && <div className="dark-message"><Loader2 size={28} className="spin" /><p>{t.loading}</p></div>}
      {state === "error" && <div className="dark-message dark-error"><X size={28} /><p>{error}</p><button onClick={() => void search()}>{t.retry}</button></div>}

      {state === "success" && view === "profile" && (
        <section className="dark-results">
          <div className="dark-result-head">
            <div><p className="dark-eyebrow">{t.profile}</p><h2>{owner}</h2><p>{t.profileCount(profileRepos.length)}</p></div>
            <a href={`https://huggingface.co/${encodeURIComponent(owner)}`} target="_blank" rel="noreferrer" className="dark-repo-link">{t.openProfile} <ExternalLink size={14} /></a>
          </div>
          <div className="dark-controls">
            <div className="dark-filter-group">
              <span>{t.filters}</span>
              {(["all", "good", "medium", "bad"] as FilterMode[]).map((item) => (
                <button type="button" key={item} className={`${filterMode === item ? "is-active " : ""}dark-filter-${item}`} onClick={() => setFilterMode(item)}>{filterLabels[item]}</button>
              ))}
            </div>
            <label className="dark-profile-search" aria-label={profileListCopy.search}><Search size={15} /><input value={profileSearch} onChange={(event) => setProfileSearch(event.target.value)} placeholder={profileListCopy.search} dir="ltr" /></label>
            <label className="dark-sort dark-profile-sort"><span>{profileListCopy.sort}</span><select value={profileSortMode} onChange={(event) => setProfileSortMode(event.target.value as ProfileSortMode)}><option value="downloads">{profileListCopy.downloads}</option><option value="name">{profileListCopy.name}</option></select></label>
          </div>
          {visibleProfileRepos.length === 0 ? (
            <div className="dark-message"><FolderSearch size={28} /><p>{filterMode === "all" ? t.noProfile : t.noFilterFiles}</p></div>
          ) : (
            <ul className="dark-profile-list" aria-label={`${owner} GGUF models`}>
              {visibleProfileRepos.map((repo) => {
                const genre = detectModelTask(repo.pipeline_tag, repo.tags, repo.id);
                const rowSuitability = getPcSuitability(detectParameterSize(repo.id), manualPcProfile.ramGb, language);
                return (
                  <li className="dark-profile-row" key={repo.id}>
                    <div className="dark-profile-row-info">
                      <div className="dark-card-badges"><span className="dark-genre-badge">{taskLabels[genre]}</span><span className={`dark-card-suitability dark-card-suitability--${rowSuitability.status}`}>{rowSuitability.label}</span></div>
                      <h3>{repo.id.split("/").slice(1).join("/")}</h3>
                      <p>{repo.downloads ? `${formatDownloads(repo.downloads)} ${t.downloads}` : ""}{repo.likes ? ` · ${formatDownloads(repo.likes)} ${t.likes}` : ""}</p>
                    </div>
                    <div className="dark-profile-row-actions">
                      <button className="dark-profile-details-toggle" type="button" aria-expanded={expandedProfileId === repo.id} onClick={() => setExpandedProfileId((current) => current === repo.id ? null : repo.id)}>{expandedProfileId === repo.id ? profileListCopy.hide : profileListCopy.details} <ChevronDown size={14} className={expandedProfileId === repo.id ? "is-open" : ""} /></button>
                      <button className="dark-open-button dark-profile-view-button" onClick={() => void loadRepository(repo.id, true)}>{t.viewFiles} <ArrowDownToLine size={15} /></button>
                    </div>
                    {expandedProfileId === repo.id && <div className="dark-profile-inline-details"><span><b>{profileListCopy.model}</b> {repo.id}</span><span><b>{profileListCopy.parameters}</b> {detectParameterSize(repo.id) || "—"}</span><span><b>{profileListCopy.fit}</b> {rowSuitability.message}</span></div>}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {state === "success" && view === "repository" && repository && <section className="dark-results"><div className="dark-result-head"><div>{canReturnToProfile && <button className="dark-back-results" type="button" onClick={backToProfile}><ArrowRight size={15} /> {t.back}</button>}<p className="dark-eyebrow">{t.repository}</p><h2>{repository.metadata.id.split("/").slice(1).join("/")}</h2><p>{t.files(files.length)}{detectParameterSize(repository.metadata.id) ? ` · ${detectParameterSize(repository.metadata.id)} ${t.parameters}` : ""}</p>{suitability && <div className={`dark-recommendation dark-recommendation--${suitability.status}`}><span>{suitability.label}</span><p>{t.pc} (RAM ≈ {manualPcProfile.ramGb}GB): {suitability.message}</p></div>}</div><div className="dark-result-actions"><button type="button" className="dark-repo-link dark-action-button" onClick={() => void shareCurrent()}><Share2 size={14} /> {shareCopied ? extra.linkCopied : extra.share}</button><a href={buildRepoUrl(repository.repoId)} target="_blank" rel="noreferrer" className="dark-repo-link">{t.openRepo} <ExternalLink size={14} /></a></div></div><div className="dark-controls"><div className="dark-filter-group"><span>{t.filters}</span>{(["all", "good", "medium"] as FilterMode[]).map((item) => <button type="button" key={item} className={filterMode === item ? "is-active" : ""} onClick={() => setFilterMode(item)}>{item === "all" ? t.all : item === "good" ? t.suitable : t.conditional}</button>)}</div><label className="dark-sort"><span>{extra.task}</span><select value={taskFilter} onChange={(event) => setTaskFilter(event.target.value as ModelTask)}>{(Object.keys(taskLabels) as ModelTask[]).map((item) => <option value={item} key={item}>{taskLabels[item]}</option>)}</select></label><label className="dark-sort"><span>{t.sort}</span><select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}><option value="size-desc">{t.sizeLarge}</option><option value="size-asc">{t.sizeSmall}</option><option value="parameters">{t.params}</option><option value="quantization">{t.quantization}</option></select></label></div>{files.length === 0 ? <div className="dark-message"><FileCode2 size={28} /><p>{t.noFiles}</p></div> : visibleFiles.length === 0 ? <div className="dark-message"><FolderSearch size={28} /><p>{t.noFilterFiles}</p></div> : <div className="dark-file-list">{visibleFiles.map((file) => { const saved = isFavorite(file); const command = `huggingface-cli download ${repository.repoId} ${file.path} --local-dir .`; return <article className="dark-file" key={file.path}><div className="dark-file-meta"><strong>{file.quantization}</strong><span title={file.name}>{file.name}</span><small>{file.parameterSize ? `${file.parameterSize} ${t.parameters} · ` : ""}{formatBytes(file.size)}</small></div><div className="dark-file-actions"><button type="button" className={comparePaths.includes(file.path) ? "is-selected" : ""} title={extra.compare} onClick={() => toggleCompare(file.path)}><GitCompareArrows size={16} /></button><button type="button" title={saved ? t.removeFavorite : t.addFavorite} className={saved ? "is-saved" : ""} onClick={() => toggleFavorite(file)}><Heart size={16} fill={saved ? "currentColor" : "none"} /></button><button type="button" title={t.copyLink} onClick={() => void copyText(file.downloadUrl)}><Copy size={16} /></button><button type="button" title={t.copyCommand} onClick={() => void copyText(command)}><Terminal size={16} /></button><a className="dark-download" href={file.downloadUrl} download={file.name} target="_blank" rel="noreferrer"><ArrowDownToLine size={16} /> {t.download}</a>{copied === file.downloadUrl || copied === command ? <small className="dark-copied">{t.copied}</small> : null}</div></article>; })}</div>}{comparePaths.length === 2 && <div className="dark-comparison"><div className="dark-comparison-head"><strong>{extra.comparison}</strong><button type="button" onClick={() => setComparePaths([])}>{extra.clear}</button></div><div className="dark-compare-grid">{comparePaths.map((path) => { const item = files.find((file) => file.path === path); return item ? <div key={item.path}><strong>{item.quantization}</strong><span>{item.name}</span><small>{formatBytes(item.size)} · {item.parameterSize || "—"} {t.parameters}</small></div> : null; })}</div></div>}</section>}
    </main>
    <footer className="dark-footer">{t.footer} · <a href={`${import.meta.env.BASE_URL}?page=privacy`}>{t.privacy}</a></footer>
  </div>;
}
