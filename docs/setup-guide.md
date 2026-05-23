# ArthSaathi — Setup Guide

AI Powered Rural Financial Intelligence Platform

---

# Mobile App (Frontend) Setup

This guide covers the setup and execution of the React Native Expo mobile application.

## Prerequisites
- **Node.js**: v18 or higher.
- **npm**: v8 or higher.
- **Expo Go**: Download the "Expo Go" app on your iOS or Android device to scan and test the app.

## 1. Installation

Navigate to the frontend directory and install the necessary dependencies:

```bash
cd mobile-app
npm install
```

## 2. Running the App

Start the Expo development server. **Always use the `-c` flag** to clear the Metro bundler cache. This is critical to ensure NativeWind v4 (Tailwind CSS) processes your styling correctly and avoids blank screens:

```bash
npx expo start -c
```

Once the server starts:
- **Android**: Open the **Expo Go** app and scan the QR code.
- **iOS**: Open the default **Camera** app and scan the QR code.

## 3. Known Expo Go Limitations & Workarounds

During the hackathon, we are using Expo Go for rapid iteration. Please be aware of the following implementations:

- **Blank Screens**: If the app loads to a white screen on Android, it is usually a cached NativeWind CSS issue. Stop the server (`Ctrl + C`) and restart with `npx expo start -c`.
- **Immersive Navigation Bar**: Hiding the Android system navigation bar (`expo-navigation-bar`) throws a safe, silent warning in Expo Go, but works flawlessly in a production APK.
- **Native Audio (`expo-av`)**: Native microphone access can occasionally crash standard Expo Go builds. A dummy conversation flow is implemented in `voice.tsx` to safely mock the voice assistant.
- **Icons**: We strictly use `@expo/vector-icons` because `lucide-react-native` SVGs occasionally collapse to zero width/height on Android devices when combined with NativeWind v4.

## 4. Building Natively (For Full Hardware Access)

To test native hardware modules (like the actual `expo-av` microphone recording without the mock fallback), you must build a custom development app instead of using Expo Go.

Connect your Android phone via USB (with USB Debugging enabled) or start an Android Studio Emulator, then run:

```bash
npx expo run:android
```

---

*This guide will be updated with Backend, Database, and AI Service setup instructions as those modules are completed.*