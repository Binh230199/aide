# ADR-002: Deploy to VS Code User Prompts Folder

**Date**: 2026-03-24  
**Status**: Accepted

## Context

Copilot instruction files can live in three places:
1. `.github/` in the workspace (workspace-scoped, per-repo)
2. VS Code workspace settings JSON (per-workspace)
3. The VS Code user-level prompts folder (cross-workspace, roaming)

## Decision

Deploy agent and instruction files to the **user-level prompts folder**:

| Platform | Path |
|----------|------|
| Windows  | `%APPDATA%\Code\User\prompts\aide\` |
| macOS    | `~/Library/Application Support/Code/User/prompts/aide/` |
| Linux    | `~/.config/Code/User/prompts/aide/` |

Files are placed in an `aide/` sub-folder to avoid collisions with the user's own customizations.

## Consequences

**Positive:**
- Works in every workspace without any workspace-level configuration.
- Roams with VS Code settings sync (cross-machine).
- Clean separation: `aide/` sub-folder is clearly owned by this extension.

**Negative:**
- Requires write access to `%APPDATA%` (not an issue on standard developer machines).
- Platform path detection must be tested on all three OS families.
