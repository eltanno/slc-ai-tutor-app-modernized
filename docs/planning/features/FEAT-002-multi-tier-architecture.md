---
id: FEAT-002
title: Multi-Tier Project Architecture (Monorepo)
status: draft
created: 2025-12-26
updated: 2025-12-26
author: AI Agent
priority: high
type: architecture
---

# Multi-Tier Project Architecture (Monorepo)

## Overview

Define a comprehensive, opinionated structure for 3-tier applications (frontend, backend, database) that maintains existing development standards (planning-first, TDD, linting, GitFlow) while supporting containerized development with Docker.

**Default Stack:**
- **Frontend**: React (TypeScript)
- **Backend**: Django (Python)
- **Database**: PostgreSQL (containerized, Django handles migrations)

## Business Value

- **Consistency**: Single structure for all multi-tier projects
- **Efficiency**: Agents can work seamlessly across full stack
- **Quality**: Same standards (TDD, linting) apply to all tiers
- **Developer Experience**: One command (`docker-compose up`) for local development
- **Atomic Changes**: Feature branches can span multiple tiers
- **Maintainability**: Monorepo keeps code synchronized and reduces coordination overhead

## Requirements

### Functional Requirements

1. **Support 3-Tier Applications**
   - Frontend (web UI)
   - Backend (API/business logic)
   - Database (persistence layer)

2. **Maintain Single-Codebase Compatibility**
   - Projects can be single-tier OR multi-tier
   - Same tooling works for both

3. **Containerization**
   - Each tier has its own Dockerfile
   - Docker Compose for local development
   - Production-ready container configuration

4. **Independent Deployment**
   - Each tier can be deployed separately
   - Or deployed together as a unit

5. **Tier-Specific Tooling**
   - Frontend: ESLint, Stylelint, frontend framework tools
   - Backend: Language-specific linters (Ruff for Python, ESLint for Node.js)
   - Database: Migration tools, seed scripts

### Non-Functional Requirements

1. **Consistency**: All tiers follow same code quality standards
2. **Performance**: Smart CI/CD only tests/builds changed tiers
3. **Scalability**: Structure works for small and large teams
4. **Maintainability**: Clear separation of concerns
5. **Documentation**: Each tier has its own README
6. **Testing**: Comprehensive testing at all levels (unit, integration, E2E)

## Architecture Decision: Monorepo vs Polyrepo

### Decision: **Monorepo** (Single Repository)

**Rationale:**
- ✅ Agents can work across full stack without switching contexts
- ✅ Atomic commits for features spanning multiple tiers
- ✅ Shared tooling (`scripts/`, linting configs) benefits all tiers
- ✅ Single `.cursorrules` ensures consistency
- ✅ Docker Compose handles local development elegantly
- ✅ Planning documents can span multiple tiers naturally
- ✅ Version synchronization is automatic (no dependency hell)
- ✅ Simpler for most use cases

**When Polyrepo might be better:**
- Large teams with strict tier ownership
- Different deployment schedules per tier (rare)
- Tiers in completely different tech stacks requiring different CI/CD
- Strict security boundaries between tiers

## Proposed Directory Structure

**Django + React + PostgreSQL Stack:**

