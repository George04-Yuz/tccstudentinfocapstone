# Vercel Deployment & Android/iOS PWA Installability Integration

Enable seamless Vercel deployment and PWA installability (for Android & iOS mobile APK / home screen installation) without modifying existing project codes or business logic.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Vercel Integration**: Configure `vite-plugin-vercel` in `vite.config.ts` and add `vercel.json` for correct routing and serverless output.
> - **PWA & Mobile Installability**: Install `vite-plugin-pwa`, configure `VitePWA` manifest in `vite.config.ts`, add icons (`public/icon.svg`, `public/apple-touch-icon.png`), and add an in-app `PWAInstallButton` component.

- **Confirmed Decision 1**: PWA web app installable on Android & iOS.
- **Confirmed Decision 2**: Standard Vite build output with Vercel configuration (`vercel.json`).

---

## 1. Overview & Core Concept

- **What It Does**: Adds production configuration for Vercel hosting/deployment and sets up Progressive Web App (PWA) manifests and service workers so users can install the application on Android and iOS devices directly from the browser.
- **Key Value**: One-click Vercel deployment readiness and native-like mobile app installation.

## 2. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                      Vite Build                        │
│  (React 19 + Tailwind v4 + Lucide + Vite-Plugin-PWA)   │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       [Vercel Deployment]       [PWA Mobile Install]
       - vercel.json             - manifest.json (Web App)
       - vite-plugin-vercel      - Service Worker Caching
                                 - PWA Install Button UI
```

- **Dependencies to Install**: `vite-plugin-pwa`.
- **Configuration Updates**:
  1. Update `vite.config.ts` to include `VitePWA` plugin and `vercel()` plugin.
  2. Create `vercel.json` for deployment routing.
  3. Ensure icons exist in `public/` (or generate/reference them).
  4. Add `PWAInstallButton` in the application header/sidebar.
