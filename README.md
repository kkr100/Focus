# Focus

A focus app: pick how long you want to focus on a task, hit start, and a big countdown keeps you on track. The background can be one of your own photos or a solid color.

Built with [Expo](https://expo.dev) (SDK 58, React Native, TypeScript).

## Features

- Countdown timer with start, pause, resume and stop
- Duration presets (5, 15, 25, 45, 60 min) plus fine-tuning with −5 / −1 / +1 / +5
- Optional task name ("What are you focusing on?")
- Background picker: choose a photo from your library or one of 12 solid colors
- Text color adapts to the background so the timer stays readable
- Screen stays awake while the timer runs, and you get a haptic buzz when it finishes
- Remembers your background, duration and task between launches
- Keeps correct time when the app is backgrounded
- **Stats** tab: daily goal ring, sessions and focus time for the day / week / month, a per-day activity chart (this week, last 10 days, this month) and time per task
- **Settings** tab: default focus length, daily goal, background, keep-screen-on and vibration toggles, and reset statistics

## Run it

```bash
npm install
npx expo start
```

Then scan the QR code with the **Expo Go** app on your phone (iOS or Android).

## Project layout

```
App.tsx                          Tabs, settings and session history state
src/screens/FocusScreen.tsx      Timer screen
src/screens/StatsScreen.tsx      Statistics
src/screens/SettingsScreen.tsx   Settings
src/sessions.ts                  Recorded sessions and stats helpers
src/hooks/useCountdown.ts        Timer logic (timestamp based)
src/components/DurationPicker.tsx
src/components/BackgroundPicker.tsx
src/storage.ts                   Saved settings and background photo copy
src/theme.ts                     Color presets and text contrast helper
```

## Checks

```bash
npx tsc --noEmit
```
