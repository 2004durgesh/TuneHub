#!/usr/bin/env node
// Copies the release version into app.json and the native projects and bumps the build number.
// Runs from release-it's after:bump hook, so the changes land in the release commit.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const resolve = (file) => path.join(root, file);
const version = process.argv[2] ?? require(resolve('package.json')).version;

if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version)) {
  console.error(`Not a semver version: ${version}`);
  process.exit(1);
}

const gradleFile = resolve('android/app/build.gradle');
let gradle = fs.readFileSync(gradleFile, 'utf8');
const buildNumber = Number(gradle.match(/versionCode\s+(\d+)/)[1]) + 1;
gradle = gradle
  .replace(/versionCode\s+\d+/, `versionCode ${buildNumber}`)
  .replace(/versionName\s+"[^"]*"/, `versionName "${version}"`);
fs.writeFileSync(gradleFile, gradle);

const plist = resolve('ios/tunehub/Info.plist');
const plistBuddy = (command) => execFileSync('/usr/libexec/PlistBuddy', ['-c', command, plist]);
plistBuddy(`Set :CFBundleShortVersionString ${version}`);
plistBuddy(`Set :CFBundleVersion ${buildNumber}`);

const appJsonFile = resolve('app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonFile, 'utf8'));
appJson.expo.version = version;
appJson.expo.android.versionCode = buildNumber;
appJson.expo.ios.buildNumber = String(buildNumber);
fs.writeFileSync(appJsonFile, `${JSON.stringify(appJson, null, 2)}\n`);

console.log(`Synced ${version} (build ${buildNumber}) to app.json, Android and iOS`);
