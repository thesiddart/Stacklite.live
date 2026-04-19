#!/usr/bin/env sh
set -eu

OUT="codebase-tree.md"

{
  echo "# Stacklite Codebase Tree"
  echo
  echo "Auto-generated snapshot. Use this as the first-read map before implementation tasks."
  echo
  echo "Last generated: $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo
  echo "## Refresh Command"
  echo
  echo "\`\`\`bash"
  echo "npm run tree:update"
  echo "\`\`\`"
  echo
  echo "## Workflow"
  echo
  echo "- Run npm run tree:update after any feature that adds, removes, or moves files/folders."
  echo "- Read codebase-tree.md (repo root) before implementation tasks."
  echo
  echo "## Tree"
  echo
  echo "\`\`\`text"
  find . -maxdepth 4 \( -path './.git' -o -path './node_modules' -o -path './.next' -o -path './dist' -o -path './coverage' \) -prune -o -print | sed 's#^./##' | sort
  echo "\`\`\`"
} > "$OUT"
