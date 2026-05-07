# FitFlow — Publishing Guide 🚀

## Step 1 — Install EAS CLI
```bash
npm install -g eas-cli
```

## Step 2 — Login to Expo account
```bash
eas login
```
(Create a free account at expo.dev if you don't have one)

## Step 3 — Configure EAS
```bash
eas build:configure
```
This creates an `eas.json` file automatically.

## Step 4 — Build APK for Android (for testing)
```bash
eas build -p android --profile preview
```
- This builds a standalone `.apk` file
- Takes about 10-15 minutes on EAS servers
- You'll get a download link when done
- Install it directly on any Android phone — no Play Store needed!

## Step 5 — Build for Google Play Store (AAB)
```bash
eas build -p android --profile production
```
This creates an `.aab` file for uploading to Google Play.

## Step 6 — Submit to Google Play
```bash
eas submit -p android
```

---

## Before Building — Checklist

- [ ] Replace `assets/icon.png` with your real app icon (1024x1024 PNG)
- [ ] Replace `assets/splash.png` with your splash screen (1284x2778 PNG)
- [ ] Replace `assets/adaptive-icon.png` (1024x1024 PNG, foreground only)
- [ ] Update `android.package` in `app.json` to your unique package name
  - Format: `com.yourname.fitflow`
  - Must be unique on Play Store
- [ ] Update `version` in `app.json` before each release
- [ ] Create a Google Play Developer account ($25 one-time fee)

---

## eas.json (auto-generated, for reference)
```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": { "buildType": "apk" }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

---

## Testing your APK
1. Download the APK from the EAS build link
2. Transfer to your Android phone
3. Enable "Install from unknown sources" in phone settings
4. Install and test!

---

## App Store (iPhone) — Additional Steps
- Requires Apple Developer account ($99/year)
- Run: `eas build -p ios --profile production`
- Then: `eas submit -p ios`
