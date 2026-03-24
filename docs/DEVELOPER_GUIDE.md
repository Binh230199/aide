# Developer Guide

## Prerequisites

- Node.js 20+
- npm 10+
- VS Code 1.95+
- (Optional) GitHub Copilot for testing the chat participant

## Setup

```bash
git clone <repo>
cd aide
npm install
```

## Development Workflow

```bash
# Build + watch mode (rebuilds on every file save)
npm run watch

# Then press F5 in VS Code to launch the Extension Development Host
# This opens a second VS Code window with the extension loaded
```

The Extension Development Host reloads automatically when `dist/extension.js` changes.

## Project Structure

```
aide/
├── src/                    TypeScript source
│   ├── extension.ts        Entry point — activate/deactivate
│   ├── participant.ts      @my-team Chat Participant handler
│   ├── deployer.ts         Copies files to user prompts folder
│   ├── promptLoader.ts     Reads system prompts from content/
│   ├── commands.ts         Command palette registrations
│   └── constants.ts        Shared constants (IDs, paths, keys)
│
├── content/                Bundled AI content
│   ├── agents/             .agent.md files
│   ├── instructions/       .instructions.md files
│   ├── prompts/            System prompts for chat commands
│   ├── skills/             SKILL.md + assets
│   └── hooks/              hooks.json + scripts
│
├── test/
│   ├── runTest.ts          VS Code test runner launcher
│   └── suite/
│       ├── index.ts        Mocha suite entry
│       ├── extension.test.ts
│       ├── deployer.test.ts
│       ├── promptLoader.test.ts
│       └── participant.test.ts
│
├── docs/
│   └── decisions/          Architecture Decision Records
│
└── dist/                   Build output (git-ignored)
```

## Adding a New Slash Command

1. Register the command in `package.json` → `contributes.chatParticipants[0].commands`:
   ```json
   { "name": "mycommand", "description": "Does something useful" }
   ```
2. Create `content/prompts/mycommand.md` with the system prompt.
3. Rebuild. The `participant.ts` handler auto-discovers prompts by command name.

## Adding a New Agent

1. Create `content/agents/<name>.agent.md` with YAML frontmatter + system prompt.
2. The `deployer.ts` auto-discovers all `*.agent.md` files in `content/agents/`.
3. Rebuild and re-package.

## Running Tests

```bash
npm test
```

Tests run inside a VS Code Extension Development Host via `@vscode/test-electron`. A display server (Xvfb) is required on Linux CI — see `.github/workflows/ci.yml`.

## Packaging

```bash
npm run package
# → aide-1.0.0.vsix
```

Share the `.vsix` file with teammates or attach it to a GitHub Release.

## Releasing

```bash
git tag v1.0.1
git push origin v1.0.1
# GitHub Actions release.yml handles packaging and creating the GitHub Release
```

## Troubleshooting

### Extension does not deploy agents on startup

Check the Output panel (View → Output → select "My Team Copilot"):  
- The auto-deploy logs appear at activation.  
- If `APPDATA`/`HOME` is non-standard, the deploy path may be wrong. Run **"Deploy Agents & Instructions"** from the Command Palette and check the notification for the resolved path.

### @my-team says no language model available

Ensure GitHub Copilot is installed and you are signed in. Check **GitHub Copilot** in the statusbar.

### TypeScript errors in tests

The tests use `require()` to re-load modules with patched `process.env`. The `@types/node` package must be installed (`npm install`).
