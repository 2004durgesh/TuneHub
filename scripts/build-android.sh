#!/bin/bash
# Builds the release APKs (one per ABI) for the GitHub release: android/app/build/outputs/apk/release/
# Gradle bundles the JS itself (Expo's export:embed). Runs from release-it's after:bump hook.
set -euo pipefail

export NODE_ENV=production

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
  echo ""
  echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║${NC} ${YELLOW}🚀 $1${NC}"
  echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(node -p "require('$ROOT_DIR/package.json').version")"
OUT_DIR="$ROOT_DIR/android/app/build/outputs/apk/release"

print_step "BUILDING RELEASE APKS v$VERSION"
cd "$ROOT_DIR/android"
mkdir -p build
# Full output goes to a log: release-it runs this hook through exec(), which kills it past ~1MB of output
LOG_FILE="build/gradle-release.log"
echo "Full log: android/$LOG_FILE"
rm -f "$OUT_DIR"/tunehub-*.apk
if ! ./gradlew :app:assembleRelease >"$LOG_FILE" 2>&1; then
  tail -n 40 "$LOG_FILE"
  exit 1
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC} ${GREEN}✅ APKS READY: android/app/build/outputs/apk/release/${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════════════╝${NC}"
ls -1 "$OUT_DIR"/tunehub-*-v"$VERSION".apk
