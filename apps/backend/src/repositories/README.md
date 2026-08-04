# Repositories

This folder contains persistence implementations.

Goal:

Services
↓
Repository
↓
Persistence

Current implementation:
- In-memory repository

Future implementation:
- PostgreSQL repository

Services should depend on repository modules instead of directly accessing persistence implementations.

This keeps controllers, services, and API contracts unchanged when the persistence layer changes.