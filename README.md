# SLC AI Tutor App

AI-powered tutoring application that enables students to practice conversations with AI tutors, receive real-time help, and get graded on their interactions.

## Overview

This application integrates with [OpenWebUI](https://github.com/open-webui/open-webui) to provide:

- **AI Chat Sessions** - Students interact with AI tutors for language/skill practice
- **Real-time Help** - Students can request contextual help during conversations
- **Automated Grading** - AI evaluates student performance and provides scores
- **Staff Dashboard** - Administrators can view all users and their chat histories

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Django REST Framework, Python 3.10+ |
| **Frontend** | React 18, Vite, TypeScript |
| **Auth** | JWT (Simple JWT) |
| **AI Integration** | OpenWebUI API |
| **Database** | PostgreSQL |
| **Web Server** | Caddy |
| **Containerization** | Docker, Docker Compose |

## Project Structure

```
├── backend/                 # Django REST API
│   ├── api/                # Main API app
│   │   ├── models.py       # User, Chat, ChatMessage models
│   │   ├── views.py        # API endpoints
│   │   ├── serializers.py  # DRF serializers
│   │   └── urls.py         # URL routing
│   └── backend/            # Django settings
├── frontend/               # React application
│   └── src/
│       ├── app/
│       │   ├── pages/      # Route pages
│       │   ├── components/ # Reusable components
│       │   ├── services/   # API clients
│       │   └── store/      # Redux state
│       └── assets/         # Images, JSON data
├── caddy/                  # Caddy web server config
├── docs/                   # Documentation
│   ├── modernization/      # Modernization planning
│   └── planning/           # Feature planning
└── scripts/                # Dev/CI scripts
```

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for frontend development)
- Python 3.10+ (for backend development)
- OpenWebUI instance (for AI functionality)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/eltanno/slc-ai-tutor-app-modernized.git
   cd slc-ai-tutor-app-modernized
   ```

2. **Copy environment files**
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```

3. **Start the database**
   ```bash
   ./start_dev_db.sh
   ```

4. **Run with Docker Compose**
   ```bash
   docker-compose up
   ```

   Or for development:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

### Manual Development (without Docker)

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/user/me/` | GET | Get logged-in user |
| `/api/users/` | GET | List all users (staff only) |
| `/api/chats/` | GET, POST | List/create chat sessions |
| `/api/chats/<id>/` | GET, PUT, DELETE | Chat CRUD |
| `/api/chats/<id>/send-message/` | POST | Send message to AI |
| `/api/chats/<id>/get-help/` | POST | Request help from AI |
| `/api/chats/<id>/grade/` | POST | Grade the chat session |

## Development Standards

This project follows strict development practices:

- **TDD** - Tests before implementation
- **Feature branches** - Never commit to main directly
- **Conventional commits** - `type(scope): description`
- **Pre-commit hooks** - Linting enforced on commit
- **90% test coverage** - Minimum requirement

See [docs/modernization/](docs/modernization/) for the modernization roadmap.

## Code Quality Tools

```bash
# Python linting
source .venv/bin/activate
ruff check . --fix

# JavaScript/TypeScript linting
npx eslint . --fix

# Run pre-commit on all files
pre-commit run --all-files
```

## Testing

### Backend Tests

The backend uses pytest with pytest-django. Tests are located in `backend/tests/`.

```bash
cd backend
source .venv/bin/activate

# Run all tests
pytest

# Run with coverage
pytest --cov=api --cov-report=term-missing

# Run specific test file
pytest tests/test_auth.py

# Run tests matching a pattern
pytest -k "test_login"
```

### Frontend E2E Tests

The frontend uses Playwright for end-to-end testing. Tests are located in `frontend/tests/e2e/`.

**Prerequisites:** The local dev environment (backend + frontend) must be running before running E2E tests.

```bash
cd frontend

# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run with interactive UI
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test auth.spec.ts

# Run tests with visible browser
npx playwright test --headed
```

## Modernization Status

This codebase is undergoing active modernization. Track progress:

- **Kanban Board**: [GitHub Project](https://github.com/users/eltanno/projects/5)
- **Assessment**: [docs/modernization/assessment.md](docs/modernization/assessment.md)
- **Test Plan**: [docs/modernization/characterization-tests.md](docs/modernization/characterization-tests.md)

## License

Proprietary - All rights reserved.
