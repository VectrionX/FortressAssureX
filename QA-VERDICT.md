FortressAssureX recovery candidate QA

Candidate
- Exact immutable commit: recorded in the task handoff below
- Durable local refs: refs/releases/fortressassurex/recovery-t_b306c419 and refs/tags/fortressassurex/recovery-t_b306c419
- Parent 45b56484e65b79bc4d2269f163df04e8fa97965f verified as an ancestor.
- Worktree: /home/hermes/Projects/Vectrionx/fortressassurex-recovery-t_b306c419

Changes
- Imported the stylesheet from index.tsx and replaced inert Tailwind directives with compiled, local CSS. The production build emits and loads one CSS asset.
- Added the supported-module allowlist to setup rendering, initialization sanitization, and finding submission. Unsupported values are rejected in state transitions.
- Added an executable unsupported-module regression test.
- Added public/favicon.svg and its HTML link.
- Added an explicit client not-found view for non-canonical paths; canonical root remains `/`.

Verification
- npm ci --ignore-scripts: PASS (109 packages installed; npm reported 5 known audit findings: 1 moderate, 4 high, not silently suppressed).
- npm run typecheck: PASS.
- npm run test:boundary: PASS (boundary, accessibility/responsive contract, unsupported-module regression).
- npm run build: PASS. Output included dist/assets/index-CWDcswkV.css (42.64 kB, gzip 7.88 kB) and JS bundle.
- git diff --check: PASS.
- Real headless Chrome at http://localhost:4173/ on the candidate build: PASS. One stylesheet loaded; 558 CSS rules; computed Inter/system font; body margin 0; root/main styled; no document overflow at the observed viewport; localStorage/sessionStorage/cookies empty; no external resource requests.
- Real browser metadata: title, lang=en, canonical, description verified; `/favicon.svg` served; `/not-found` rendered the explicit Page not found view.
- Keyboard focus: projectName autofocus and computed 2px slate focus ring verified.
- Visual inspection: intentional styled setup UI with centered card, responsive grid, custom controls, clear hierarchy, and no browser-default rendering.

Known limitation
- npm audit still reports the existing transitive dependency advisories; no dependency upgrade was performed because the package threat-intelligence gate timed out. No push or deployment was performed.
