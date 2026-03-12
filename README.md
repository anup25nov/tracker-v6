# SSC Exam Sathi

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

**Use your preferred IDE**

Clone this repo and push changes. Pushed changes will also be reflected in Lovable.

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

## Technologies

- Vite, TypeScript, React, shadcn-ui, Tailwind CSS, Firebase, Capacitor

## Social links

- Telegram: `https://t.me/warriorsiq`
- YouTube: `https://youtube.com/@mishra_maths`
- Instagram: `https://www.instagram.com/anupmishra_8`

---

## Environment Setup (Dev / Prod)

The app supports **two separate Firebase environments** to keep development isolated from production.

### Configuration Files

| File | Purpose |
|------|---------|
| `.env.development` | Dev Firebase credentials (used with `npm run dev` and `--mode development`) |
| `.env.production` | Prod Firebase credentials (used with `npm run build`) |
| `src/lib/env.ts` | Environment resolver — picks config based on Vite mode |

### Setting Up a Dev Firebase Project

1. Create a **new Firebase project** at https://console.firebase.google.com
2. Enable **Google Sign-In** under Authentication → Sign-in method
3. Add your **Android app** with package name `com.sscexamsathi.app`
4. Add your **debug SHA-1** fingerprint
5. Download `google-services.json` and save as `android/app/google-services.json`
6. Fill in `.env.development` with your dev Firebase credentials

### Switching `google-services.json` for Dev/Prod

```bash
# For dev builds
cp google-services-dev.json android/app/google-services.json

# For prod builds
cp google-services-prod.json android/app/google-services.json
```

---

## Build Commands

### Web Builds

```bash
npm run dev          # Development server (hot reload)
npm run build        # Production web build
npm run build:dev    # Dev mode web build
```

### Android Debug APK (local testing)

```bash
# Step 1: Build web assets
npm run build

# Step 2: Sync to Android
npx cap sync android

# Step 3: Build debug APK
cd android && ./gradlew assembleDebug

# Step 4: Install on device
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### Dev Debug APK

```bash
npm run build:dev
npx cap sync android
cd android && ./gradlew assembleDebug
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Signed AAB (Play Store)

```bash
npm run build:aab
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Dev AAB (internal testing track)

```bash
npm run build:dev
npx cap sync android
cd android && ./gradlew bundleRelease
```

---

## Google Sign-In: SHA-1 Fingerprints

Google Sign-In requires SHA-1 fingerprints registered in Firebase Console.

| Environment | How to get SHA-1 |
|-------------|-----------------|
| **Debug** | `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android` |
| **Release (local)** | `keytool -list -v -keystore android/sscexamsathi-upload.keystore` |
| **Play Store** | Google Play Console → Setup → App Signing → SHA-1 under "App signing key certificate" |

**Add ALL relevant SHA-1 fingerprints** to Firebase Console → Project Settings → Your Android app → Add fingerprint.

---

## Auth Error Logging

Every authentication error is automatically logged to Firestore collection `auth_error_logs` with:

| Field | Description |
|-------|-------------|
| `error_message` | Human-readable error description |
| `error_code` | Firebase/plugin error code |
| `stack_trace` | Full stack trace (if available) |
| `platform` | `android` / `web` / `ios` |
| `app_version` | Current app version |
| `device` | User agent, screen size, platform details |
| `user_email` | Signed-in user email (if available) |
| `sign_in_method` | `google-native`, `google-popup-web`, etc. |
| `attempt_number` | Which retry attempt failed |
| `timestamp` | Server timestamp |

Check Firestore Console → `auth_error_logs` collection to monitor auth failures in production.

---

## Troubleshooting Google Sign-In

| Symptom | Fix |
|---------|-----|
| "No credentials available" | Add Play Store SHA-1 to Firebase. Clear app cache. Rebuild. |
| "unauthorized-domain" | Add domain to Firebase Console → Auth → Authorized domains |
| Works in debug, fails in release | Add release keystore SHA-1 to Firebase |
| Works locally, fails on Play Store | Add Play Store App Signing SHA-1 (different from upload key) |
| Intermittent failures | App has retry logic built in. Check `auth_error_logs` in Firestore. |

---

## Deploy

Open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click Share → Publish.

## Custom Domain

Project > Settings > Domains > Connect Domain. [Docs](https://docs.lovable.dev/features/custom-domain#custom-domain)
