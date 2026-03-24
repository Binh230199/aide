# My Team Copilot (`aide`)

A VS Code extension that bundles AI agents, coding instructions, and system prompts for your development team. Install once — works across every workspace.

## Features

- **`@my-team` Chat Participant** — Chat with your team's AI assistant directly in VS Code Copilot Chat
  - `/review` — Code review following team standards (security, performance, readability)
  - `/plan` — Architecture planning and phased implementation breakdowns
  - `/test` — Generate unit tests with high coverage
  - `/debug` — Systematic root-cause analysis and targeted fixes

- **Auto-deployed Agents** — Bundled `.agent.md` files are automatically placed in the VS Code user prompts folder so Copilot finds them in every workspace

- **Cross-workspace Instructions** — Team coding standards, Git conventions, and security rules are deployed as instruction files that Copilot applies automatically

## Installation

### From `.vsix` (recommended for teams)

```bash
code --install-extension aide-1.0.0.vsix
```

Or: **Extensions** panel → `…` menu → **Install from VSIX…**

### From VS Code Marketplace

Search for **"My Team Copilot"** in the Extensions panel.

## Usage

### Chat Participant

Open Copilot Chat (`Ctrl+Alt+I`) and use `@my-team`:

```
@my-team /review  <paste code or attach file>
@my-team /plan    Add OAuth login for the admin dashboard
@my-team /test    <paste function to test>
@my-team /debug   TypeError: Cannot read property 'id' of undefined at user.service.ts:42
```

You can also chat freely without a slash command:

```
@my-team What's the best way to handle pagination in our REST API?
```

### Command Palette

| Command | Description |
|---------|-------------|
| `My Team Copilot: Deploy Agents & Instructions` | Copy agents/instructions to user prompts folder |
| `My Team Copilot: Refresh / Re-deploy All Content` | Remove and re-deploy all content (useful after update) |
| `My Team Copilot: List Deployed Resources` | Show what's currently deployed in the Output panel |
| `My Team Copilot: Remove Deployed Agents & Instructions` | Remove all deployed content |

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `myTeamCopilot.autoDeployAgents` | `true` | Auto-deploy on startup |
| `myTeamCopilot.participantModel` | `gpt-4.1` | Preferred language model |
| `myTeamCopilot.enableTelemetry` | `false` | Anonymous usage telemetry |

## Adding Custom Content

### New agent

Drop a `.agent.md` file in `content/agents/`:

```markdown
---
name: "My Custom Agent"
description: 'Does something specific'
tools: ["codebase", "search"]
---

Your agent system prompt here.
```

### New slash command

1. Add entry to `contributes.chatParticipants[0].commands` in `package.json`
2. Create `content/prompts/<command-name>.md` with the system prompt
3. Rebuild and re-package — no TypeScript changes needed

### New instruction file

Drop a `.instructions.md` file in `content/instructions/` with a YAML frontmatter `applyTo` pattern.

## Development

```bash
npm install          # Install dependencies
npm run watch        # Build in watch mode
# Press F5 in VS Code to launch Extension Development Host

npm test             # Run tests
npm run package      # Build .vsix
```

## Requirements

- VS Code ≥ 1.95.0
- GitHub Copilot (for `@my-team` chat participant)

## License

MIT
