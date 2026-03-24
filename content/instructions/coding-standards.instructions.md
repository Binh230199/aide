---
description: 'Team coding standards — automatically applied to all files'
applyTo: '**'
---

# Team Coding Standards

## Naming Conventions

- `camelCase` for variables, functions, and method names
- `PascalCase` for classes, interfaces, type aliases, and enums
- `UPPER_SNAKE_CASE` for module-level constants
- `kebab-case` for file and directory names
- Boolean variables should start with `is`, `has`, `can`, or `should` (e.g. `isLoading`, `hasError`)

## Code Style

- Prefer `const` over `let`; avoid `var`
- Use early returns to avoid deep nesting — max 2 levels of conditional nesting per function
- Keep functions focused on a single responsibility; aim for ≤ 30 lines
- Use explicit types in TypeScript; avoid `any`
- Prefer named exports over default exports for better refactoring support

## Error Handling

- Always handle errors explicitly — never silently swallow `catch` blocks
- Throw `Error` objects with descriptive messages, not plain strings
- Use `Result`-style patterns or explicit `throws` documentation for expected errors
- Log errors at the boundary where they are caught, not where they propagate

## Comments

- Comment the *why*, not the *what* — code should be self-documenting
- Remove `// TODO` and `// FIXME` comments before merging to `main`
- JSDoc comments are required on exported functions and classes

## Testing

- Every new function should have accompanying unit tests
- Test file names mirror the source file: `foo.ts` → `foo.test.ts`
- Use descriptive test names: `"should <expected behavior> when <condition>"`

## Git

- Commit messages follow Conventional Commits: `type(scope): short description`
  - Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
- Each commit should represent a single logical change
- No large "mega-commits" mixing unrelated changes
