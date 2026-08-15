# GGUF Finder — Design Direction

## Three stylistic approaches

### Theme Name: Paper Console
Very light editorial utility design with graphite typography, warm paper surfaces, and a single chartreuse signal color. It feels calm, technical, and trustworthy rather than like a generic developer dashboard.

**Probability:** 0.07

### Theme Name: Archive Terminal
A restrained dark interface inspired by archival terminals and file manifests, using muted phosphor green and cream typography with dense but readable data rows.

**Probability:** 0.03

### Theme Name: Swiss Download Desk
A precise modernist information system with strong horizontal rules, asymmetric columns, bold typographic labels, and a blue-red industrial accent pair.

**Probability:** 0.08

## Selected approach: Paper Console

### Design Movement
Contemporary editorial modernism with references to Swiss information design, printed technical manuals, and quiet utility software.

### Core Principles
1. **Scan before you read:** the repository state, count, file size, and quantization must be legible at a glance.
2. **Signal over decoration:** chartreuse is reserved for actions, success, and selected state; the rest stays quiet.
3. **Utility has warmth:** paper grain, soft shadows, and small index marks make the tool feel crafted without slowing it down.
4. **Honest affordances:** recommendations and limitations are labeled plainly; no invented certainty or fake social proof.

### Color Philosophy
Warm bone backgrounds reduce glare and make dense technical data easier to parse. Ink-black graphite provides strong reading contrast, while muted sage separates metadata from primary actions. The ownable accent is **Signal Chartreuse** (#C7F36B): a high-visibility operational color used only for search, download, status dots, and focus states so the interface feels instrument-like.

### Layout Paradigm
A left-anchored, asymmetric workbench rather than a centered landing-page stack. The search rail is narrow and persistent, while the result surface grows into a wide manifest. On small screens the rail collapses into a single top strip, preserving the same information order without horizontal scrolling.

### Signature Elements
- **Index ticks:** tiny chartreuse rules and numbered labels act like printed archive markers.
- **Manifest rows:** file results use strong horizontal separators and a compact quantization column, echoing a technical inventory sheet.
- **Paper grain:** a barely-visible texture and offset shadow system create depth without cards everywhere.

### Interaction Philosophy
Interactions should feel like operating a well-made instrument: immediate, reversible, and clear. Search submits on Enter, focused controls show a chartreuse keyline, copy actions give a compact confirmation, and sorting/filtering updates the manifest without visual theatrics.

### Animation
Use 160–220ms ease-out transitions for controls and result rows. On a successful search, the repository summary appears first, followed by rows staggered by 35ms. Hover states shift the row surface and reveal the primary download action; no continuous motion, parallax, or decorative loaders. Respect `prefers-reduced-motion` and replace staggered entrances with instant rendering.

### Typography System
Use **Space Grotesk** for headlines, labels, and quantization markers because its geometric forms feel technical and distinctive. Use **IBM Plex Sans** for body copy, metadata, and controls because it remains highly legible at compact sizes. H1 is 48–64px with tight tracking on desktop and 36px on mobile; section labels are 11px uppercase with generous letter spacing; file names are 15–16px medium weight; helper copy is 13–14px.

### Brand Essence
A calm, browser-native finder for people who need the right GGUF file quickly, without a backend or account. **Practical, exact, approachable.**

### Brand Voice
Headlines are direct and lightly editorial. CTAs use verbs that describe the exact action. Microcopy is honest about network limits, approximate recommendations, and repository access.

Example lines:
- “The fastest path from repository to runnable file.”
- “Public repositories work without a token.”

### Wordmark & Logo
The mark is a compact geometric file shard with a cut-through download arrow and three small neural nodes, rendered as a bold symbol without text. The wordmark pairs a custom-spaced “GGUF” label with a smaller “FINDER” utility label; it should never be rendered as an unmodified default font lockup.

### Signature Brand Color
**Signal Chartreuse — #C7F36B.** It marks the moment an action is available or a result is confirmed, making the brand recognizable without overwhelming the workbench.

## Implementation reminders

- Every CSS/component/page file begins with a short comment naming the Paper Console direction and the file’s role.
- The app remains client-only and uses official Hugging Face endpoints from a small isolated API module.
- External metadata is always rendered through safe React text nodes, never raw HTML.
- The extension shell shares the same core parsing, API, and UI modules while keeping Manifest V3 permissions minimal.
