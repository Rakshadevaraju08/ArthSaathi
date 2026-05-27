# ArthSaathi Setup Guide

## Mobile App

The current app is a standalone Expo prototype.

```bash
cd mobile-app
npm install
npx expo start -c
```

Open the app with Expo Go or an Android emulator.

## Current Test Flow

1. Open the app.
2. Choose language on onboarding.
3. Create account or login.
4. If creating account, choose profession.
5. Answer profession questions with normal input or simulated voice input.
6. Use Home, Ledger, Voice, Insights, and Profile tabs.

## Notes

- The active mobile app is local-first and uses Zustand.
- Backend and AI services are not required to run the current prototype.
- `npx` on this Windows environment may print a PowerShell permission warning, but TypeScript and Expo commands can still complete successfully.
- For Android visual issues, restart Metro with `npx expo start -c`.

## Verification

```bash
cd mobile-app
npx tsc --noEmit
```
