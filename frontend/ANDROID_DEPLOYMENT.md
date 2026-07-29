# Android Deployment Guide

This guide covers building and deploying the Task Management Android application for development, staging, and production environments.

## Prerequisites

- Node.js >= 22 < 23
- npm >= 10.0.0
- Java JDK 17
- Android Studio (for Android SDK and build tools)
- Android SDK with API level 34+

## Environment Configuration

### 1. Setup Environment Files

Copy the appropriate environment example file and configure it:

**Development:**
```bash
cp .env.development.example .env.development
```

**Staging:**
```bash
cp .env.staging.example .env.staging
```

**Production:**
```bash
cp .env.production.example .env.production
```

### 2. Configure Environment Variables

Edit the environment file with your actual values:

**Development (.env.development):**
```env
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_CAPABILITIES_PATH=/system/capabilities
NEXT_PUBLIC_ENVIRONMENT=development
BACKEND_URL=http://127.0.0.1:8000
IMAGE_HOSTNAME=localhost
NEXT_PUBLIC_CAPACITOR_SERVER_URL=http://10.0.2.2:3000
```

**Staging (.env.staging):**
```env
NEXT_PUBLIC_API_URL=https://staging-api.yourdomain.com/api
NEXT_PUBLIC_CAPABILITIES_PATH=/system/capabilities
NEXT_PUBLIC_ENVIRONMENT=staging
BACKEND_URL=https://staging-api.yourdomain.com
IMAGE_HOSTNAME=staging-api.yourdomain.com
NEXT_PUBLIC_CAPACITOR_SERVER_URL=https://staging-api.yourdomain.com
```

**Production (.env.production):**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_CAPABILITIES_PATH=/system/capabilities
NEXT_PUBLIC_ENVIRONMENT=production
BACKEND_URL=https://api.yourdomain.com
IMAGE_HOSTNAME=api.yourdomain.com
NEXT_PUBLIC_CAPACITOR_SERVER_URL=
```

## Android Signing Configuration

### 1. Generate Release Keystore

For production builds, you need a signed keystore:

```bash
keytool -genkey -v -keystore release.keystore -alias your-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configure keystore.properties

Copy the example file and configure it:

```bash
cp android/keystore.properties.example android/keystore.properties
```

Edit `android/keystore.properties`:
```properties
storeFile=path/to/your/release.keystore
storePassword=your_store_password
keyAlias=your_key_alias
keyPassword=your_key_password
```

**IMPORTANT:** Never commit `keystore.properties` or your keystore file to version control!

## Build Commands

### Development Build

For development and testing on emulator:

```bash
# Build for development
npm run build:capacitor:development

# Sync with Android
npm run cap:sync:development

# Build debug APK
npm run cap:build:debug
```

The debug APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Staging Build

For staging environment:

```bash
# Build for staging
npm run build:capacitor:staging

# Sync with Android
npm run cap:sync:staging

# Build release APK
npm run cap:build:release
```

The release APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### Production Build

For production release:

```bash
# Build for production
npm run build:capacitor:production

# Sync with Android
npm run cap:sync:production

# Build release APK
npm run cap:build:release

# Or build AAB for Play Store
npm run cap:build:aab
```

- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## Development Workflow

### 1. Start Backend Server

```bash
cd backend
npm run start:dev
```

### 2. Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

### 3. Sync and Run on Emulator

```bash
# In a new terminal
cd frontend
npm run cap:sync:development
npm run cap:open android
```

### 4. Run on Emulator from Android Studio

1. Open Android Studio
2. Open the `android` folder
3. Select your emulator
4. Click Run

## Production Deployment

### Google Play Store (AAB)

1. Build the AAB:
```bash
npm run build:capacitor:production
npm run cap:sync:production
npm run cap:build:aab
```

2. Upload the AAB to Google Play Console:
   - Location: `android/app/build/outputs/bundle/release/app-release.aab`

### Direct APK Distribution

1. Build the release APK:
```bash
npm run build:capacitor:production
npm run cap:sync:production
npm run cap:build:release
```

2. Distribute the APK:
   - Location: `android/app/build/outputs/apk/release/app-release.apk`

## Network Configuration

### Development

The app uses `http://10.0.2.2:3000` for development (Android emulator localhost mapping).

### Production

Production builds use bundled assets and connect directly to your production API URL configured in `.env.production`.

## Security Notes

1. **HTTPS Only:** Production builds enforce HTTPS connections
2. **Certificate Pinning:** Consider implementing certificate pinning for additional security
3. **Keystore Security:** Never commit keystore files or passwords
4. **Environment Variables:** Never commit actual `.env` files with secrets
5. **ProGuard:** Release builds are minified and obfuscated

## Troubleshooting

### Build Errors

**Error: JAVA_HOME not set**
```bash
# Set JAVA_HOME to your JDK 17 installation
export JAVA_HOME=/path/to/jdk-17
```

**Error: Cannot find module**
```bash
# Install dependencies
npm install
```

### Network Issues

**ERR_CONNECTION_REFUSED**
- Ensure backend server is running
- Check API URL in environment configuration
- Verify network security config allows the domain

### Signing Issues

**Error: Keystore not found**
- Ensure `keystore.properties` exists in `android/` folder
- Verify the path to your keystore file is correct

## Version Management

Update version in `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 2  // Increment for each release
    versionName "1.0.1"  // Semantic version
}
```

## Testing

### On Emulator

```bash
# Start emulator
emulator -avd your_emulator_name

# Build and install
npm run cap:build:debug
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### On Physical Device

1. Enable USB debugging on device
2. Connect device via USB
3. Build and install:
```bash
npm run cap:build:release
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Continuous Integration

Example GitHub Actions workflow for automated builds:

```yaml
name: Build Android

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'
      - name: Install dependencies
        run: npm ci
      - name: Build production
        run: npm run build:capacitor:production
      - name: Sync Android
        run: npm run cap:sync:production
      - name: Build Release AAB
        run: npm run cap:build:aab
      - name: Upload AAB
        uses: actions/upload-artifact@v3
        with:
          name: app-release
          path: android/app/build/outputs/bundle/release/app-release.aab
```

## Support

For issues or questions, refer to:
- Capacitor Documentation: https://capacitorjs.com/docs
- Android Build Guide: https://developer.android.com/studio/build
- Next.js Deployment: https://nextjs.org/docs/deployment