```
project/
├── frontend/                  # React application (TypeScript)
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API clients (Django REST API)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Frontend utilities
│   │   ├── styles/           # Global styles
│   │   ├── types/            # TypeScript types
│   │   └── config/           # Frontend configuration
│   ├── tests/
│   │   ├── unit/             # Component unit tests (Jest/Vitest)
│   │   ├── integration/      # API integration tests
│   │   └── e2e/              # Frontend E2E tests (Playwright/Cypress)
│   ├── public/               # Static assets
│   ├── Dockerfile            # Multi-stage build (dev/prod)
│   ├── .dockerignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── .eslintrc.js          # React-specific rules
│   ├── .stylelintrc.json
│   └── README.md
│
├── backend/                   # Django application (Python)
│   ├── src/                  # Django project
│   │   ├── apps/             # Django apps
│   │   │   ├── accounts/     # User management
│   │   │   ├── api/          # Django REST Framework APIs
│   │   │   └── core/         # Core app (shared models, utils)
│   │   ├── config/           # Django settings
│   │   │   ├── settings/
│   │   │   │   ├── base.py   # Base settings
│   │   │   │   ├── dev.py    # Development settings
│   │   │   │   └── prod.py   # Production settings
│   │   │   ├── urls.py
│   │   │   └── wsgi.py
│   │   └── manage.py
│   ├── tests/
│   │   ├── unit/             # Django unit tests
│   │   ├── integration/      # API integration tests
│   │   └── e2e/              # Backend E2E tests
│   ├── requirements/         # Python dependencies
│   │   ├── base.txt          # Base requirements
│   │   ├── dev.txt           # Development requirements
│   │   └── prod.txt          # Production requirements
│   ├── Dockerfile            # Multi-stage build (dev/prod)
│   ├── .dockerignore
│   ├── ruff.toml             # Python linting
│   ├── pytest.ini            # Pytest configuration
│   └── README.md
│
├── data/                      # Docker volume mount for PostgreSQL data
│   └── .gitkeep              # Keep directory in git (data/ in .gitignore)
│
├── shared/                    # Shared code (optional)
│   ├── types/                # Shared TypeScript types
│   └── api-schema/           # API schema/contracts (OpenAPI)
│
├── scripts/                   # Infrastructure code
│   ├── github/               # GitHub API utilities
│   ├── quality/              # Linting, pre-PR checks
│   ├── docker/               # Docker helper scripts
│   │   ├── build_all.sh      # Build all containers
│   │   ├── test_all.sh       # Run all tests
│   │   ├── migrate.sh        # Run Django migrations
│   │   └── clean.sh          # Clean Docker artifacts
│   └── deploy/               # Deployment scripts
│
├── docs/                      # Documentation
│   ├── architecture/
│   ├── api/                  # API documentation
│   ├── planning/
│   └── guides/
│       ├── getting-started.md
│       ├── frontend-react.md
│       ├── backend-django.md
│       └── docker-guide.md
│
├── tests/                     # Cross-tier integration tests
│   └── e2e/                  # Full-stack E2E tests
│       ├── user-flows/       # Complete user journeys
│       └── fixtures/         # Test data/fixtures
│
├── .github/
│   └── workflows/
│       ├── frontend.yml      # React CI
│       ├── backend.yml       # Django CI
│       └── integration.yml   # Full-stack tests
│
├── docker-compose.yml         # Local development
├── docker-compose.prod.yml    # Production-like
├── .env.example              # All environment variables
├── .cursorrules
├── .gitignore                # Include data/* (keep .gitkeep)
├── README.md
└── QUICKSTART.md
```

**Key Changes for Django:**
- ✅ **No `database/` folder** - Django handles migrations via `python manage.py migrate`
- ✅ **`data/` folder** - For PostgreSQL Docker volume (gitignored except `.gitkeep`)
- ✅ **Django app structure** - Multiple apps under `backend/src/apps/`
- ✅ **Settings split** - Base, dev, prod configs
- ✅ **Django REST Framework** - For API endpoints

## Key Design Principles

### 1. Each Tier is Self-Contained

**Why:**
- Clear separation of concerns
- Independent deployment capability
- Easier to reason about
- Can be extracted to separate repo if needed

**How:**
- Each tier has its own `src/`, `tests/`, `Dockerfile`
- Each tier has tier-specific dependencies
- Each tier has its own README with setup instructions
- Each tier can be run independently in Docker

### 2. Shared Tooling at Root

**Why:**
- Consistent quality standards across all tiers
- Single source of truth for workflows
- Reduced duplication

**How:**
- `scripts/` directory used by all tiers
- Root `.cursorrules` applies to all code
- Shared pre-commit hooks
- Shared GitHub Actions workflows

### 3. Docker-First Development

**Why:**
- Consistent environments (dev, test, prod)
- No "works on my machine" issues
- Easy onboarding for new developers
- Matches production deployment

**How:**
- Each tier has optimized Dockerfile
- `docker-compose.yml` for local development
- One command to start everything: `docker-compose up`
- Hot reloading in development
- Separate compose files for different environments

