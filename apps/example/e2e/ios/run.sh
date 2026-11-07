#!/bin/bash
# Usage: run.sh <simulator-udid> <screenshot-dir>. Needs Metro running; see the README.
set -eo pipefail
cd "$(dirname "$0")/../.."
ruby e2e/ios/add-target.rb
mkdir -p "$2"
LOG="$(mktemp)"
TEST_RUNNER_FERRULE_SHOTS="$2" xcodebuild test \
  -workspace ios/*.xcworkspace -scheme FerruleHarnessUITests \
  -destination "platform=iOS Simulator,id=$1" -derivedDataPath ios/build-uitests \
  CODE_SIGNING_ALLOWED=NO "${@:3}" | tee "$LOG"
# xcodebuild can report TEST SUCCEEDED having run nothing.
if ! grep -qE 'Executed [1-9][0-9]* tests?' "$LOG"; then echo 'FAILED: no tests ran.' >&2; exit 1; fi
