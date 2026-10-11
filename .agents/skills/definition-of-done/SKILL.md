---
name: definition-of-done
description: Final checklist to run before declaring any task finished or opening a PR: requirements, parity across apps, i18n and RTL, tests, env and docs, gates, and repetition review. Use when wrapping up work, or call it with /definition-of-done.
---

# Definition of done

Go through each item and fix gaps before reporting completion. State anything intentionally skipped.

1. **Requirements:** IDs addressed are named in the PR; plan status updated.
2. **Parity:** the feature works in every app listed for it (web, admin, mobile), or the gap is recorded.
3. **UI:** no hard-coded text; all locales added; checked in RTL and dark mode and in each theme.
4. **Contracts:** one shared schema used by form and route; no text inside schemas.
5. **Tests:** service unit tests beside the service; a route test per new endpoint; failing paths covered.
6. **Config:** env schema, every `.env.example` and docs updated for any new variable.
7. **Security basics:** no secrets in code or logs; generic errors where existence must not leak; inputs validated server-side.
8. **Repetition review:** did I copy something three times? If so, note the decision (refactor, generator, script) in the PR.
9. **Gates:** typecheck, lint, test all green.
10. **Summary:** list what changed, assumptions made and open questions.
