# NotifyLocale

Expo demo of dynamic push notification localization done entirely on the device. The backend sends only metadata keys (`titleKey`, `bodyKey`, `vars`); the app resolves translations using the user's locale and shows a local notification via Notifee.

## Architecture

1. **FCM payload is data-only** (no `notification` field) — required so JS can intercept before the OS renders anything:
   ```json
   {
     "data": {
       "titleKey": "notification.order_shipped",
       "bodyKey":  "notification.order_shipped_body",
       "vars":     "{\"orderId\":\"999\",\"item\":\"Laptop\"}"
     }
   }
   ```
2. **Handler fires** — `setBackgroundMessageHandler` (`index.js`) for background/killed Android, `messaging().onMessage()` (`app/_layout.tsx`) for foreground.
3. **i18next resolves** `titleKey`/`bodyKey` with the current device locale and interpolates `vars`.
4. **Notifee displays** the translated local notification.
5. **iOS killed state** is handled by a **Notification Service Extension** (Swift) that reads `titleKey`/`bodyKey` from `userInfo`, looks them up in `Localizable.strings`, and substitutes `{{var}}` placeholders from the `vars` JSON.

## Project Structure

```
src/
  i18n/           i18next setup + en/ar/fr/bn JSON
  notifications/  handler.ts, channels.ts
  store/          Zustand log store
  screens/        HomeScreen, LogScreen
ios/NotificationService/
  NotificationService.swift
  Info.plist
  {en,ar,fr,bn}.lproj/Localizable.strings
plugins/
  withNotificationServiceExtension.js   (registers the iOS extension target)
.github/workflows/
  ci.yml, android-build.yml, ios-build.yml
```

## Setup

### 1. Install dependencies
```
pnpm install
```

### 2. Replace placeholder Firebase config
- `google-services.json` (Android)
- `GoogleService-Info.plist` (iOS)

### 3. Prebuild (required so the iOS extension is wired up)
```
npx expo prebuild --clean
```
The config plugin at `plugins/withNotificationServiceExtension.js` copies the Swift sources + `Localizable.strings` into the generated `ios/` project and registers the `NotificationService` target with bundle ID `com.notifylocale.app.NotificationService`.

### 4. Run
```
npx expo run:ios       # or run:android
```

## Testing Each App State

| State                | How to trigger                                                              |
|----------------------|------------------------------------------------------------------------------|
| Foreground           | Use the "Simulate" buttons on HomeScreen, or send an FCM push while open.   |
| Background (Android) | Send a data-only FCM push while the app is backgrounded.                    |
| Killed (Android)     | Same FCM push — the headless handler in `index.js` runs.                    |
| Killed (iOS)         | Same FCM push — the Notification Service Extension translates it.           |

### FCM REST test payload
```bash
curl -X POST https://fcm.googleapis.com/v1/projects/<PROJECT_ID>/messages:send \
  -H "Authorization: Bearer $FCM_OAUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "token": "<DEVICE_TOKEN>",
      "data": {
        "titleKey": "notification.order_shipped",
        "bodyKey":  "notification.order_shipped_body",
        "vars":     "{\"orderId\":\"999\",\"item\":\"Laptop\"}"
      },
      "apns": {
        "payload": { "aps": { "mutable-content": 1, "alert": { "title": " ", "body": " " } } }
      }
    }
  }'
```
The `mutable-content: 1` flag is required for the iOS extension to fire. The placeholder `alert` is required by APNs; the extension overwrites it.

## Adding a New Locale

1. Add `src/i18n/locales/<code>.json` mirroring the existing keys.
2. Register the resource in `src/i18n/index.ts`.
3. For iOS killed-state: add `ios/NotificationService/<code>.lproj/Localizable.strings` and append the locale to the `LOCALES` array in `plugins/withNotificationServiceExtension.js`, then re-run `expo prebuild --clean`.

## RTL (Arabic)

Switching to Arabic calls `I18nManager.forceRTL(true)` followed by `RNRestart.Restart()` to flip layout direction immediately.

## CI / EAS Builds

### Triggering a manual build from GitHub
1. Go to **Actions** → **Android EAS Build** or **iOS EAS Build**.
2. Click **Run workflow**, pick a profile (`development` / `preview` / `production`).
3. The workflow uses `EXPO_TOKEN` from repo secrets.

### Required secrets
- `EXPO_TOKEN` — from expo.dev → Account Settings → Access Tokens.
- (Optional for EAS Submit) `APPLE_ID`, `ASC_APP_ID`.

## Notes

- Never send a `notification` field in the FCM payload — only `data`. Otherwise FCM auto-renders the (untranslated) push before JS can intercept.
- The i18n module never imports from React so it can boot in the headless context.
- `HeadlessCheck` in `index.js` returns `<AppFake />` (not `null`) — required for iOS to invoke the JS background handler in the quit state.
