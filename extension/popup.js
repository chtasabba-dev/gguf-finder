/* Paper Console / extension controller: safe DOM rendering for the Manifest V3 popup. */
import { buildFileUrl, buildRepoUrl, findRepository, validateRepoId } from "./src/huggingface.js";
import { formatBytes, parseGgufFiles } from "./src/gguf.js";

const form = document.querySelector("#search-form");
const input = document.querySelector("#repo");
const clear = document.querySelector("#clear");
const status = document.querySelector("#status");
const results = document.querySelector("#results");

clear.addEventListener("click", () => { input.value = ""; input.focus(); });
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const repoId = validateRepoId(input.value);
  if (!repoId) { setStatus("Enter owner/repository format.", "error"); return; }
  setStatus("Reading repository…", "busy"); results.replaceChildren();
  try {
    const repository = await findRepository(repoId);
    const files = parseGgufFiles(repository.files, (path) => buildFileUrl(repoId, path));
    renderResults(repository, files); setStatus(files.length ? `${files.length} GGUF files found` : "No GGUF files found", files.length ? "success" : "error");
  } catch (error) { setStatus(error instanceof Error ? error.message : "Unexpected error. Try again.", "error"); renderMessage("Could not complete lookup."); }
});
function setStatus(message, type = "") { status.textContent = message; status.className = `status ${type}`; }
function renderMessage(message) { results.replaceChildren(); const p = document.createElement("p"); p.className = "message"; p.textContent = message; results.append(p); }
function renderResults(repository, files) {
  results.replaceChildren();
  const heading = document.createElement("div"); heading.className = "result-heading";
  const title = document.createElement("h2"); title.textContent = repository.metadata.id.split("/").slice(1).join("/");
  const open = document.createElement("a"); open.href = buildRepoUrl(repository.repoId); open.target = "_blank"; open.rel = "noreferrer"; open.textContent = "Open Hub ↗";
  heading.append(title, open); results.append(heading);
  if (!files.length) { renderMessage("This repository has no .gguf files."); return; }
  files.sort((a, b) => a.quantization.localeCompare(b.quantization));
  for (const file of files) {
    const row = document.createElement("article"); row.className = "file-row";
    const quant = document.createElement("strong"); quant.textContent = file.quantization;
    const name = document.createElement("span"); name.textContent = file.name; name.title = file.name;
    const size = document.createElement("small"); size.textContent = formatBytes(file.size);
    const download = document.createElement("a"); download.href = file.url; download.target = "_blank"; download.rel = "noreferrer"; download.textContent = "Download";
    row.append(quant, name, size, download); results.append(row);
  }
}
