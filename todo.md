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

- [x] Replace the profile repository list with square-style cards on desktop.
- [x] Keep cards responsive as a single-column stack on small screens.
- [x] Verify the card grid and redeploy GitHub Pages.

## Privacy Policy and ads readiness

- [x] Review the app's actual data flows and document only what it does today.
- [x] Add an Arabic Privacy Policy page with placeholders for owner/contact/date.
- [x] Link the policy from the footer and verify its route.
- [x] Redeploy GitHub Pages and confirm the policy URL.

## Three-color PC recommendation

- [x] Define suitable, conditional, and unsuitable model thresholds.
- [x] Show the PC recommendation in green, yellow, or red with a readable label.
- [x] Verify the visual states and redeploy GitHub Pages.

## Languages and return navigation

- [x] Add AR, FR, and EN interface language controls.
- [x] Apply RTL only for Arabic and preserve the dark visual system in all languages.
- [x] Add a return button from repository files to the prior profile results.
- [x] Verify language switching and return navigation, then redeploy GitHub Pages.

## Lightweight GGUF productivity features

- [x] Add a PC-suitability filter for good, conditional, and all model results.
- [x] Add sorting by recommendation, model parameters, file size, and quantization.
- [x] Add safe copy buttons for direct file URLs and terminal download commands.
- [x] Add local browser favorites without accounts or a backend.
- [x] Verify the complete feature set and redeploy GitHub Pages.

## Contact and signature cleanup

- [x] Replace the Privacy Policy email placeholder with chtasaba@gmail.com.
- [x] Audit and remove any creator or platform signature from public-facing copy.
- [x] Verify the contact information and redeploy GitHub Pages.

## Model discovery enhancements

- [x] Add manual RAM and GPU profile controls.
- [x] Add a shareable link containing repository and language state.
- [x] Add comparison for two selected quantizations.
- [x] Add clear Hugging Face task filters for coder, text, TTS, vision, chat, and other relevant model types.
- [x] Restore the user's privacy email and remove any creator signature if needed after rollback.
- [x] Verify all enhancements and redeploy GitHub Pages.

## Model card recommendation presentation

- [x] Show the detected genre directly on every profile model card.
- [x] Show a green, yellow, or red PC suitability badge directly on every profile model card.
- [x] Remove the redundant manual model-type selector from profile results.
- [x] Verify the updated cards and redeploy GitHub Pages.

## Clear status colors and card comfort

- [x] Apply clear green, yellow, and red suitability colors across the site.
- [x] Improve model-card spacing, contrast, and scanning comfort.
- [x] Verify the refined visual system and redeploy GitHub Pages.

## Clear profile list view

- [x] Replace profile model cards with a larger, easier-to-scan list.
- [x] Keep the View Files action permanently visible on each model row.
- [x] Verify the list view and redeploy GitHub Pages.

## Compact profile rows

- [x] Reduce profile-result row height and horizontal visual weight.
- [x] Keep model details and View Files action readable in a compact row.
- [x] Verify the compact list and redeploy GitHub Pages.

## Plain profile list

- [ ] Remove the remaining card background, shadow, and rounded treatment from profile results.
- [ ] Present every profile model as a simple separated list row with a View Files action.
- [ ] Verify the plain list and redeploy GitHub Pages.
