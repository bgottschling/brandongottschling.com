# CLAUDE.md

## Git & PR workflow

- Every commit that lands on a feature branch **must have a corresponding open PR** before moving on.
- When committing work, check whether the current branch already has an open PR (`gh pr list --head <branch> --state open`).
  - If **yes** and the commit belongs to the same body of work, push to that branch — the PR updates automatically.
  - If **no** (or the previous PR was already merged), **create a new branch and open a new PR** for the new work.
- Never push orphan commits that sit on a branch with no open PR.
## Before Starting Work

**Always fetch and pull the latest changes before beginning any work on a repository.**
The owner codes across multiple environments. Branches may have been updated elsewhere since the last local session. Run `git fetch origin && git pull` (or rebase as appropriate) before making changes to avoid working on stale code.

## Stack

- Next.js 15 (App Router, Turbopack)
- React 19, TypeScript
- Tailwind CSS 3 + tailwindcss-animate
- framer-motion for animations
- pnpm for package management
- Content: MDX files in `/content/{blog,projects,research}/`

## Conventions

- Content types: blog, project, research — each has its own color theme (amber, cyan/blue, indigo/teal)
- Card component: `FancyCard` with `CardVariant` prop for type-based styling
- Animations respect `prefers-reduced-motion`
- Canvas animations use `IntersectionObserver` to pause when off-screen
