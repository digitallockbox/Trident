#!/usr/bin/env bash
set -euo pipefail

ROOT="$(dirname "$0")/../.."

echo "Cleaning build artifacts..."
rm -rf "$ROOT/backend/dist"
rm -rf "$ROOT/frontend/dist"
rm -rf "$ROOT/shared/dist"

echo "Cleaning node_modules..."
rm -rf "$ROOT/backend/node_modules"
rm -rf "$ROOT/frontend/node_modules"
rm -rf "$ROOT/shared/node_modules"
rm -rf "$ROOT/node_modules"

echo "Clean complete."
