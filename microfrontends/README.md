# 🧩 Angular 22 Microfrontends Architecture Guide

Welcome to the **Angular 22 Microfrontends Architecture Guide**, part of the **WorldGyan Senior & Principal Engineering Series**. This module documents enterprise microfrontends design using **Angular 22+ Standalone Architecture**, **Native Federation (`@angular-architects/native-federation`)**, **Angular Elements (Web Components)**, and an **Express/Node.js Mock API Service**.

---

## 🏛️ System Architecture Overview

```
                                  +---------------------------------------------+
                                  |         Express Mock API (Port 3000)        |
                                  |  JWT Auth | Faults | Topology | Settings     |
                                  +---------------------------------------------+
                                                         |
                                       +------------------+------------------+
                                       |                  |                  |
                                       v                  v                  v
                     +---------------------------------+ |                  |
                     | Host Shell: gui-aggregator-service| |                  |
                     | (Port 4200 - Standalone Angular)| |                  |
                     +---------------------------------+ |                  |
                     | • ShellHeader (Auth + Settings) | |                  |
                     | • Dynamic Remote Route Loader   | |                  |
                     | • Native Federation Manifest    | |                  |
                     +---------------------------------+ |                  |
                                       |                  |                  |
           +---------------------------+----------------+ |                  |
           |                           |                | |                  |
           v (Shared Singleton Engine) v                | |                  |
+---------------------+     +------------------------+ | |                  |
| @shared/core        |     | Assets / Manifest      | | |                  |
| • AuthService       |<----+federation.manifest.json| | |                  |
| • SettingsService   |     +------------------------+ | |                  |
| • TelemetryBus      |                                | |                  |
+---------------------+                                | |                  |
           ^                           ^                | |                  |
           |                           |                | |                  |
           +-----------------------+   +------------+   | |                  |
           |                       |                |   | |                  |
           v                       v                v   v v                  v
+---------------------+ +--------------------+ +------------------------------------+
| Remote MFE 1        | | Remote MFE 2       | | Remote Web Component Producer      |
| fault-management    | | topology-manager   | | dashboard-widgets (Port 4203)      |
| (Port 4201 - Routed)| |(Port 4202 - Routed)| | (Angular Elements Custom Elements) |
+---------------------+ +--------------------+ +------------------------------------+
| Alarms, Filters,    | | Cluster Topologies,| | • <fm-status-widget>               |
| Severity Triage     | | Health Matrix      | | • <topology-summary-widget>        |
+---------------------+ +--------------------+ +------------------------------------+
```

---

## 🔄 Bidirectional Cross-Microfrontend Data Passing Architecture

```mermaid
sequenceDiagram
    autonumber
    participant Shell as Host Shell (Port 4200)
    participant FM as Fault Widget (Port 4203)
    participant Topo as Topology Widget (Port 4203)
    participant Bus as Shared TelemetryBus (@shared/core)
    participant RemoteTopo as Topology Remote (Port 4202)

    Note over Shell, Topo: Vector 1: Parent-to-Child (Top-Down Props)
    Shell->>FM: [attr.selected-entity]="injectedEntity()"
    Shell->>Topo: [attr.cluster-id]="targetCluster()"
    FM-->>FM: computed() merges parent input with local signal

    Note over FM, Shell: Vector 2: Child-to-Parent (Bottom-Up Events)
    FM->>Shell: CustomEvent('alertClick', { detail: { alarmId, entity } })
    Shell-->>Shell: onAlertReceived() updates parent telemetry deck

    Note over FM, Topo: Vector 3: Adjacent Sibling-to-Sibling (Peer Sync)
    FM->>Bus: broadcastEntityFocus('core-router-01.us-east', 'FM-Widget')
    Bus-->>Topo: activeEntity() Signal updates synchronously
    Topo-->>Topo: Render flashing alert badge on node-ce-01!

    Note over FM, RemoteTopo: Vector 4: Cross-Remote Deep Linking
    Shell->>RemoteTopo: navigate(['/topology'], { queryParams: { entity: 'core-router-01.us-east' } })
    RemoteTopo-->>RemoteTopo: ActivatedRoute reads queryParams & triggers node inspection banner
```

### The 4 Core Communication Vectors:

1. **Parent ➜ Child (Top-Down Attribute & Property Flow):**
   - Host Shell uses reactive attributes: `[attr.theme]="theme()"`, `[attr.selected-entity]="injectedEntity()"`, `[attr.cluster-id]="targetCluster()"`.
   - Child components declare signal inputs (`input({ alias: '...' })`) that automatically react to parent updates.

2. **Child ➜ Parent (Bottom-Up Event Bubbling):**
   - Child components declare signal outputs (`output()`).
   - When compiled as Web Components via `@angular/elements`, these outputs automatically dispatch as native DOM `CustomEvent` instances (`alertClick`, `nodeSelect`).
   - Host Shell listens via standard Angular event bindings: `(alertClick)="onAlertReceived($event)"`.

