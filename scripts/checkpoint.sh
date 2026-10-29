#!/usr/bin/env bash
# Commit everything, move to the branch of the current hackathon phase, push that branch and main.
# Usage: scripts/checkpoint.sh "commit message"
# On a feature branch it only commits and pushes that branch.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

now=$(date +%Y%m%d%H%M)
if   [ "$now" -lt 202610211615 ]; then target=phase/q1-andoya
elif [ "$now" -lt 202610220930 ]; then target=phase/q2
elif [ "$now" -lt 202610221245 ]; then target=phase/q3
elif [ "$now" -lt 202610221500 ]; then target=phase/q4
else target=phase/final
fi

current=$(git symbolic-ref --short HEAD)

git add -A
git diff --cached --quiet || git commit -q -m "${1:-checkpoint $(date '+%a %H:%M')}"

# Feature branches are pushed on their own; only phase branches feed main.
case "$current" in
  phase/* | main) ;;
  *)
    git push -q -u origin "$current"
    echo "checkpoint: $(git log -1 --format='%h %s') -> $current (feature branch, main untouched)"
    exit 0
    ;;
esac
if [ "$current" != "$target" ]; then
  if git show-ref --verify --quiet "refs/heads/$target"; then
    git merge-base --is-ancestor "$target" HEAD \
      || { echo "checkpoint: $target has diverged from HEAD, resolve by hand" >&2; exit 1; }
  fi
  git branch -f "$target" HEAD
  git switch -q "$target"
fi

git push -q origin "$target"
git push -q origin HEAD:main
git branch -f main HEAD
echo "checkpoint: $(git log -1 --format='%h %s') -> $target + main"
