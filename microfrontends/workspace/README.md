# 🚀 Angular 22 Enterprise Microfrontends Workspace

This workspace contains the complete production-grade source code for the 5-tier microfrontend architecture:

- **`backend-mock/`** (Port 3000): Node.js / Express JWT Mock API service.
- **`projects/shared-core/`**: Shared singleton library containing `AuthService` and `SettingsService`.
- **`apps/gui-aggregator-service/`** (Port 4200): Host Shell with Header, Settings, and dynamic remote router.
- **`apps/fault-management/`** (Port 4201): Routed Remote MFE 1.
- **`apps/topology-manager/`** (Port 4202): Routed Remote MFE 2.
- **`apps/dashboard-widgets/`** (Port 4203): Web Components Remote built with `@angular/elements`.

## Quick Start
```bash
# 1. Install root dependencies
npm install

# 2. Run all microfrontends and backend concurrently
npm run start:all
```
