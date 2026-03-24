# ADR-003: Use esbuild for Bundling

**Date**: 2026-03-24  
**Status**: Accepted

## Context

VS Code extensions must bundle their Node.js dependencies into a single file for fast activation and `.vsix` packaging. Common options: `webpack`, `esbuild`, `rollup`, tsc-only.

## Decision

Use **esbuild** as the bundler.

## Rationale

| Criterion | webpack | esbuild | rollup |
|-----------|---------|---------|--------|
| Build speed | Slow (5-30s) | Fast (<500ms) | Medium |
| Config complexity | High | Low | Medium |
| VS Code support | Official template | Community best-practice | Manual |
| Tree-shaking | Yes | Yes | Best-in-class |

esbuild produces a single CJS bundle that VS Code can activate instantly, and the `esbuild.js` script remains under 100 lines.

## Consequences

- Production build runs with `--production` flag (minified, no source maps).
- Watch mode rebuilds in <200ms on file change.
- `vscode` module is declared `external` (provided by the host).
- Test bundles are built separately with source maps and no minification.
