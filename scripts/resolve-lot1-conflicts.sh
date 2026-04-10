#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/resolve-lot1-conflicts.sh ours
#   ./scripts/resolve-lot1-conflicts.sh theirs

MODE="${1:-ours}"
if [[ "$MODE" != "ours" && "$MODE" != "theirs" ]]; then
  echo "Usage: $0 [ours|theirs]"
  exit 1
fi

FILES=(
  "src/app/(dashboard)/requests/page.tsx"
  "src/app/(dashboard)/approvals/page.tsx"
  "src/app/(dashboard)/employees/page.tsx"
  "src/app/(dashboard)/teams/page.tsx"
  "src/app/(dashboard)/notifications/page.tsx"
  "src/app/(dashboard)/audit/page.tsx"
  "src/features/dashboard/hooks/use-dashboard-data.ts"
  "src/features/dashboard/components/absence-chart.tsx"
  "src/features/dashboard/components/team-availability-widget.tsx"
  "src/features/dashboard/components/upcoming-absences-timeline.tsx"
  "src/app/api/dashboard/overview/route.ts"
)

for f in "${FILES[@]}"; do
  if [[ -e "$f" ]]; then
    git checkout --"$MODE" "$f" || true
    git add "$f" || true
  fi
done

echo "Conflits LOT1 marqués résolus en mode '$MODE'."
echo "Terminer avec: git rebase --continue (ou git commit si merge)."