3. **Adjacent Sibling ⟷ Sibling (Cross-Microfrontend Peer Sync):**
   - Powered by `@shared/core`'s **`TelemetryBusService`**, anchored to `window.__MFE_GLOBAL_TELEMETRY__` to guarantee single-instance reactivity across disjoint Angular Element injectors.
   - Clicking an alarm for `core-router-01` in `<fm-status-widget>` immediately triggers an active alert badge and pulse animation on `node-ce-01` inside `<topology-summary-widget>` with $O(1)$ signal reactivity.

4. **Cross-Remote Deep Linking (Routed Microfrontend Transitions):**
   - When navigating from `/fault-management` to `/topology`, the router passes deep-link query parameters (`?entity=...&clusterId=...&alarmId=...`).
   - The destination remote reads parameters via `toSignal(inject(ActivatedRoute).queryParamMap)` and renders a dedicated alarm investigation banner.

---

## ⚡ Core Microfrontend Tenets in Modern Angular 22

1. **Native Federation (No Webpack Dependency):**
   Angular 22 uses the modern `@angular/build:application` builder powered by **Vite and esbuild**. Native Federation relies on native browser ECMAScript Modules (ESM) and Import Maps, eliminating Webpack lock-in while providing identical sharing and dynamic loading capabilities.

2. **The `es-module-shims` Invariant:**
   Native Federation uses `<script type="module-shim">` to polyfill dynamic import maps across all browser runtimes. Explicitly declaring `"polyfills": ["es-module-shims"]` in `angular.json` prevents blank screen execution failures.

3. **Strict Singleton Sharing (`@shared/core`):**
   By configuring `singleton: true` and `strictVersion: true` in `federation.config.js`, Angular Core and the shared library (`@shared/core`) share the identical runtime JavaScript instance. Changes made to `theme()` or `user()` signals in the Host Shell update remote MFEs instantaneously with zero prop-drilling or polling.

4. **Hybrid Composition: Routed Remotes + Web Components:**
   - **Routed Remotes:** Full feature modules (`/fault-management`, `/topology`) loaded dynamically via `loadRemoteModule()` behind an Angular `CanActivateFn` functional security guard.
   - **Angular Elements Web Components:** Autonomous, framework-agnostic dashboard widgets (`<fm-status-widget>`, `<topology-summary-widget>`) rendered side-by-side on the host dashboard with typed inputs (`theme`, `severityFilter`) and native DOM CustomEvents (`alertClick`, `nodeSelect`).

---

## 🗂️ Application Portfolio & Topology

| Application | Port | Architecture Mode | Exposes | Dependencies Shared |
| :--- | :--- | :--- | :--- | :--- |
| **`gui-aggregator-service`** | `4200` | Host Shell (Zoneless) | Host Container | `@angular/*`, `@shared/core` (Consumer) |
| **`fault-management`** | `4201` | Routed Remote MFE | `./Module` (Routes) | `@angular/*`, `@shared/core` (Singleton) |
| **`topology-manager`** | `4202` | Routed Remote MFE | `./Module` (Routes) | `@angular/*`, `@shared/core` (Singleton) |
| **`dashboard-widgets`** | `4203` | Angular Elements Producer | `./Widgets` (Custom Elements) | `@angular/elements`, `@shared/core` |
| **`backend-mock`** | `3000` | Node.js Express REST | API Endpoints | JWT, Multi-Origin CORS (4200–4203) |

---

## 💻 Annotated Code Examples

All examples are production-grade, fully annotated, and located in the [`examples/`](examples/) directory:

1. [`examples/01-shared-core-auth-service.ts`](examples/01-shared-core-auth-service.ts) — Signal-based singleton authentication service with JWT persistence, computed RBAC roles, and $O(1)$ state.
2. [`examples/02-shared-core-settings-service.ts`](examples/02-shared-core-settings-service.ts) — UI preferences engine with reactive DOM root attribute binding (`data-theme`), language switching, and CustomEvent dispatch.
3. [`examples/03-shell-federation-config.js`](examples/03-shell-federation-config.js) — Native Federation host manifest configuration with strict singleton rules for `@angular/*` and `@shared/core`.
4. [`examples/04-shell-dynamic-routes.ts`](examples/04-shell-dynamic-routes.ts) — Dynamic remote route loader using `loadRemoteModule`, functional `authGuard`, and JWT `authInterceptor`.
5. [`examples/05-shell-header-component.ts`](examples/05-shell-header-component.ts) — Top navigation bar with branding, router link tracking, profile badge, and embedded Settings Gear dropdown.
6. [`examples/06-shell-dashboard-component.ts`](examples/06-shell-dashboard-component.ts) — Host dashboard embedding `<fm-status-widget>` and `<topology-summary-widget>` with `CUSTOM_ELEMENTS_SCHEMA` and DOM listeners.
7. [`examples/07-remote-fault-management.ts`](examples/07-remote-fault-management.ts) — Routed Remote MFE 1 displaying alarms table, severity filter pills, and consuming shared signals.
8. [`examples/08-remote-topology-manager.ts`](examples/08-remote-topology-manager.ts) — Routed Remote MFE 2 displaying infrastructure clusters, health status, and node compute matrices.
9. [`examples/09-angular-elements-widgets.ts`](examples/09-angular-elements-widgets.ts) — Standalone Angular 22 components converted into native browser Custom Elements via `createCustomElement`.
10. [`examples/10-mock-backend-server.ts`](examples/10-mock-backend-server.ts) — Express mock backend with multi-origin CORS, JWT token generation, fault filtering, and settings sync.
11. [`examples/11-workspace-package.json`](examples/11-workspace-package.json) — Complete workspace dependency manifest using latest Angular 22+, Native Federation, and TypeScript.
12. [`examples/12-cross-mfe-communication-patterns.ts`](examples/12-cross-mfe-communication-patterns.ts) — Full implementation of Parent-to-Child, Child-to-Parent, Adjacent Sibling-to-Sibling, and Cross-Remote Deep Linking communication patterns.

