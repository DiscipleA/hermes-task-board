# Reject empty tasks with accessible validation feedback

AI-assisted demonstration planning artifact. No feature implementation is included.

## Acceptance criteria
- [ ] Reject empty and whitespace-only titles without changing counts or consuming IDs.
- [ ] Associate visible validation feedback with the input, keep focus, and clear errors after recovery.
- [ ] Trim valid titles; add regression coverage; keep the independent search fix out of this branch.

## Test plan
Add behavior tests first, observe failure, implement only the approved enhancement, and rerun the full baseline suite.

## Status
Draft planning only. Waiting for owner authorization; the maintenance job must leave this branch unchanged.
