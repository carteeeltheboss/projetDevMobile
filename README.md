# MyStudyCompanion (Expo / React Native)

Offline-first EMSI timetable, alerts, and todo app using Google Sheets as a headless CMS. Supports deep links, caching via AsyncStorage, and (in dev builds) background polling with local notifications for current class and new alerts.

## Features
- Schedule & Alerts from Google Sheets (`opensheet.elk.sh`)
- Offline cache fallback (AsyncStorage)
- Dashboard with current session highlight + today’s classes
- Full 5x4 schedule grid (Mon–Fri, 4 slots)
- Alerts & Messages section (priority colors: red/orange/green)
- Personal Todo list (local, persistent, add/edit/delete, mark done)
- Shared Todo list (from the same Sheet `TODO` tab)
- Deep linking (`mystudy://open?screen=Alerts&id=123`)
- Background polling + local notifications (dev/build only; not supported in Expo Go)

## Project structure
```
App.js
app.json
src/
  background/notificationsTask.js
  components/...
  hooks/useCachedResource.js
  navigation/AppNavigator.js
  navigation/LinkingConfiguration.js
  screens/DashboardScreen.js
  screens/AlertsScreen.js
  screens/ScheduleScreen.js
  screens/TodoScreen.js
  screens/SharedTodoScreen.js
  services/googleSheetsService.js
  storage/storageKeys.js
  utils/time.js
assets/
```

## Google Sheets setup
Use one Sheet with three tabs:
- `SCHEDULE` headers: `Day | StartTime | EndTime | Module | Professor | Room | Group | Notes`
- `ALERTS` headers: `Id | Title | Message | Priority | ExpiresAt | CreatedAt | Link`
  - Priority: `high` (red), `medium` (orange), `low` (green)
  - Link example: `mystudy://open?screen=Alerts&id=1`
- `TODO` (shared) headers: `Title | Course | DueAt | Priority | Duration` (Id optional)

Share the sheet as “Anyone with the link – Viewer”.

## Configuration
Edit `src/services/googleSheetsService.js`:
- `SHEET_ID`: set to your Google Sheet ID (same sheet for Schedule/Alerts/Shared Todo).
- The code uses `https://opensheet.elk.sh/${SHEET_ID}/<TAB>`.

## Scripts
- Install deps: `npm install`
- Start (recommended): `npx expo start`
- Start + clear cache: `npx expo start --clear`
- Doctor check: `npx expo-doctor`
- Dev build (for notifications/background): `eas build --profile development --platform android` (or ios), then `npx expo start --dev-client`

## Running
1) `npm install`
2) Set `SHEET_ID` in `src/services/googleSheetsService.js`
3) `npx expo start`
4) Open on device/simulator; pull-to-refresh on Dashboard to load data and cache for offline.

## Deep links
- Scheme: `mystudy://`
- Example: `mystudy://open?screen=Alerts&id=1`
- Test on simulator:
  - iOS: `npx uri-scheme open "mystudy://open?screen=Alerts&id=1" --ios`
  - Android: `npx uri-scheme open "mystudy://open?screen=Alerts&id=1" --android`

## Background polling & notifications
- Implemented in `src/background/notificationsTask.js`
- Polls Schedule/Alerts ~every 3 minutes (best effort, OS-controlled), sends local notification on current class change or new alert Id.
- Requires notification permission and a dev/build client. **Expo Go does not support this.**
- In Expo Go, the app logs a warning and skips background registration.

## Offline behavior
- Network fetch -> cache to AsyncStorage.
- On failure, loads from cache (schedule, alerts, shared todos).
- Personal todos are always local and persisted.

## Testing & debug tips
- Verify sheet JSON: `https://opensheet.elk.sh/<SHEET_ID>/SCHEDULE` (or ALERTS/TODO).
- If lists are empty, check tab names/headers and sharing.
- Use `npx expo-doctor` to catch config issues.
- For cache reset, uninstall the app or clear AsyncStorage manually.

## Deployment
- Use EAS for production/dev builds:
  - Install EAS: `npm i -g eas-cli`
  - Configure `eas.json` (if needed) and run `eas build --platform android|ios`
- Push to Git as usual; ensure `.expo/`, `node_modules/` are ignored (already in `.gitignore`).

## Troubleshooting
- “Background notifications limited in Expo Go”: build a dev client (`eas build --profile development`) and run with `npx expo start --dev-client`.
- “Cannot fetch sheet”: check Sheet sharing and tab names; confirm `SHEET_ID`.
- “Deep link doesn’t open app”: ensure scheme `mystudy` is in `app.json` and test via `npx uri-scheme`.
