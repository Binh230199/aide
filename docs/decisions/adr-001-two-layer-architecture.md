# ADR-001: Two-Layer Architecture

**Date**: 2026-03-24  
**Status**: Accepted

## Context

Team members must manually copy `.agent.md`, `.instructions.md`, and SKILL.md files into`.github/` of every repository. This is error-prone, creates version drift, and conflicts with existing `.github/` structure.

## Decision

Build the extension with two independent layers:

1. **Chat Participant layer** — registers `@my-team` in Copilot Chat and handles prompts using bundled system prompt files.
2. **File Deployment layer** — on activation, copies agents and instructions to the VS Code *user-level* prompts folder (`%APPDATA%/Code/User/prompts/` on Windows) where Copilot discovers them cross-workspace.

## Consequences

**Positive:**
- Install once; works in every workspace with no per-repo setup.
- No conflict with `.github/` directories in existing repos.
- Agents and instructions update automatically when the extension is updated.

**Negative:**
- Files live in the user-level folder, so they aren't visible in the workspace file tree.
- Users need to run "Undeploy" to clean up (files are not removed on extension deactivation).
