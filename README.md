# Travel Buddy App

A native cross-platform mobile app built with Expo Router + React Native.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

2. Start the app:

   ```bash
   npm start
   # or
   yarn start
   # or
   bun start
   ```

3. For web development:

   ```bash
   npm run start-web
   ```

## Features

- Cross-platform (iOS, Android, Web)
- Built with Expo Router
- Firebase integration
- Modern React Native components

## Project Structure

- `app/` - Expo Router app directory
- `assets/` - Images and static assets
- `config/` - Configuration files
- `constants/` - App constants
- `mocks/` - Mock data
- `providers/` - React context providers
- `services/` - API and service integrations
- `types/` - TypeScript type definitions

## Technologies Used

- **React Native** - Cross-platform native mobile development
- **Expo** - Platform for universal React apps
- **Expo Router** - File-based routing system
- **TypeScript** - Type-safe JavaScript
- **React Query** - Server state management
- **Firebase** - Backend services
- **Lucide React Native** - Beautiful icons

## Testing Your App

### On Your Phone (Recommended)

1. **iOS**: Download [Expo Go](https://apps.apple.com/app/expo-go/id982107779) from the App Store
2. **Android**: Download [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) from Google Play
3. Run `npm start` and scan the QR code

### In Your Browser

Run `npm run start-web` to test in a web browser.

### iOS Simulator / Android Emulator

If you have Xcode (iOS) or Android Studio installed:

```bash
# iOS Simulator
npm start -- --ios

# Android Emulator
npm start -- --android
```

## Custom Development Builds

For features requiring native code:

- Native authentication
- In-app purchases
- Push notifications
- Custom native modules

Learn more: [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)

- **RevenueCat** - Cross-platform in-app purchases and subscriptions - [Expo Integration Guide](https://www.revenuecat.com/docs/expo)
- **Expo In-App Purchases** - Direct App Store/Google Play integration - [Implementation Guide](https://docs.expo.dev/versions/latest/sdk/in-app-purchases/)

**Paywall Optimization:**

- **Superwall** - Paywall A/B testing and optimization - [React Native SDK](https://docs.superwall.com/docs/react-native)
- **Adapty** - Mobile subscription analytics and paywalls - [Expo Integration](https://docs.adapty.io/docs/expo)

## I want to use a custom domain - is that possible?

For web deployments, you can use custom domains with:

- **EAS Hosting** - Custom domains available on paid plans
- **Netlify** - Free custom domain support
- **Vercel** - Custom domains with automatic SSL

For mobile apps, you'll configure your app's deep linking scheme in `app.json`.

## Troubleshooting

### **App not loading on device?**

1. Make sure your phone and computer are on the same WiFi network
2. Try using tunnel mode: `bun start -- --tunnel`
3. Check if your firewall is blocking the connection

### **Build failing?**

1. Clear your cache: `npx expo start --clear`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Check [Expo's troubleshooting guide](https://docs.expo.dev/troubleshooting/build-errors/)

### **Need help with native features?**

- Check [Expo's documentation](https://docs.expo.dev/) for native APIs
- Browse [React Native's documentation](https://reactnative.dev/docs/getting-started) for core components
