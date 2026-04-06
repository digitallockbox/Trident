#!/usr/bin/env bash
set -euo pipefail

ROOT="$(dirname "$0")/../.."

echo "Running backend tests..."
cd "$ROOT/backend" && npm test

echo "Running frontend tests..."
cd "$ROOT/frontend" && npm test

echo "All tests complete."
