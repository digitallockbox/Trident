#!/usr/bin/env bash
set -euo pipefail

ROOT="$(dirname "$0")/../.."

bash "$ROOT/scripts/maintenance/clean.sh"

echo "Reinstalling dependencies..."
cd "$ROOT" && npm install
cd "$ROOT/shared" && npm install
cd "$ROOT/backend" && npm install
cd "$ROOT/frontend" && npm install

echo "Reset complete."
