# 🎓 Torres Capitol College SIS — Android APK & GitHub Release Guide

This repository contains the complete native Android packaging via **Capacitor 8** and automated **GitHub Actions CI/CD** workflows to build, sign, and publish ready-to-install Android APKs (`Torres-Capitol-College-SIS.apk`) directly to GitHub Releases.

---

## 🚀 1. How to Automatically Generate an APK GitHub Release

We have included `.github/workflows/build-and-release-apk.yml`. You can generate a release in three ways:

### Option A: Trigger with a Git Tag (Recommended)
Run these commands from your terminal:
```bash
git tag -a v1.0.3 -m "Release v1.0.3 with Torres Capitol College SIS Android APK"
git push origin v1.0.3
```
GitHub Actions will automatically:
1. Compile the web bundle (`npm run build`).
2. Sync the Capacitor Android bridge (`npx cap sync android`).
3. Set up Java 21 and Android SDK 36.
4. Run `./gradlew assembleRelease` to compile `Torres-Capitol-College-SIS.apk`.
5. Compute SHA256 checksums.
6. Create a GitHub Release for `v1.0.3` and attach `Torres-Capitol-College-SIS.apk` for direct public download!

---

### Option B: 1-Click Manual Build via GitHub Actions Web UI
1. Navigate to your repository on GitHub.
2. Click the **Actions** tab at the top.
3. In the left workflow list, select **Build & Release Android APK**.
4. Click **Run workflow** dropdown on the right:
   - Select branch: `main`
   - Build Type: `release` (or `debug`)
   - Optional Tag: e.g. `v1.0.3`
5. Click the green **Run workflow** button.
6. A `debug` run uploads an installable test APK as a workflow artifact. A `release` run also publishes a GitHub Release.

---

### Option C: Build Locally on Your Machine
If you have Java JDK 21 and Android SDK 36 installed:
```bash
# 1. Install dependencies and compile web assets
npm install
npm run build:apk

# 2. Build a debug APK locally using Gradle
cd android
bash gradlew assembleDebug

# The generated APK will be located at:
# android/app/build/outputs/apk/debug/Torres-Capitol-College-SIS-debug.apk
```

---

## 📱 2. How to Manually Install (Sideload) the APK on Android

Direct installation on Android requires no root or developer mode:

1. **Download the APK**:
   - On your Android device, open the GitHub Release page or scan the QR code from the in-app **Download APK** button.
   - Tap **`Torres-Capitol-College-SIS.apk`**.
2. **Accept Download Prompt**:
   - Android will prompt: *“File might be harmful. Do you want to download Torres-Capitol-College-SIS.apk anyway?”*
   - Tap **Download anyway**.
3. **Open & Allow Installation**:
   - When the download completes, tap **Open**.
   - If prompted: *“For your security, your phone is not allowed to install unknown apps from this source”*:
     1. Tap **Settings**.
     2. Toggle **Allow from this source** ON.
     3. Tap Back.
4. **Install & Launch**:
   - Tap **Install**.
   - Tap **Open** to launch **Torres Capitol College SIS**!

---

## ⚙️ 3. Android Package Configuration

| Parameter | Value |
|---|---|
| **App Name** | Torres Capitol College SIS |
| **Package ID / App ID** | `edu.torrescapitolcollege.sis` |
| **Minimum SDK** | Android 7.0 (API level 24) |
| **Target SDK** | Android 16 (API level 36) |
| **Supported Architectures** | Universal (`arm64-v8a`, `armeabi-v7a`, `x86_64`) |
| **Hardware Permissions** | Camera (QR code student identification), Network State |
| **Offline Support** | Local app-state cache with automatic Neon sync when connected |

### Shared Vercel and APK Data

- Add Neon’s pooled connection string to Vercel as the server-side `DATABASE_URL_POOLED` environment variable (or use `DATABASE_URL`). Do not expose it as a `VITE_` variable or put it in the APK.
- The web app and APK use the same Vercel API. The Android build points to `https://tccstudentinfocapstone.vercel.app` and syncs app data approximately every three seconds.
- To test against the same database locally, install the Vercel CLI, run `vercel env pull .env.local`, then run `npm run dev`. `.env.local` is ignored by Git.
- Build the APK web assets with `npm run build:apk`, then build the Android package with `cd android && ./gradlew assembleDebug`.

The shared state API is currently intended for capstone demo data and does not authenticate API writes by account. Do not enter real student records until server-side user authentication and authorization are added.

---

## 🛡️ 4. Production Keystore Signing (Optional)

Without a release keystore, the workflow falls back to a debug signature. That APK can be installed for testing, but later builds signed with a different key cannot update it in place. Configure a stable keystore before distributing updates.

To sign with your own official college production keystore:
1. Generate your release keystore:
   ```bash
   keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias tcc-key
   ```
2. In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions**.
3. Add the following repository secrets:
   - `RELEASE_STORE_FILE_B64`: Base64 string of your keystore file
   - `RELEASE_STORE_PASSWORD`: Keystore password
   - `RELEASE_KEY_ALIAS`: `tcc-key`
   - `RELEASE_KEY_PASSWORD`: Key password
