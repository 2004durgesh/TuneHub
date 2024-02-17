#!/bin/bash

# Bundle JavaScript code
echo "Bundling JavaScript code........................................................................."
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# Change the current directory to the android directory of the project.
echo "Changing directory to android........................................................................."
cd android

# The following commands use Gradle, a build tool for Android, to build the APK.

# assembleDebug: Builds the debug APK. The debug APK is signed with a debug key and it has debugging enabled.
echo "Building debug APK........................................................................."
./gradlew assembleDebug 

# assembleRelease: Builds the release APK. The release APK is signed with the release key.
echo "Building release APK........................................................................."
./gradlew assembleRelease 

echo "Bundling release APK........................................................................."
./gradlew bundleRelease 

echo "Installing release APK........................................................................."
./gradlew installRelease

echo "All tasks completed successfully........................................................................."