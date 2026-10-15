# 🎓 Torres Capitol College SIS — Android APK & GitHub Release Guide

This repository contains the complete native Android packaging via **Capacitor 6** and automated **GitHub Actions CI/CD** workflows to build, sign, and publish ready-to-install Android APKs (`Torres-Capitol-College-SIS.apk`) directly to GitHub Releases.

---

## 🚀 1. How to Automatically Generate an APK GitHub Release

We have included `.github/workflows/build-and-release-apk.yml`. You can generate a release in three ways:

### Option A: Trigger with a Git Tag (Recommended)
Run these commands from your terminal:
```bash
git tag -a v1.0.0 -m "Release v1.0.0 with Torres Capitol College SIS Android APK"
git push origin v1.0.0
```
GitHub Actions will automatically:
1. Compile the web bundle (`npm run build`).
2. Sync the Capacitor Android bridge (`npx cap sync android`).
3. Set up Java 17 and Android SDK.
4. Run `./gradlew assembleRelease` to compile `Torres-Capitol-College-SIS.apk`.
5. Compute SHA256 checksums.
6. Create a GitHub Release for `v1.0.0` and attach `Torres-Capitol-College-SIS.apk` for direct public download!

---

### Option B: 1-Click Manual Build via GitHub Actions Web UI
1. Navigate to your repository on GitHub.
2. Click the **Actions** tab at the top.
3. In the left workflow list, select **Build & Release Android APK**.
4. Click **Run workflow** dropdown on the right:
   - Select branch: `main`
   - Build Type: `release` (or `debug`)
   - Optional Tag: e.g. `v1.0.0`
5. Click the green **Run workflow** button.
6. Once complete (~2 minutes), download the APK directly from the **Artifacts** section or visit your repository's **Releases** tab!

---

### Option C: Build Locally on Your Machine
If you have Java JDK 17+ and the Android SDK installed:
```bash
# 1. Install dependencies and compile web assets
npm install
npm run build:apk

# 2. Build the APK using Gradle
cd android
./gradlew assembleRelease

# The generated APK will be located at:
# android/app/build/outputs/apk/release/Torres-Capitol-College-SIS-release.apk
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
| **Target SDK** | Android 14+ (API level 34) |
| **Supported Architectures** | Universal (`arm64-v8a`, `armeabi-v7a`, `x86_64`) |
| **Hardware Permissions** | Camera (QR code student identification), Network State |
| **Offline Support** | Local gradebook & timetable caching enabled |

---

## 🛡️ 4. Production Keystore Signing (Optional)

By default, the workflow uses a standard signing configuration so the APK can be immediately installed and tested on any Android device without configuring secrets.

To sign with your own official college production keystore:
1. Generate your release keystore:
   ```bash
   keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias tcc-key
   ```
2. In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions**.
3. Add the following repository secrets:
   - `RELEASE_STORE_FILE`: Base64 string of your keystore file
   - `RELEASE_STORE_PASSWORD`: Keystore password
   - `RELEASE_KEY_ALIAS`: `tcc-key`
   - `RELEASE_KEY_PASSWORD`: Key password