### 4. Testing Strategy

**Feature-Dependent Approach:**
- **Always**: Unit tests for all new code
- **Feature-Dependent**: E2E tests for user-facing features
- **Priority**: Fast feedback loop with unit tests, comprehensive E2E for critical flows

**Tier-Specific Tests:**

**Frontend (React):**
- **Unit**: Component tests with Jest/Vitest + React Testing Library
- **Integration**: API integration tests (mocked backend)
- **E2E**: User flow tests with Playwright/Cypress (feature-dependent)

**Backend (Django):**
- **Unit**: Model, serializer, utility tests with pytest
- **Integration**: Django REST API endpoint tests
- **E2E**: Full API workflow tests (feature-dependent)

**Cross-Tier Tests:**
- Root `tests/e2e/` for full-stack scenarios
- Run after all tier tests pass
- Test complete user journeys (login, CRUD operations, etc.)

**Test Pyramid:**
```
        /\
       /  \    E2E (few, feature-dependent, slow)
      /____\
     /      \  Integration (some, medium speed)
    /________\
   /          \ Unit (many, fast, always required)
  /__________\
```

**Django-Specific Testing:**
- Use `pytest-django` for Django tests
- Test database: Separate test DB created/destroyed per run
- Fixtures: Django fixtures for test data
- Coverage: Minimum 90% for unit tests

### 5. CI/CD Strategy

**Smart Pipeline Execution:**
```yaml
# Only run frontend tests if frontend changed
if: contains(github.event.commits.*.modified, 'frontend/')

# Only build backend if backend changed
if: contains(github.event.commits.*.modified, 'backend/')
```

**Pipeline Stages:**
1. **Lint**: Run linters for changed tiers
2. **Test**: Run tests for changed tiers
3. **Build**: Build Docker images for changed tiers
4. **Integration**: Run cross-tier tests if multiple tiers changed
5. **Deploy**: Deploy changed tiers

## Environment Variables Structure

**Unified `.env` for Django + React + PostgreSQL:**

```bash
# GitHub Integration (used by scripts)
GITHUB_API_KEY=your_token_here
GITHUB_OWNER=your_username
GITHUB_REPO=your_repo
GITHUB_PROJECT_NUMBER=1

# Frontend (React) Configuration
FRONTEND_PORT=3000
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_ENV=development

# Backend (Django) Configuration
BACKEND_PORT=8000
DJANGO_SETTINGS_MODULE=config.settings.dev
DJANGO_SECRET_KEY=your_django_secret_key_here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:3000

# Database (PostgreSQL) Configuration
DATABASE_URL=postgresql://django_user:django_pass@postgres:5432/django_db
POSTGRES_USER=django_user
POSTGRES_PASSWORD=django_pass
POSTGRES_DB=django_db
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Security
DJANGO_SECRET_KEY=your_secret_key_here
JWT_SECRET_KEY=your_jwt_secret_here

# External Services (optional)
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1
```

## Docker Compose Configuration

### Development Environment (`docker-compose.yml`)

**Django + React + PostgreSQL setup:**

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: development
    ports:
      - "${FRONTEND_PORT:-3000}:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8000/api
    volumes:
      - ./frontend/src:/app/src      # Hot reloading
      - ./frontend/public:/app/public
      - /app/node_modules            # Prevent override
    depends_on:
      - backend
    networks:
      - app-network
    stdin_open: true               # Keep container running
    tty: true

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development
    ports:
      - "${BACKEND_PORT:-8000}:8000"
    environment:
      - DJANGO_SETTINGS_MODULE=config.settings.dev
      - DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY}
      - DJANGO_DEBUG=True
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      - POSTGRES_HOST=postgres
    volumes:
      - ./backend/src:/app/src       # Hot reloading (Django runserver)
    depends_on:
      postgres:
        condition: service_healthy
    command: >
      sh -c "python manage.py migrate &&
             python manage.py runserver 0.0.0.0:8000"
    networks:
      - app-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=${POSTGRES_USER:-django_user}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-django_pass}
      - POSTGRES_DB=${POSTGRES_DB:-django_db}
    volumes:
      - ./data:/var/lib/postgresql/data  # Persistent data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-django_user}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  # Optional: Redis for caching/Celery
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - app-network

