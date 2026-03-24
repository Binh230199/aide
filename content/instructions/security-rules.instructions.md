---
description: 'Security rules — OWASP Top 10 guardrails applied to all code'
applyTo: '**'
---

# Security Rules

These rules map to the OWASP Top 10 and must be followed in all code.

## A01 — Broken Access Control

- Every API endpoint must verify the caller has permission for the requested resource
- Never trust user-supplied IDs to scope data access — always check ownership in the database
- Default to denying access; grant permissions explicitly

## A02 — Cryptographic Failures

- Never store passwords in plaintext; use bcrypt (cost ≥ 12) or Argon2id
- All secrets (API keys, DB credentials) must live in environment variables, never in source code
- Use HTTPS for all external communications; do not disable TLS verification
- Generate cryptographically random tokens with `crypto.randomBytes()`, not `Math.random()`

## A03 — Injection

- Always use parameterized queries or ORM methods — never concatenate user input into SQL
- Validate and sanitize all user-supplied input at the system boundary
- Escape output in templates to prevent XSS; use a trusted template engine with auto-escaping

## A05 — Security Misconfiguration

- Remove debug endpoints, stack traces, and verbose error messages in production
- Set security headers: `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`
- Keep dependency versions up to date; run `npm audit` before each release

## A07 — Identification & Authentication Failures

- Implement rate limiting on login and sensitive endpoints
- Invalidate sessions on logout; rotate session tokens after privilege escalation
- Enforce MFA for admin-level operations

## A09 — Security Logging & Monitoring

- Log authentication events (login, logout, failed attempts) with timestamp and IP
- Log all authorization failures
- Never log passwords, tokens, or PII

## A10 — Server-Side Request Forgery (SSRF)

- Validate and allowlist URLs before making server-side HTTP requests
- Block requests to `localhost`, private IP ranges (10.x, 172.16-31.x, 192.168.x), and link-local addresses
- Do not forward raw user-supplied URLs to internal services
