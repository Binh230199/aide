# Implementation Plan: <Feature Name>

**Date**: YYYY-MM-DD  
**Author**: <Name>  
**Issue / Ticket**: #<id>  
**Status**: Draft | In Review | Approved

---

## Overview

> One paragraph describing what the feature does, who uses it, and why it's needed.

---

## Architecture

```
[Describe key components and data flow here]

UserRequest → API Layer → Service Layer → Repository → Database
```

---

## Phase 1: <Foundation / Setup> (est. <S/M/L>)

| Task | File(s) | Complexity | Notes |
|------|---------|------------|-------|
| Create DB migration | `db/migrations/001_add_feature.sql` | Low | |
| Add repository layer | `src/repositories/featureRepo.ts` | Medium | |
| Unit test repository | `src/repositories/featureRepo.test.ts` | Low | |

---

## Phase 2: <Business Logic> (est. <S/M/L>)

| Task | File(s) | Complexity | Notes |
|------|---------|------------|-------|
| Implement service | `src/services/featureService.ts` | Medium | |
| Unit test service | `src/services/featureService.test.ts` | Low | |

---

## Phase 3: <API / UI> (est. <S/M/L>)

| Task | File(s) | Complexity | Notes |
|------|---------|------------|-------|
| Add API endpoint | `src/routes/feature.ts` | Low | |
| Integration test | `test/integration/feature.test.ts` | Medium | |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| | Low/Med/High | Low/Med/High | |

---

## Testing Strategy

- **Unit tests**: cover all service and repository methods
- **Integration tests**: test API endpoint end-to-end with a test database
- **E2E** (if applicable): cover the happy path through the UI

---

## Rollback Plan

> Describe how to safely revert this change if a critical issue is discovered after deployment.

---

## Open Questions

- [ ] Question 1?
- [ ] Question 2?
