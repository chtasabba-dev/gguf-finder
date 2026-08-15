# GGUF Finder

GGUF Finder is a client-only utility for finding `.gguf` model files in public [Hugging Face](https://huggingface.co/) model repositories. It keeps the normal flow free of API keys, backend services, databases, and Node.js requirements at runtime, while exposing the same core architecture for a future Chrome/Chromium extension.

## Included

The managed web app lives in `client/` and is a responsive React interface with repository validation, official Hugging Face metadata and recursive tree requests, `.gguf`-only filtering, quantization detection, size and quantization sorting, in-file search, recent repository history, direct download links, copy-link controls, model-card links, and approximate RAM recommendations.

The ready-to-load Manifest V3 extension lives in `extension/`. It uses only `https://huggingface.co/*` host permission plus `storage`, has no inline executable scripts, no `eval`, no remote JavaScript, and no backend requirement.

## Architecture

```text
client/src/
  lib/
    huggingface.ts   Official Hub API client, validation, caching, URL generation
    gguf.ts          Pure GGUF filtering, quantization detection, formatting
  pages/
    Home.tsx         UI state, accessible workbench, results and error states
  index.css          Paper Console design system and responsive layout

extension/
  manifest.json
  popup.html
  popup.js
  styles.css
  src/
    huggingface.js
    gguf.js
```

All Hugging Face communication is isolated in the API layer. The app uses the documented model metadata endpoint and the official model tree endpoint:

```text
GET https://huggingface.co/api/models/{owner}/{repo}?expand[]=cardData&expand[]=siblings
GET https://huggingface.co/api/models/{owner}/{repo}/tree/main?recursive=true&expand=true
```

Direct links are generated from the repository ID and actual file path using the Hugging Face `resolve/main/{path}` pattern. Each path segment is encoded independently so nested folders, spaces, and special characters remain safe.

## Run locally

Install dependencies and start the static development server from the project root:

```bash
pnpm install
pnpm dev
```

The production build is created with:

```bash
pnpm build
```

The managed preview is the recommended standalone local web-app workflow because the Vite shell serves the static application and provides the normal browser API context for `fetch`, `localStorage`, and `sessionStorage`.

## Load the extension

1. Open `chrome://extensions` or the equivalent Chromium extensions page.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select the `extension/` directory.
5. Open the GGUF Finder popup and enter a public `owner/repository` ID.

Public repository searches do not require a Hugging Face token. Optional authentication is intentionally not exposed in this initial version; the API boundary is ready for a future secure extension storage flow.

## Expected behavior

The app distinguishes idle, searching, success, no-GGUF, repository-not-found, authentication-required, rate-limited, network, and unexpected-error states. It never renders raw repository metadata as HTML. File names and model metadata are rendered through safe React text nodes, and all external links are constrained to the Hugging Face origin or generated from it.

The RAM panel is explicitly labeled **Approximate recommendation**. It does not claim that a model will definitely run based on RAM alone; context size, runtime, operating system, and GPU also affect requirements.

## Validation performed

The live public repository `bartowski/Qwen2.5-Coder-7B-Instruct-GGUF` was searched successfully. The app retrieved repository metadata and a 27-entry tree, filtered 24 `.gguf` files, detected quantizations including F16, IQ, Q2, Q3, Q4, Q5, Q6, and Q8 variants, displayed sizes from the real API data, and produced direct Hugging Face resolve links. The app also supports malformed input and friendly API/network error states through the isolated client layer.

## Official references

- [Hugging Face Hub API reference](https://huggingface.co/docs/huggingface_hub/en/package_reference/hf_api)
- [Download files from the Hub](https://huggingface.co/docs/huggingface_hub/en/guides/download)
- [Hugging Face file download reference](https://huggingface.co/docs/huggingface_hub/en/package_reference/file_download)
- [Chrome Manifest V3](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)

## GitHub Pages

The repository includes `.github/workflows/deploy-pages.yml` and is configured to build the app under the `/gguf-finder/` repository path. After the first push, open **Settings → Pages** in the GitHub repository and choose **GitHub Actions** as the source. The workflow will then publish the site at `https://chtasabba-dev.github.io/gguf-finder/` after a successful run.

The project does not depend on Manus-hosted images for this deployment path; the favicon is stored locally and the current dark Arabic interface uses CSS-only visual styling.
