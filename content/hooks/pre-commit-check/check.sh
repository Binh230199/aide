#!/usr/bin/env bash
# pre-commit-check/check.sh
# Lightweight quality gate — runs fast enough to not block the agent workflow.

set -euo pipefail

echo "🔍 Running pre-commit quality checks..."

# 1. Ensure no secrets are being committed
if command -v grep &>/dev/null; then
    if grep -rn --include="*.ts" --include="*.js" --include="*.json" \
        -E "(password|secret|api_key|apikey|private_key)\s*[:=]\s*['\"][^'\"]{8,}" \
        src/ 2>/dev/null | grep -v "test" | grep -v ".test."; then
        echo "❌ Potential secret detected in source files. Review before committing."
        exit 1
    fi
fi

# 2. TypeScript compile check (fast, no emit)
if command -v npx &>/dev/null && [ -f "tsconfig.json" ]; then
    echo "  Checking TypeScript..."
    npx tsc --noEmit --skipLibCheck 2>&1 | head -20
fi

echo "✅ Pre-commit checks passed."
