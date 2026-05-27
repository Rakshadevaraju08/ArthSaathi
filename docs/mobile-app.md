# ArthSaathi Mobile App

Current status: standalone Expo prototype with local Zustand state. The active mobile UI does not call backend APIs from `src/app`, `src/components`, or `src/store`.

## Stack

| Layer | Technology |
|---|---|
| App | React Native + Expo |
| Routing | Expo Router |
| Styling | NativeWind + React Native styles |
| State | Zustand local store |
| Icons | `@expo/vector-icons`, selected `lucide-react-native` icons |
| UI helpers | `expo-linear-gradient`, `react-native-safe-area-context` |

## Active Flow

1. `src/app/index.tsx`
   - Redirects registered users to `/(tabs)/home`.
   - Redirects onboarded users to `/login`.
   - Otherwise redirects to `/onboarding`.

2. `src/app/onboarding.tsx`
   - Language selection only.
   - Entry buttons for `Create new account` and `Login to existing account`.

3. `src/app/(auth)/login.tsx`
   - Local mock login with mobile number and password.
   - Seeds the local user state and opens the dashboard.

4. `src/app/signup/index.tsx`
   - Separate signup screen.
   - Collects full name, mobile number, password, and profession.
   - Language is inherited from onboarding.

5. `src/app/signup/details-*.tsx`
   - Profession-specific question screens.
   - Each supports `Normal input` and `Voice input`.
   - Stores answers locally in Zustand and completes registration.

6. `src/app/(tabs)/_layout.tsx`
   - Bottom tabs: Home, Ledger, center Voice FAB, Insights, Profile.

## Dashboard Routes

| Route | Purpose |
|---|---|
| `/(tabs)/home` | Main dashboard with health score, income/expense/savings, loan card, and profession-specific quick actions |
| `/(tabs)/ledger` | Dynamic transaction ledger; category inputs change by profession |
| `/(tabs)/business` | Profession-specific operational dashboard mounted behind quick actions |
| `/(tabs)/insights` | Local profession-specific insight cards |
| `/(tabs)/profile` | Account, work profile, language, preferences, and sign out |
| `/screens/voice` | Local mock voice assistant |
| `/screens/loan` | Local loan eligibility, risk gauge, EMI analysis |
| `/screens/rtc` | Local RTC OCR mock |
| `/screens/scam` | Local fraud warning mock |

## Profession Dashboards

`/(tabs)/business` switches on `store.occupation`:

| Occupation | Component | Sections |
|---|---|---|
| `FARMER` | `MandiDashboard` | Mandi rates, harvest readiness, RTC status |
| `SHOP_OWNER` | `UdharBook` | Add Udhar, Udhar Book, Add Stock, Stock Cycle |
| `TAILOR` | `TailorOrders` | Add Order, Orders Queue, Add Delivery, Delivery Plan |
| `DAILY_WAGE` | `WageTracker` | Add Shift, Shift Tracker, Add Payment Due, Payment Due |

## Store

`src/store/index.ts` contains:

- Registration fields: name, mobile, password, language, occupation.
- Step 2 details in `businessDetails`.
- Control flags: `onboarded`, `isRegistered`, `isLoggedIn`.
- Local transactions and loans.
- Actions for registration, custom role details, transactions, loans, and reset.

## Removed/Unused Cleanup

The old static home summary cards and unused generic UI cards were removed after the dashboard became route-driven and profession-specific.
