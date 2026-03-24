# ADR-004: No Hard Dependency on GitHub Copilot

**Date**: 2026-03-24  
**Status**: Accepted

## Context

The `@my-team` chat participant requires GitHub Copilot. However, the File Deployment layer (deploying agents/instructions) does not.

VS Code extensions can declare `extensionDependencies` to force installation of another extension. This would break installation for users who do not have Copilot.

## Decision

Set `extensionDependencies: []` — **do not hard-depend on GitHub Copilot**.

The chat participant gracefully handles the case where no language model is available by showing an informative message instead of crashing.

## Consequences

**Positive:**
- The extension installs cleanly for all users.
- Users without Copilot still benefit from the deployed agents/instructions (visible in other AI tools that support `.agent.md` and `.instructions.md`).
- No confusing "you must also install Copilot" install-time dialog.

**Negative:**
- `@my-team` chat commands silently explain the limitation at runtime rather than at install time.
- We must defensively handle `vscode.lm.selectChatModels()` returning an empty array.
