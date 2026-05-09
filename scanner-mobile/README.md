# Scout Scanner - Native Mobile App

This is a **REAL NATIVE MOBILE APP** built with Expo and React Native.

## ✅ What You Have

- **Native Android/iOS app** (not a webpage!)
- Works in Android Studio emulator
- Can be installed on real phones
- Native camera for QR scanning
- Same Firebase backend as admin site

## 🚀 Running the App

### On Your Phone (Easiest)

1. Install **Expo Go** app from Play Store/App Store
2. Run the development server:
   ```bash
   cd scanner-mobile
   npm start
   ```
3. Scan the QR code with Expo Go
4. App loads on your phone!

### In Android Studio

1. Start the development server:
   ```bash
   cd scanner-mobile
   npm start
   ```

2. Press `a` to open in Android emulator
   - Android Studio must be installed
   - An emulator must be running

### In iOS Simulator (Mac only)

1. Start the development server:
   ```bash
   cd scanner-mobile
   npm start
   ```

2. Press `i` to open in iOS simulator

## 📱 Features

- **Login/Sign Up** with Firebase Auth
- **Project Selection** - Choose which event
- **Group Registration** - Enter code to claim group
- **QR Scanner** - Native camera scanning
- **Real-time Updates** - Instant feedback on scans

## 🔧 Development

### Start Development Server
```bash
npm start
```

This opens the Expo Dev Tools where you can:
- Scan QR code to test on phone
- Press `a` for Android
- Press `i` for iOS (Mac only)
- Press `w` for web (fallback)

### Hot Reload
- Save any file
- App updates instantly
- No rebuild needed!

## 📦 Building for Production

### Android APK (for testing)
```bash
npx expo build:android
```

### Android AAB (for Google Play)
```bash
npx eas build --platform android
```

### iOS IPA (for App Store - Mac required)
```bash
npx eas build --platform ios
```

## 🎯 How to Test

1. **Start the admin site** (to create projects/groups)
2. **Start the mobile app**:
   ```bash
   cd scanner-mobile
   npm start
   ```
3. **Scan QR code** with Expo Go on your phone
4. **Test the flow**:
   - Sign up/Login
   - Select project
   - Register group with code
   - Scan QR codes from admin

## 📂 Project Structure

```
scanner-mobile/
├── App.tsx                          # Navigation setup
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx          # Login/signup
│   │   ├── ProjectSelectScreen.tsx  # Choose project
│   │   ├── GroupRegistrationScreen.tsx # Register with code
│   │   └── ScanScreen.tsx           # QR scanner
│   ├── lib/
│   │   └── firebase.ts              # Firebase config
│   └── types/
│       └── index.ts                 # TypeScript types
└── package.json
```

## 🔥 Firebase Setup

Firebase config is already set up in `src/lib/firebase.ts`.

Uses the same Firebase project as the admin site:
- Authentication
- Firestore Database
- Real-time updates

## 🎨 UI

- **React Native** components (not web!)
- **Native styling** with StyleSheet
- **Native navigation** with React Navigation
- **Native camera** with expo-camera

## ⚡ Advantages Over Web App

✅ **True native app** - not a webpage
✅ **Better camera** - native QR scanning
✅ **Faster performance** - native code
✅ **Offline support** - can add later
✅ **Push notifications** - can add later
✅ **App store ready** - can publish
✅ **Looks professional** - real mobile app

## 🐛 Troubleshooting

### "Cannot find module" errors
The TypeScript errors will resolve once you start the app. They're just IDE warnings.

### Camera not working
- Make sure you granted camera permissions
- On real device: Check phone settings
- On emulator: Emulator cameras are limited

### Expo Go not connecting
- Make sure phone and computer are on same WiFi
- Try scanning QR code again
- Restart Expo dev server

## 📱 Next Steps

1. **Test on your phone** with Expo Go
2. **Build APK** for distribution
3. **Publish to Play Store** (optional)
4. **Add more features** (offline mode, notifications, etc.)

---

**This is a REAL MOBILE APP, not a fucking webpage! 🎉**
