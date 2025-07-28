#!/bin/bash
set -e

export DISABLE_ESLINT=true
export DISABLE_TYPE_CHECK=true
export SKIP_TYPE_CHECK=true

echo "🔧 Building FUSAF website with TypeScript checks disabled..."

# Force disable TypeScript checking
export NEXT_TELEMETRY_DISABLED=1

# Run Next.js build with all checks disabled
npx next build --no-lint || bunx next build --no-lint || next build
