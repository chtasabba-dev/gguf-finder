# Redesign tasks

- [x] Switch the web app to a dark visual theme.
- [x] Translate the visible web-app copy into Arabic and set RTL layout.
- [x] Remove or hide non-essential features such as history, RAM recommendations, sorting, filtering, copy-link controls, and extra contextual sections.
- [x] Keep only repository input, search, GGUF filename/size/quantization, and direct download/repository actions.
- [x] Simplify the extension popup copy and layout to match the Arabic dark direction where practical.
- [x] Verify the revised interface and save a new checkpoint.
- [x] Detect model parameter sizes such as 2B, 20B, and 20T from repository/file names.
- [x] Display the detected parameter size simply in the Arabic result header and file rows where available.
- [x] Verify parameter-size parsing and save a new checkpoint.
- [x] Inspect the current PC memory and define a conservative recommendation rule.
- [x] Add a simple “مناسب للـPC ديالك” recommendation using available RAM and model size.
- [x] Verify the recommendation and save a new checkpoint.

## GitHub publishing

- [x] Audit tracked files for secrets and personal data.
- [x] Prepare GitHub Pages-compatible deployment configuration.
- [x] Create the public `gguf-finder` repository and push the project.
- [x] Configure GitHub Pages and verify the public URL.

## Pages link follow-up

- [x] Inspect the latest workflow run and repository Pages status.
- [x] Resolve any remaining workflow or Pages permission issue.
- [x] Verify the deployed URL or give the exact final manual step.

## Flexible Hugging Face input

- [x] Accept repository URLs, `owner/repository`, and owner/profile names.
- [x] For a profile name, list repositories and identify those with GGUF files.
- [x] Keep the UI simple: show repositories first, then GGUF files after selection.
- [x] Verify both input modes and redeploy GitHub Pages.

## Profile card grid

- [ ] Replace the profile repository list with square-style cards on desktop.
- [ ] Keep cards responsive as a single-column stack on small screens.
- [ ] Verify the card grid and redeploy GitHub Pages.
