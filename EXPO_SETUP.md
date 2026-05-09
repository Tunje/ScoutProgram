# Setting Up Expo Mobile App for Scanner

## Prerequisites

1. Install Node.js (already have ✓)
2. Install Expo CLI globally:
   ```bash
   npm install -g expo-cli
   ```

3. Install Expo Go app on your phone:
   - **iOS**: Download from App Store
   - **Android**: Download from Google Play Store

## Create the Expo App

```bash
cd c:\Users\simon\PROGRAMING\Scoutapp
npx create-expo-app scanner-mobile --template blank-typescript
cd scanner-mobile
```

## Install Required Dependencies

```bash
# Firebase
npm install firebase

# Navigation
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context

# Camera/QR Scanner
npm install expo-camera expo-barcode-scanner

# UI Components
npm install react-native-paper
```

## Project Structure

```
scanner-mobile/
├── App.tsx                 # Main entry point
├── app.json               # Expo configuration
├── package.json
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── ProjectSelectScreen.tsx
│   │   ├── GroupRegistrationScreen.tsx
│   │   └── ScanScreen.tsx
│   ├── lib/
│   │   └── firebase.ts
│   ├── types/
│   │   └── index.ts
│   └── components/
│       └── (shared components)
└── assets/
```

## Key Differences from Web App

### Camera Access
- Use `expo-camera` instead of `html5-qrcode`
- Native camera performance
- Better QR code detection

### Navigation
- Use React Navigation instead of React Router
- Stack navigation for screens

### Styling
- React Native StyleSheet instead of TailwindCSS
- React Native Paper for UI components

### Firebase
- Same Firebase config
- Same Firestore operations
- Works identically to web app

## Running the App

### Development Mode

```bash
cd scanner-mobile
npm start
```

This will:
1. Start the Expo development server
2. Show a QR code in terminal
3. Scan QR code with Expo Go app on your phone
4. App loads on your phone instantly

### Testing

- **iOS**: Scan QR with Camera app → Opens in Expo Go
- **Android**: Scan QR with Expo Go app

### Hot Reload
- Save any file
- App updates instantly on your phone
- No rebuild needed

## Building for Production

### Build APK (Android)

```bash
# Build APK for testing
eas build --platform android --profile preview

# Build for Google Play Store
eas build --platform android --profile production
```

### Build IPA (iOS)

```bash
# Build for TestFlight
eas build --platform ios --profile preview

# Build for App Store
eas build --platform ios --profile production
```

## Advantages of Expo

✅ **Easy Development**: Test on real device instantly
✅ **Native Performance**: True native app
✅ **Camera Access**: Better QR scanning
✅ **Offline Support**: Can add offline capabilities
✅ **Push Notifications**: Can add later
✅ **App Store Ready**: Can publish to stores
✅ **Over-the-Air Updates**: Update app without store approval

## Next Steps

1. I'll create the Expo app structure
2. Port the scanner functionality to React Native
3. Test on your phone with Expo Go
4. Build APK/IPA when ready

Would you like me to create the full Expo app now?