volumes:
  postgres-data:

networks:
  app-network:
    driver: bridge
```

### Production Environment (`docker-compose.prod.yml`)

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
      - REACT_APP_API_URL=https://api.yourdomain.com
    restart: unless-stopped
    networks:
      - app-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    ports:
      - "8000:8000"
    environment:
      - DJANGO_SETTINGS_MODULE=config.settings.prod
      - DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY}
      - DJANGO_DEBUG=False
      - DATABASE_URL=${DATABASE_URL}
    command: >
      sh -c "python manage.py migrate &&
             python manage.py collectstatic --noinput &&
             gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4"
    restart: unless-stopped
    depends_on:
      - postgres
    networks:
      - app-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres-data:
    driver: local

networks:
  app-network:
    driver: bridge
```

## Git Workflow for Multi-Tier

### Branch Naming Conventions

**Feature branches that span tiers:**
```
feature/user-authentication
  - frontend/src/pages/Login.tsx
  - backend/src/api/routes/auth.py
  - database/migrations/001_add_users_table.sql
```

**Tier-specific branches:**
```
feature/frontend-dark-mode
  - Only touches frontend/

feature/backend-caching
  - Only touches backend/

feature/database-indexing
  - Only touches database/
```

### Commit Strategy

**Atomic commits per tier:**
```bash
# Commit frontend changes
git add frontend/
git commit -m "feat(frontend): add login page UI"

# Commit backend changes
git add backend/
git commit -m "feat(backend): add authentication endpoint"

# Commit database changes
git add database/
git commit -m "feat(database): add users table migration"
```

**OR combined commit for tightly coupled changes:**
```bash
git add frontend/ backend/ database/
git commit -m "feat(auth): implement user authentication across stack

- Add login page UI (frontend)
- Add authentication API endpoint (backend)
- Add users table migration (database)"
```

### Testing Requirements

**Before creating PR, ALL must pass:**
- ✅ Linters for all changed tiers
- ✅ Unit tests for all changed tiers
- ✅ Integration tests for all changed tiers
- ✅ Cross-tier E2E tests if multiple tiers changed
- ✅ All Docker images build successfully

## Linting Strategy for Multi-Tier

### Pre-commit Hook Behavior

**Smart tier detection:**
```python
# Detect which tiers were modified
frontend_changed = any('frontend/' in f for f in staged_files)
backend_changed = any('backend/' in f for f in staged_files)

# Run appropriate linters
if frontend_changed:
    run_eslint('frontend/')
    run_stylelint('frontend/')

if backend_changed:
    if is_python_backend:
        run_ruff('backend/')
    elif is_node_backend:
        run_eslint('backend/')
```

### Tier-Specific Linting Configs

**Frontend:**
- `frontend/.eslintrc.js` (React/Vue/Angular specific rules)
- `frontend/.stylelintrc.json` (CSS/SCSS rules)
- `frontend/tsconfig.json` (TypeScript rules)

**Backend (Python):**
- `backend/ruff.toml` (Python linting)
- `backend/pyproject.toml` (Tool configs)

**Backend (Node.js):**
- `backend/.eslintrc.js` (Node.js specific rules)
- `backend/tsconfig.json` (TypeScript rules)

## Migration Path

### From Single-Tier to Multi-Tier

If a project starts as single-tier and grows:

**Current structure:**
```
project/
├── src/          # Backend code
├── tests/
└── scripts/
```

**Migration:**
```bash
# Create tier directories
mkdir -p frontend backend database

# Move existing code
mv src backend/
mv tests backend/

# Keep scripts/ at root (shared)
# scripts/ stays where it is

# Add new directories
mkdir -p frontend/src frontend/tests
mkdir -p database/migrations database/seeds

# Update paths in configs
# Update .cursorrules to reflect multi-tier
```

## Implementation Tasks

If this plan is approved, the following tasks would be created:

1. **Update `.cursorrules`**
   - Add multi-tier structure guidance
   - Add Docker workflow rules
   - Add tier-specific testing requirements

