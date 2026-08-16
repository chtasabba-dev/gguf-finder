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

- [x] Remove the remaining card background, shadow, and rounded treatment from profile results.
- [x] Present every profile model as a simple separated list row with a View Files action.
- [x] Verify the plain list and redeploy GitHub Pages.

## Semantic list and complete color filters

- [x] Replace profile-result container and entries with semantic list markup.
- [x] Add an explicit red suitability filter alongside green, yellow, and all.
- [x] Style the recommendation filters with their corresponding status colors.
- [x] Verify list filtering and redeploy GitHub Pages.

## Profile list controls

- [x] Add a search field for model names within owner results.
- [x] Add download-count ordering for owner results.
- [x] Add an inline details toggle to each model row.
- [x] Verify all profile-list controls and redeploy GitHub Pages.

## Neutral initial search

- [x] Start the repository search field empty instead of prefilled with a model repository.
- [x] Show neutral Google, NVIDIA, DeepSeek, and Qwen example hints.
- [x] Push the change and verify GitHub Actions publishes it to GitHub Pages.

## Desktop readability

- [x] Widen the main desktop layout and profile list area.
- [x] Increase reading-size typography for controls, labels, results, and actions.
- [x] Verify desktop readability and redeploy GitHub Pages.

## Restricted model guidance

- [x] Detect Hugging Face gated or restricted model errors.
- [x] Show a clear Request Access explanation and official model-page action.
- [x] Verify the error experience and redeploy GitHub Pages.

## List feedback and restricted badges

- [ ] Show an in-context loading state when opening a model’s file details.
- [ ] Display a Restricted badge for gated models in profile results.
- [ ] Verify the new feedback and badge behavior, then redeploy GitHub Pages.
