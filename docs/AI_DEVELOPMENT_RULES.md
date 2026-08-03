# AI Development Rules

This is the first document every AI assistant must read before modifying Veriq.

## Development Workflow

Idea
↓
Architecture
↓
Documentation
↓
Review
↓
Implementation
↓
Tests
↓
Regression Checklist
↓
Manual Verification
↓
Commit

## Mandatory Rules

- Never guess LinkedIn DOM.
- Capture HTML first.
- Investigate before modifying code.
- Update documentation before implementation.
- Read relevant module documentation first.
- One milestone per commit.
- Preserve public API unless a documented migration exists.
- Keep `content.js` thin.
- Business logic belongs in modules.
- Prefer semantic selectors.
- Avoid LinkedIn CSS classes.
- If debugging, identify the root cause before editing code.
- Never merge debugging logs.
- Run the regression checklist before every commit.

## AI Workflow

Before editing code:

1. Read `docs/README.md`
2. Read this file
3. Read relevant module documentation
4. Read `dependency-map.md` if architecture changes
5. Only then implement

If implementation gets stuck:

Do not guess.

Determine which module owns the behavior.

Read its documentation first.

Then inspect code.

## Human Workflow

- Every architecture change requires a documentation update.
- Every new module requires module documentation.
- Every new folder requires `README.md`.
- Every completed milestone requires a commit.

