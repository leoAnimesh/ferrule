#!/bin/bash
# Usage: run.sh <simulator-udid> <screenshot-dir>. Needs Metro running; see the README.
set -e
cd "$(dirname "$0")/../.."
ruby e2e/ios/add-target.rb
mkdir -p "$2"
TEST_RUNNER_FERRULE_SHOTS="$2" xcodebuild test \
  -workspace ios/*.xcworkspace -scheme FerruleHarnessUITests \
  -destination "platform=iOS Simulator,id=$1" -derivedDataPath ios/build-uitests \
  CODE_SIGNING_ALLOWED=NO "${@:3}"
