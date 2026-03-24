---
name: "Implementation Planner"
description: 'Skill for creating detailed, phased implementation plans with task breakdown tables and risk assessment'
---

# Implementation Planner Skill

Use this skill when you need to produce a structured implementation plan for a feature or change.

## Process

1. Understand the requirement (ask one clarifying question if needed)
2. Explore the relevant parts of the codebase
3. Design the solution
4. Break work into phases with a task table
5. Assess risks

## Template

See `templates/plan-template.md` for the standard output structure.

## Rules

- Each phase must be independently deliverable (can be reviewed and merged on its own)
- Tasks should be small enough to complete in ≤ 1 day of focused work
- Always include a Testing Strategy section
- Always include a Rollback Plan for risky changes
