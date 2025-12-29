---
id: FEAT-XXX
title: [Feature Title]
status: draft
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
author: [Name]
priority: medium
---

# Feature: [Feature Name]

## Overview

Brief description of what this feature does and why it exists.

## Business Value

Explain the business value this feature provides:
- What problem does it solve?
- Who benefits from it?
- What are the success metrics?

## Requirements

### Functional Requirements

- [ ] Requirement 1: Description
- [ ] Requirement 2: Description
- [ ] Requirement 3: Description

### Non-Functional Requirements

- **Performance**: Response time, throughput, scalability targets
- **Security**: Authentication, authorization, data protection requirements
- **Usability**: User experience considerations
- **Reliability**: Uptime, error handling, recovery requirements
- **Maintainability**: Code quality, documentation standards

## Architecture

### High-Level Design

Describe the overall architecture approach:
- What components are involved?
- How do they interact?
- What patterns are being used?

### Technology Choices

- **Language/Framework**: [Choice] - Why?
- **Database**: [Choice] - Why?
- **External Services**: [List] - Why?

### Data Models

```python
# Example data model
class ExampleModel:
    id: int
    name: str
    created_at: datetime
```

### API Endpoints (if applicable)

```
POST /api/example
GET /api/example/{id}
PUT /api/example/{id}
DELETE /api/example/{id}
```

## Implementation Tasks

These will be broken into GitHub Issues after plan approval:

1. **Task 1**: Description
   - Subtask A
   - Subtask B

2. **Task 2**: Description
   - Subtask A
   - Subtask B

3. **Task 3**: Description
   - Subtask A
   - Subtask B

## Test Strategy

### Unit Tests

- Test 1: What it verifies
- Test 2: What it verifies
- Test 3: What it verifies

### Integration Tests

- Test 1: What system interaction it verifies
- Test 2: What system interaction it verifies

### End-to-End Tests (if applicable)

- Scenario 1: User workflow to test
- Scenario 2: User workflow to test

### Test Coverage Target

- Minimum 90% code coverage
- All edge cases covered
- All error conditions covered

## Dependencies

### Internal Dependencies

- Feature X must be completed first
- Module Y needs to be available

### External Dependencies

- Service A must be configured
- Library B must be installed

### Data Dependencies

- Database schema changes required
- Migration scripts needed

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|------------|-------------------|
| Risk 1 description | High/Medium/Low | High/Medium/Low | How we'll address it |
| Risk 2 description | High/Medium/Low | High/Medium/Low | How we'll address it |

## Open Questions

- [ ] Question 1: What needs to be decided?
- [ ] Question 2: What needs to be clarified?
- [ ] Question 3: What needs user input?

## Timeline Estimate

- Planning: X days
- Implementation: Y days
- Testing: Z days
- Total: X+Y+Z days

## References

- Link to related documentation
- Link to external resources
- Link to design mockups
- Link to API documentation

---

## Status History

| Date | Status | Notes |
|------|--------|-------|
| YYYY-MM-DD | draft | Initial plan created |
| YYYY-MM-DD | approved | User approved, ready for tickets |
| YYYY-MM-DD | in-progress | Development started |
| YYYY-MM-DD | completed | All tickets done and tested |