2. **Create Architecture Decision Record**
   - Document monorepo decision
   - Document structure rationale

3. **Create Docker Guide**
   - Local development with Docker Compose
   - Building and deploying containers

4. **Update Pre-commit Hooks**
   - Add tier detection logic
   - Run appropriate linters per tier

5. **Create Docker Helper Scripts**
   - `scripts/docker/build_all.sh`
   - `scripts/docker/test_all.sh`
   - `scripts/docker/clean.sh`

6. **Update Documentation**
   - Add multi-tier quick start to README
   - Create tier-specific guides

7. **Create Template Docker Compose Files**
   - Development environment
   - Production environment
   - Testing environment

8. **Update `.env.example`**
   - Add all tier-specific variables
   - Group by tier with comments

## Test Strategy

### Unit Tests (Each Tier)

**Frontend:**
- Component rendering tests
- Utility function tests
- State management tests

**Backend:**
- Service layer tests
- Model validation tests
- Utility function tests

**Database:**
- Migration up/down tests
- Seed data validation

### Integration Tests (Each Tier)

**Frontend:**
- API client integration
- Component interaction tests

**Backend:**
- API endpoint tests
- Database query tests

### E2E Tests (Cross-Tier)

**Full-stack scenarios:**
- Complete user registration flow
- Authentication flow
- Data CRUD operations
- Error handling across tiers

## Dependencies

**External:**
- Docker and Docker Compose
- Language runtimes per tier

**Internal:**
- Existing linting setup (Ruff, ESLint, Stylelint)
- Existing GitHub API integration
- Existing Git workflow (feature branches, PRs)

## Risks & Mitigation

### Risk 1: Monorepo becomes too large

**Mitigation:**
- Use `.dockerignore` to exclude unnecessary files from builds
- Smart CI/CD only tests changed tiers
- Can split to polyrepo if truly needed

### Risk 2: Different deployment schedules per tier

**Mitigation:**
- Each tier can be deployed independently
- Docker images are tier-specific
- Versioning strategy can differ per tier

### Risk 3: Merge conflicts across tiers

**Mitigation:**
- Tiers are well-separated (different directories)
- Conflicts should be rare
- When they occur, they're explicit and easy to resolve

### Risk 4: Tier dependencies become tangled

**Mitigation:**
- API contracts defined in `shared/schemas/`
- Clear interface boundaries (REST/GraphQL)
- Integration tests catch breaking changes

### Risk 5: Local development complexity

**Mitigation:**
- Docker Compose handles all complexity
- One command to start: `docker-compose up`
- Hot reloading in development
- Comprehensive docker-guide.md

## Success Criteria

- [ ] `.cursorrules` updated with multi-tier guidance
- [ ] Architecture decision documented
- [ ] Docker workflow documented
- [ ] Template structure clear and documented
- [ ] Agents understand when to use single vs multi-tier
- [ ] Existing single-tier projects remain unaffected

## Future Enhancements

- Kubernetes manifests for production deployment
- Service mesh for inter-tier communication
- Monitoring and observability stack (Prometheus, Grafana)
- Automated database backups and restore scripts
- Load testing across tiers

---

## Approval Status

**Status:** Draft - Awaiting user review

**User Feedback Received:**

1. ✅ **Monorepo structure** - Confirmed
2. ✅ **Tech stack** - Django (Python) + React (TypeScript) + PostgreSQL
3. ✅ **Database handling** - Django manages migrations (no `database/` folder needed)
4. ✅ **Docker strategy** - Docker Compose for local development
5. ✅ **Testing approach** - Unit tests always, E2E tests feature-dependent
6. ✅ **Data persistence** - `data/` folder for PostgreSQL Docker volume (gitignored)

**Remaining Questions:**

- 📋 `shared/` directory for TypeScript types/API schemas? (Optional, can add later)
- 📋 Additional services needed? (Redis shown in compose for caching/Celery)

**Next Steps After Approval:**
1. Update `.cursorrules` with multi-tier guidance ✅ (included in PR)
2. Create ADR for monorepo decision (future task)
3. User creates GitHub issues for implementation tasks (templates, guides, etc.)
