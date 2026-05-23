# ArthSaathi — Frontend Structure

AI Powered Rural Financial Intelligence Platform

---

# Overview

The frontend is a React Native mobile application built using **Expo**, routed via **Expo Router**, styled using **NativeWind v4 (Tailwind CSS)**, and manages global state using **Zustand**. 

The application enforces a voice-first, accessible, and multilingual experience targeting rural users.

---

# Technology Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo |
| Routing | Expo Router (File-based) |
| Styling | NativeWind v4 (Tailwind CSS) |
| State Management | Zustand |
| Icons | `@expo/vector-icons` (Feather, MaterialIcons, etc.) |
| Safe Area | `react-native-safe-area-context` |
| Gradients | `expo-linear-gradient` |

---

# Folder Structure

The application source code lives entirely within the `mobile-app/src` directory to keep configurations (`tailwind.config.js`, `babel.config.js`) separate from application logic.

```txt
mobile-app/
│
├── src/
│   ├── app/                # Expo Router file-based routing
│   │   ├── (tabs)/         # Bottom Tab Navigation
│   │   │   ├── _layout.tsx # Tab bar configuration
│   │   │   ├── expenses.tsx
│   │   │   ├── home.tsx
│   │   │   └── insights.tsx
│   │   ├── screens/        # Modal and Card presentation screens
│   │   │   ├── loan.tsx
│   │   │   ├── rtc.tsx
│   │   │   └── voice.tsx
│   │   ├── _layout.tsx     # Root Stack navigation & global providers
│   │   ├── index.tsx       # Initial redirect
│   │   └── onboarding.tsx  # First launch experience
│   │
│   ├── components/         # Reusable UI building blocks
│   │   ├── home/           # Dashboard specific widgets
│   │   ├── ui/             # Generic cards, buttons, bottom sheets
│   │   ├── voice/          # Voice assistant specific UI (Waveforms)
│   │   └── MicFAB.tsx      # Floating Action Button for Voice
│   │
│   ├── constants/          # Static configuration
│   │   ├── categories.ts
│   │   ├── colors.ts
│   │   └── translations.ts # Multilingual dictionaries
│   │
│   ├── hooks/              # Custom React Hooks
│   │
│   ├── services/           # External API & Device integrations
│   │   ├── api.ts          # Axios backend calls
│   │   ├── tts.ts          # Text-to-Speech logic
│   │   └── whisper.ts      # Audio recording & STT integration
│   │
│   ├── store/              # Zustand global state
│   │   └── index.ts        # Actions, user data, AI messages, tx history
│   │
│   ├── types/              # TypeScript definitions
│   │   └── index.ts
│   │
│   └── global.css          # Tailwind CSS entrypoint
│
├── app.json                # Expo configuration
├── babel.config.js         # Babel & NativeWind setup
├── metro.config.js         # Metro bundler CSS configuration
├── tailwind.config.js      # Tailwind theme extensions
└── package.json
```

---

# Navigation Flow

1. **App Launch** (`src/app/index.tsx`) → Instantly redirects to `/onboarding`.
2. **Onboarding** (`src/app/onboarding.tsx`) → Collects preferred language, explains features, proceeds to Home.
3. **Main Dashboard** (`src/app/(tabs)/home.tsx`) → Central hub with quick actions, financial health score, and summaries.
4. **Global Voice** (`src/app/screens/voice.tsx`) → Accessible from anywhere via the `MicFAB`. It overlays the app as a modal.

---

# Styling Rules & Workarounds

1. **NativeWind on Android**: To prevent zero-height collapse, critical root layouts (`SafeAreaProvider`, `ScrollView`) must explicitly include `style={{ flex: 1 }}` alongside Tailwind's `className="flex-1"`.
2. **Icons**: `lucide-react-native` suffers from Android SVG rendering bugs with NativeWind v4. We explicitly use `@expo/vector-icons` for guaranteed stability.
3. **System UI**: The Android OS navigation bar is hidden natively via `expo-navigation-bar` inside the root `_layout.tsx` to provide an immersive full-screen experience. 

---

# State Management (Zustand)

The `useStore` (`src/store/index.ts`) handles:
- **User Preferences:** Selected language (`Hindi`, `English`, etc.), Onboarding status.
- **Financial Data:** Array of transactions (income/expenses). Derived calculations (total income, health score) are abstracted in custom selector hooks like `useTotals()`.
- **AI Chat State:** Transcript of the current voice session, maintaining context.
- **Feature Status:** Shared data like `rtcUploaded` and `loanRisk` assessments.

---

*This document is updated automatically to reflect architectural changes as the hackathon progresses.*