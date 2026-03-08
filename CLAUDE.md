# CLAUDE.md

## Git & PR workflow

- Every commit that lands on a feature branch **must have a corresponding open PR** before moving on.
- When committing work, check whether the current branch already has an open PR (`gh pr list --head <branch> --state open`).
  - If **yes** and the commit belongs to the same body of work, push to that branch — the PR updates automatically.
  - If **no** (or the previous PR was already merged), **create a new branch and open a new PR** for the new work.
- Never push orphan commits that sit on a branch with no open PR.
