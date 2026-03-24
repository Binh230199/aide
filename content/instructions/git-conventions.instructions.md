---
description: 'Git workflow conventions — branch naming, commit messages, PR standards'
applyTo: '**'
---

# Git Conventions

## Branch Naming

```
<type>/<issue-id>-<short-description>
```

Examples:
- `feat/42-add-oauth-login`
- `fix/87-null-pointer-in-parser`
- `chore/update-dependencies`

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `hotfix`

## Commit Messages (Conventional Commits)

```
<type>(<scope>): <imperative short description>

[optional body — explain WHY, not WHAT]

[optional footer — BREAKING CHANGE: ..., Fixes #<issue>]
```

Rules:
- Subject line ≤ 72 characters
- Use imperative mood: "add feature", not "added feature"
- Body explains *why* the change was made, not *what* — code already shows the what

Examples:
```
feat(auth): add refresh-token rotation

Rotating tokens on each use limits the damage window if a token
is compromised. Implements RFC 6749 §10.4 recommendations.

Fixes #123
```

```
fix(parser): handle empty input without throwing

An empty string was reaching the regex engine and causing an
uncaught exception. Guard added at the entry point.
```

## Pull Request Standards

- Title mirrors the main commit message (Conventional Commits format)
- Description includes: What changed, Why it changed, How to test it
- Link to the related issue: `Closes #<id>`
- All CI checks must pass before merging
- Require at least one reviewer approval
- Squash-merge to keep the main branch history clean

## Branch Protection (main)

- Direct pushes to `main` are forbidden
- All changes must go through a reviewed PR
- Branch must be up-to-date before merging
