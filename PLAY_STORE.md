# Play Store readiness – SSC Exam Sathi

The app is configured for a production Android build. Use this checklist for what **you** need to do before and during Play Console submission.

---

## 1. Build and sign the app (your side)

### 1. Create an upload keystore (first time only)

Use your own store credentials. **Keep the keystore and passwords safe**; you need them for every future update.

```bash
cd android
keytool -genkey -v -keystore sscexamsathi-upload.keystore -alias sscexamsathi -keyalg RSA -keysize 2048 -validity 10000
```

Store the `.keystore` file and passwords in a safe place (e.g. password manager). Do not commit them to git.

### 2. Configure release signing

Play Store requires **all uploaded AABs to be signed** with your upload key. Do this once per machine:

1. In the `android` folder, copy the example properties file:
   ```bash
   cp keystore.properties.example keystore.properties
   ```
2. Edit `android/keystore.properties` and set:
   - `storePassword` – password for the keystore file
   - `keyPassword` – password for the key alias
   - Keep `storeFile=sscexamsathi-upload.keystore` and `keyAlias=sscexamsathi` unless you used different names.

`keystore.properties` is in `.gitignore`; do not commit it.

### 3. Build release AAB

From the project root:

```bash
npm run build:aab
```

Or step by step:

```bash
npm run build:android
npx cap sync android
cd android && ./gradlew bundleRelease
```

The **signed** bundle is:  
`android/app/build/outputs/bundle/release/app-release.aab`  
Upload this file in Play Console.

### If you see "keystore password was incorrect"

This means the values in `android/keystore.properties` don’t match your keystore:

1. **Check the passwords** you use when creating the keystore. In `keytool -genkey` you set:
   - A **keystore password** → use this for `storePassword` in `keystore.properties`
   - A **key password** (often same as keystore) → use this for `keyPassword`

2. **No extra spaces** – in `keystore.properties`, make sure there are no spaces around `=` and no spaces at the end of lines (e.g. `storePassword=YourPassword` not `storePassword = YourPassword `).

3. **Verify the keystore** from the `android` folder:
   ```bash
   keytool -list -keystore sscexamsathi-upload.keystore
   ```
   Enter the keystore password. If it fails here, the password is wrong or the keystore file is different. If it works, use that same password for `storePassword` (and the key password you set for `keyPassword`).

4. If you **forgot the password**, you cannot recover it. Create a new keystore (new file name) and use it for new apps; existing Play apps must keep using the original key.

### Sign the bundle (if not using Play App Signing)

If you sign the app yourself (not recommended for new apps), configure `android/app/build.gradle` with your keystore and run the bundle command again.  
**Recommended:** Use **Play App Signing**. In that case you upload the AAB and optionally let Google create and manage the app signing key; you only need an upload key (created above). When you upload the first AAB, Play Console will guide you to enroll in Play App Signing and register your upload key.

---

## 2. Google Play Console – required from you

### 2.1 Create the app and complete the dashboard

- Create a new app in [Google Play Console](https://play.google.com/console) and accept the developer agreement if needed.
- Fill in **Store settings** (default language, contact email, etc.).

### 2.2 Store listing (main store listing)

- **App name:** SSC Exam Sathi  
- **Short description:** Up to 80 characters (e.g. “Track SSC CGL syllabus topic-wise. Mark topics done, see progress.”).  
- **Full description:** Up to 4000 characters. Describe features: syllabus tracking, subjects, topics, progress, backup/restore, etc.  
- **App icon:** 512 x 512 px PNG (no alpha). You can use `public/app_logo.png` (or export a 512×512 PNG from it); ensure it meets [Play’s icon guidelines](https://support.google.com/googleplay/android-developer/answer/9866151).  
- **Feature graphic:** 1024 x 500 px (JPG or PNG).  
- **Screenshots:** At least 2 phone screenshots (e.g. 1080x1920 or similar). Capture: exam select, subject list, topic list, progress.

### 2.3 Privacy policy (required)

Play requires a **publicly accessible privacy policy URL** for apps that handle user data (e.g. progress, analytics).

- **In this repo:** A ready-to-use policy is in **`public/privacy-policy.html`**. It covers local storage (progress, preferences), Firebase Analytics (anonymous usage), no account/sign-in, no sale of data, backup/restore, and contact.
- **Get a URL:** Host that file at a public URL. Options:
  1. **GitHub Pages:** Enable Pages for this repo (Settings → Pages → deploy from branch, e.g. `main`, folder `/ (root)` or assign `public` as source if supported). The URL will be like `https://<username>.github.io/<repo-name>/privacy-policy.html`. If the site is served from `dist` or root, put `privacy-policy.html` in the deployed root so the URL is `https://.../privacy-policy.html`.
  2. **Your own domain:** Upload `public/privacy-policy.html` to your website (e.g. `https://yoursite.com/privacy-policy.html`).
- In Play Console go to **App content → Privacy policy** and enter that full URL.

### 2.4 App content (questionnaires)

- **Data safety:** Declare whether you collect/share data. For a syllabus tracker with optional Firebase, answer accordingly (e.g. “App functionality” data, stored on device / optionally in Firebase).  
- **Ads:** Select “No” if the app has no ads.  
- **Content rating:** Complete the questionnaire (e.g. “Everyone” for educational/tracking).  
- **Target audience:** Choose age group (e.g. 13+ or 18+ as appropriate).  
- **News app:** Select “No” if it’s not a news app.  
- **COVID-19 contact tracing / status:** Select “No” unless applicable.

### 2.5 Release

- Create a **Production** (or **Internal testing**) release.
- Upload the **AAB** (`app-release.aab`).
- Set release name (e.g. “1.0 (1)”) and release notes.
- Submit for review.

---

## 3. Optional but recommended

- **Firebase:** If you use Firebase (e.g. Analytics), ensure `google-services.json` is in `android/app/` and that the package name in Firebase matches `com.sscexamsathi.app`.  
- **App ID:** The app is set to `com.sscexamsathi.app`. If you want a different package (e.g. `com.yourdomain.sscexamsathi`), change it **before** the first upload (in `capacitor.config.json`, `android/app/build.gradle`, `android/app/src/main/res/values/strings.xml`, and move `MainActivity` to the new package path).  
- **Testing:** Install the release build on a device and test: exam selection, subjects, topics, progress, backup/restore (if applicable).

---

## 4. Summary – what you need to provide

| Item | Where | Notes |
|------|--------|--------|
| Keystore + passwords | Your machine / safe storage | For signing; do not share or commit. |
| Short description | Play Console → Store listing | ≤ 80 characters. |
| Full description | Play Console → Store listing | ≤ 4000 characters. |
| 512×512 icon | Play Console → Store listing | PNG, no alpha. |
| 1024×500 feature graphic | Play Console → Store listing | JPG or PNG. |
| Phone screenshots | Play Console → Store listing | At least 2. |
| Privacy policy URL | Play Console → App content | Required; host on a public URL. |
| Data safety / Content rating / Ads / etc. | Play Console → App content | Fill all required forms. |
| Signed AAB | Play Console → Release | Built and signed by you. |

Once these are done, the app is ready for Play Store submission.
