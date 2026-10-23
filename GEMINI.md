# AI Instructions & Operational Guidelines for angular-interview-worldgyan.com

## 🔄 Self-Maintaining Instructions Protocol
Whenever the user provides new rules, project constraints, architectural preferences, or workflow guidelines in any prompt:
- **Proactive Maintenance:** Immediately update and maintain this `GEMINI.md` file (alongside `worldgyan1/GEMINI.md` and root `GEMINI.md`) to record and preserve the new instructions.
- **Continuous Alignment:** Ensure all future responses and code generation adhere strictly to these stored directives without requiring the user to repeat themselves.

---

## 🎯 Continuous Synchronization with worldgyan1 (Angular-Only Scope)

- **Dedicated Angular Focus:** This repository serves as the definitive open-source companion study guide and interview handbook for Angular architectures, courses, and tutorials published on `worldgyan1` (worldgyan.com).
- **Dual-Repo Sync Invariant:**
  - Whenever Angular articles, courses, or technical guides are added or updated in `worldgyan1` (e.g. Angular Architecture, Signals, HTTP Interceptors, Zoneless, Forms, Performance, Hydration), this repository must be kept 100% in sync.
  - Maintain the modular directory layout (`<topic>/README.md`, `<topic>/<guide>.md`, `<topic>/examples/*.ts`).
  - Always keep the root `README.md` roadmap and navigation up to date.
  - Automatically commit and push all updates to `origin main` at both repositories.
- **Non-Angular Exemption:** Content unrelated to Angular (e.g. non-Angular topics, site layout, finance, Python) must remain exclusive to `worldgyan1` and should NOT be mirrored here.

---

## 🎬 macOS Shorts Studio & 4K Animation Invariants (Typography & Exporter)
- Every animation HTML file in `animations/` must have an explicit mapping in `export-4k.js` with zero fallbacks to `"computed"`.
- Typography standards: Min `24px`–`26px` bold headers, min `16px`–`18px` bold card titles, min `14px` code blocks, min `13px` descriptions.
- Synchronize all standalone animations and `export-4k.js` with `worldgyan1/public/animations/`.
