# Copilot Instructions for Veriq

## Project Overview

Veriq is a production-quality SaaS platform for discovering and verifying active LinkedIn prospects.

The system consists of:

- Chrome Extension (Manifest V3)
- Express Backend
- Modular extraction pipeline
- Verification pipeline
- Activity intelligence pipeline
- Documentation-first architecture

This repository is NOT a prototype.

Every change should improve maintainability, scalability, and reliability.

---

# Development Workflow

Before writing code:

1. Read the relevant documentation.
2. Understand the existing architecture.
3. Modify only the necessary files.
4. Preserve module boundaries.
5. Update documentation if architecture changes.

Never skip these steps.

---

# Architecture Rules

Always preserve the modular architecture.

Each module should have one responsibility.

Do not move responsibilities between modules.

Prefer extending existing modules instead of creating new ones.

Avoid unnecessary abstractions.

Avoid duplicate logic.

Avoid unrelated refactoring.

Never rename files unless explicitly instructed.

---

# Documentation Rules

Documentation is the source of truth.

Always consult the relevant documentation before implementing changes.

Relevant documentation includes:

- docs/README.md
- docs/architecture/*
- docs/modules/*

If architecture changes:

- update the affected documentation
- keep documentation synchronized with implementation

---

# Coding Standards

Always:

- write production-quality code
- keep functions small
- keep files organized
- write readable code
- preserve existing naming conventions
- preserve existing message flow
- preserve backward compatibility unless instructed otherwise

Avoid:

- large functions
- duplicated code
- unnecessary comments
- premature optimization

---

# Module Responsibilities

Background Script

- Coordinates extension workflow
- Routes messages
- Communicates with backend

Content Script

- Detects LinkedIn page types
- Responds to runtime messages
- Coordinates extraction
- Never owns business logic

Search Scanner

- Extracts visible search/company profiles

Verification Worker

- Coordinates verification lifecycle
- Opens profile pages
- Coordinates extraction

Identity Extractor

- Extract profile identity

Experience Extractor

- Extract work history

Activity Intelligence

- Analyze activity
- Produce structured activity signals

Backend

- Validation
- APIs
- Verification pipeline
- Future persistence layer

---

# Existing Architecture Must Be Preserved

Current flow:

LinkedIn Page

↓

Content Script

↓

Background Script

↓

Verification Worker

↓

Extractors

↓

Rich Profile Object

↓

Backend API

Future:

↓

Database

↓

Dashboard

---

# AI Behavior

Before making changes:

- explain the implementation plan
- identify files that will change
- avoid touching unrelated files

After making changes:

- summarize what changed
- mention architectural impact
- mention documentation impact

If requirements are unclear:

Ask questions.

Never guess.

---

# Git Workflow

Keep commits:

- small
- milestone-based
- easy to review

Never mix unrelated work into one commit.

---

# Quality Standard

Every change should make Veriq easier to maintain.

When in doubt:

Prefer simplicity over cleverness.

Preserve consistency across the repository.

Think like a senior software engineer working on a long-term SaaS product.