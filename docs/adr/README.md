# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the Financbase Admin Dashboard project.

## What are ADRs?

Architecture Decision Records are documents that capture important architectural decisions made along with their context and consequences. They help:

- Understand why certain architectural choices were made
- Onboard new team members quickly
- Avoid revisiting decisions that were already made
- Track the evolution of the system architecture

## Format

Each ADR follows a standard format:

1. **Title**: A short, descriptive title
2. **Status**: Proposed, Accepted, Deprecated, or Superseded
3. **Context**: The situation that led to this decision
4. **Decision**: The architectural decision made
5. **Consequences**: The positive and negative consequences of the decision

## Naming Convention

ADRs are numbered sequentially and described with a short title:

- `0001-adr-title.md`
- `0002-another-decision.md`

## ADR Template

Use the template in `template.md` when creating new ADRs.

## Current ADRs

### 0001 - Use Next.js App Router
**Status**: Accepted  
**Date**: 2024-01-XX  
**Decision**: Use Next.js 15 App Router instead of Pages Router

### 0002 - Drizzle ORM for Database Access
**Status**: Accepted  
**Date**: 2024-01-XX  
**Decision**: Use Drizzle ORM instead of raw SQL or Prisma

### 0003 - Clerk for Authentication
**Status**: Accepted  
**Date**: 2024-01-XX  
**Decision**: Use Clerk for authentication instead of custom JWT implementation

### 0004 - Centralized Error Handling
**Status**: Accepted  
**Date**: 2024-01-XX  
**Decision**: Use ApiErrorHandler for consistent error responses across all API routes

### 0005 - TypeScript for Type Safety
**Status**: Accepted  
**Date**: 2024-01-XX  
**Decision**: Use TypeScript for all new code to ensure type safety

## Contributing

When making a significant architectural decision:

1. Create a new ADR using the template
2. Number it sequentially (next available number)
3. Document the decision, context, and consequences
4. Submit as part of your PR
5. Update this README with the new ADR

## References

- [ADR Template](template.md)
- [Architecture Decision Records on GitHub](https://github.com/joelparkerhenderson/architecture-decision-record)
- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
