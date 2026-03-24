# Changelog

All notable changes to the **My Team Copilot** extension are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and versions follow [Semantic Versioning](https://semver.org/).

---

## [1.0.0] — 2026-03-24

### Added

- `@my-team` Chat Participant with four slash commands:
  - `/review` — code review following OWASP + team conventions
  - `/plan` — phased architecture and implementation planning
  - `/test` — unit-test generation with AAA pattern
  - `/debug` — systematic root-cause analysis
- Auto-deployment of agents and instructions to the VS Code user prompts folder on startup
- Bundled agents: `reviewer`, `architect`, `debugger`
- Bundled instructions: `coding-standards`, `git-conventions`, `security-rules`
- Command palette integration: deploy, undeploy, list, refresh
- `Implementation Planner` skill with reusable plan template
- GitHub Actions CI/CD pipeline (ci.yml + release.yml)
- Full test suite covering deployer, promptLoader, and extension activation
