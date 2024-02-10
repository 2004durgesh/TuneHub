#!/bin/bash

# Bundle JavaScript code
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# Change the current directory to the android directory of the project.
cd android

# The following commands use Gradle, a build tool for Android, to build the APK.

# assembleDebug: Builds the debug APK. The debug APK is signed with a debug key and it has debugging enabled.
./gradlew assembleDebug

# bundleRelease: Builds the release AAB (Android App Bundle). The AAB is a new Android app publishing format which makes it easier to deliver and install your app.
./gradlew bundleRelease

# installRelease: Installs the release APK on a running emulator or connected device.
./gradlew installRelease