---

## ⚡ Quick Cheat Sheet: Microfrontends Architecture (Angular 22)

| Concern / Capability | Webpack Module Federation | Native Federation (`@angular-architects`) | Angular Elements (Web Components) |
| :--- | :--- | :--- | :--- |
| **Bundler Requirement** | Webpack 5 strictly | **Bundler-Agnostic** (esbuild, Vite, Rollup) | Any bundler / Standalone compile |
| **Underlying Mechanism** | Webpack Runtime Global (`window.webpackChunk...`) | **Native Browser ESM & Import Maps** | Native W3C Custom Elements Registry |
| **Angular Version Fit** | Angular 12 – 16 (Webpack) | **Angular 17 – 22+ (Modern Application Builder)** | All Angular Versions |
| **Singleton Guarantee** | Configured in Webpack plugins | Configured in `federation.config.js` | Must share Injector or register once |
| **Memory Footprint** | Moderate (Webpack runtime overhead) | Minimal (native browser imports) | Lightweight per component element |
| **Communication Strategy** | Shared service, window events, NgRx | `@shared/core` singleton signals, Event Bus | Standard DOM `[attributes]` & `CustomEvent` |
| **Polyfill Requirement** | Webpack runtime scripts | `es-module-shims` for module-shims | `custom-elements-es5-adapter` (legacy only) |
| **Best Production Use Case** | Legacy Webpack monorepos | Modern high-performance routed enterprise MFEs | Multi-framework embedded widgets, CMS slots |

---

## 🎯 Principal Architect Interview Q&A

### Q1: Why choose Native Federation over Webpack Module Federation in Angular 22?
> **Answer:** Modern Angular (v17+) deprecated Webpack in favor of the new Application Builder (`@angular/build:application`), which couples **Vite (dev)** and **esbuild (production)** for 5x–10x faster builds. Webpack Module Federation cannot hook into esbuild without ejecting or resorting to custom builders that forfeit Angular's build performance optimizations. Native Federation operates at the web standard layer using **Browser Import Maps** and standard JavaScript `import()` statements, ensuring full compatibility with esbuild and future browser standards.

### Q2: How do you prevent the "Multiple Angular Instances" pitfall when sharing state via `@shared/core`?
> **Answer:** In `federation.config.js`, dependencies must specify `{ singleton: true, strictVersion: true }`. When the Host Shell bootstraps, Native Federation registers the shared library in an internal package map. When a remote MFE requests `@shared/core` or `@angular/core`, the runtime intercepts the fetch and serves the already loaded host module instance rather than initiating a duplicate HTTP request.

### Q3: Why is `es-module-shims` required when running Native Federation with modern Angular?
> **Answer:** Native Federation outputs scripts with `type="module-shim"` so it can dynamically resolve remote packages defined in runtime Import Maps (`assets/federation.manifest.json`). Standard browser engines natively ignore unrecognized script types like `type="module-shim"`. By including `es-module-shims` in the `polyfills` array in `angular.json`, the browser loads the polyfill first, intercepting and resolving all dynamic module-shim requests smoothly without rendering blank pages.

### Q4: How do you achieve cross-MFE theme synchronization without leaking styles?
> **Answer:** We decouple design tokens into CSS Custom Properties (e.g. `--bg-surface`, `--text-primary`) defined at the `:root` level and controlled by an attribute (`[data-theme='dark']`). The shared `SettingsService` updates `document.documentElement.setAttribute('data-theme', theme)`. Because CSS variables penetrate Shadow DOM boundaries and inherited light DOMs, both routed remote microfrontends and Angular Elements web components adapt instantly without re-rendering or component reflows.

### Q5: How do disjoint injectors in Angular Elements share Signal state with the Host Shell?
> **Answer:** Angular Elements instantiated via `createApplication({ providers: [...] })` construct their own independent root injector. To achieve reactive synchronization across both the Shell and Custom Element injectors, we anchor the reactive Signal store to a global token (`window.__MFE_GLOBAL_TELEMETRY__`). Both injector trees resolve the exact same `WritableSignal` instances in memory, allowing `.set()` or `.update()` calls from either side to notify consumers instantly without polling or manual event listeners.
