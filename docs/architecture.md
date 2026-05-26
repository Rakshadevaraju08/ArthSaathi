# ArthSaathi Architecture

Current implementation focus: local-first Expo mobile prototype.

The repository still contains backend, AI service, and Prisma folders, but the active mobile prototype is intentionally standalone. The mobile app currently uses local Zustand state instead of remote API calls so it can run immediately on-device.

## Active Runtime

```txt
Expo Mobile App
    |
    v
Expo Router Screens
    |
    v
Zustand Local Store
    |
    v
Mock Dashboard / Ledger / Loan / Voice UI
```

## Active Mobile Flow

```txt
Launch
  -> Onboarding language page
  -> Login OR Signup
  -> Profession selection
  -> Profession-specific questions
  -> Main dashboard tabs
```

## Tabs

```txt
Home | Ledger | Voice FAB | Insights | Profile
```

## Local Data Model

The Zustand store tracks:

- `fullName`
- `mobileNumber`
- `password`
- `preferredLanguage`
- `occupation`
- `monthlyIncome`
- `monthlyExpenses`
- `hasActiveLoans`
- `pastRepaymentHabit`
- `businessDetails`
- `transactions`
- `loans`
- `loanRisk`
- `onboarded`
- `isRegistered`
- `isLoggedIn`

## Profession Routing

The business dashboard is a local component router:

```txt
FARMER      -> MandiDashboard
SHOP_OWNER  -> UdharBook
TAILOR      -> TailorOrders
DAILY_WAGE  -> WageTracker
```

Each profession dashboard has separate add flows for its operational concepts:

- Shop owner: Udhar entries and stock cycle entries.
- Tailor: order queue entries and delivery plan entries.
- Daily wage: shift entries and payment due entries.
- Farmer: mandi rate and RTC readiness dashboard.

## Backend / AI Status

Backend and AI documentation remains useful for future integration, but it is not part of the current mobile runtime. Current mobile screens do not depend on:

- `endpoints`
- `fetch`
- `axios`
- remote auth
- remote transaction APIs
- remote AI/voice/loan APIs

Future integration should preserve the current local UX and replace store mutations with API-backed persistence gradually.
