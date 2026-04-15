#!/bin/bash
set -euo pipefail

# Only run in remote Claude Code (web) sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo '{"async": true, "asyncTimeout": 300000}'

# Install Node.js dependencies
npm install
