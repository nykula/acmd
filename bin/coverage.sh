#!/bin/bash
# Runs tests and writes an HTML coverage report.

dir="$(realpath "$(dirname "$0")/..")"

rm -rf "$dir"/coverage

# Gjs coverage uses absolute paths.
gjs \
  --coverage-prefix="$dir"/src \
  --coverage-output="$dir"/coverage \
  "$dir"/bin/test.js

genhtml -o "$dir"/coverage "$dir"/coverage/coverage.lcov
