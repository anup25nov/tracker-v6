# Play Store readiness – SSC Exam Sathi

The app is configured for a production Android build. Use this checklist for what **you** need to do before and during Play Console submission.

---

## 1. Build and sign the app (your side)

### Create an upload keystore (first time only)

Use your own store credentials. **Keep the keystore and passwords safe**; you need them for every future update.

```bash
keytool -genkey -v -keystore sscexamsathi-upload.keystore -alias sscexamsathi -keyalg RSA -keysize 2048 -validity 10000
```

Store the `.keystore` file and passwords in a safe place (e.g. password manager). Do not commit them to git.

### Build release AAB

From the project root:

```bash
npm run build
npx cap sync android
cd android && ./gradlew bundleRelease
```

The signed bundle is:  
`android/app/build/outputs/bundle/release/app-release.aab`

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
- **App icon:** 512 x 512 px PNG (no alpha). You can use `public/logo512x512.png` as a base; ensure it meets [Play’s icon guidelines](https://support.google.com/googleplay/android-developer/answer/9866151).  
- **Feature graphic:** 1024 x 500 px (JPG or PNG).  
- **Screenshots:** At least 2 phone screenshots (e.g. 1080x1920 or similar). Capture: exam select, subject list, topic list, progress.

### 2.3 Privacy policy (required)

Play requires a **publicly accessible privacy policy URL** for apps that handle user data (e.g. progress, analytics).

- **What to do:** Publish a privacy policy page (e.g. on your website or GitHub Pages) that explains:
  - What data the app stores (e.g. progress on device, optional Firebase analytics if you use it).
  - That data is stored locally / in Firebase (as applicable).
  - No selling of user data, etc.
- Add the URL in Play Console: **App content → Privacy policy** and paste the link.

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
