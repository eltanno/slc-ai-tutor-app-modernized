# GitHub Copilot Instructions for SLC AI Tutor App

## Project Overview

This is a full-stack web application with a Django REST Framework backend and React + TypeScript frontend. The frontend is built and served by the Django application.

### Technology Stack

**Backend (Django)**
- Django 5.2.4
- Django REST Framework with JWT authentication (SimpleJWT)
- PostgreSQL database
- Python 3.x

**Frontend (React)**
- React 19.1.0 with TypeScript
- Vite for build tooling
- **Material-UI (MUI) (@mui/material) for ALL UI components** - Do not use custom HTML elements
- Redux Toolkit (@reduxjs/toolkit) with RTK Query for state management
- React Router for routing
- Formik for form handling with formik-mui integration

**Infrastructure**
- Docker & Docker Compose for containerization
- Caddy as reverse proxy
- Development and production configurations

## Project Structure

```
/backend                 # Django application
  /api                  # Main Django app
  /backend              # Django project settings
  manage.py             # Django management script
  requirements.txt      # Python dependencies

/frontend               # React application
  /src
    /app                # Main application code
      /components       # Reusable components
      /pages            # Page components
      /services         # API services (RTK Query)
      /store            # Redux store configuration
      /theme            # MUI theme configuration
      /types            # TypeScript type definitions
    constants.ts        # Application constants
  /dist                 # Built frontend (served by Django)
  package.json          # Node dependencies
  vite.config.ts        # Vite configuration
```

## Development Workflow

### Backend Development

1. **Django Code Location**: All Django code is in `./backend/`
2. **Settings**: Django settings are environment-driven via `.env` file
3. **Frontend Build Directory**: Django serves frontend from `../frontend/dist` (configurable via `DJANGO_FRONTEND_BUILD_DIR`)
4. **Development Server**: Use `./backend/start_dev.sh` to start Django dev server

### Frontend Development

1. **Source Code**: All React/TypeScript code is in `./frontend/src/`
2. **Build Output**: Frontend builds to `./frontend/dist/` which Django serves
3. **Development Server**: Use `./frontend/start_dev.sh` for Vite dev server
4. **API Base URL**: Configured via `VITE_API_BASE_URL` environment variable, defaults to current origin

### Building the Project

- Frontend must be built before Django can serve it in production
- Use `npm run build` in frontend directory
- Build script: `tsc -b && vite build`

## Coding Conventions

### Backend (Python/Django)

- **Models**: Define in `backend/api/models.py`
  - Use Django's built-in User model from `django.contrib.auth.models`
  - All models should have `__str__` method
  - Use `Meta` class for ordering and other options

- **Views**: Use Django REST Framework ViewSets and views in `backend/api/views.py`

- **Serializers**: Define in `backend/api/serializers.py`

- **URLs**: API routes in `backend/api/urls.py`
  - All API endpoints should be prefixed with `/api/`

- **Authentication**:
  - JWT tokens using SimpleJWT
  - All endpoints require authentication by default (REST_FRAMEWORK settings)
  - Token endpoint: `/api/token/` and `/api/token/refresh/`

### Frontend (TypeScript/React)

- **Components**:
  - Use functional components with hooks
  - Place reusable components in `/app/components/`
  - Place page components in `/app/pages/`
  - Use PascalCase for component files (e.g., `MyComponent.tsx`)

- **State Management**:
  - Use Redux Toolkit for global state
  - Use RTK Query for API calls (see `services/Api.ts`)
  - Local state with `useState` for component-specific state

- **API Services**:
  - All API calls should use RTK Query
  - Base API configuration in `services/Api.ts`
  - API automatically handles JWT token refresh on 401 errors
  - API base URL: `/api` (relative to current origin)

- **Types**:
  - Define TypeScript interfaces/types in `/app/types/`
  - Use strict typing - avoid `any` when possible

- **Routing**:
  - Define routes in `app/Routes.tsx`
  - Use React Router v7

- **Styling**:
  - **ALWAYS use Material-UI (MUI) components** - Never use plain HTML elements like `<div>`, `<button>`, `<input>`, etc. when MUI equivalents exist
  - Use MUI components: `Box`, `Button`, `TextField`, `Typography`, `Paper`, `Card`, `Grid`, `Container`, etc.
  - Theme configuration in `app/theme/theme.ts`
  - Emotion for styled components (@emotion/react, @emotion/styled)
  - Use MUI's `sx` prop for custom styling when needed

- **Forms**:
  - Use Formik for form handling
  - Use formik-mui for Material-UI integration

## API Communication

### Authentication Flow

1. Login returns `access` and `refresh` tokens
2. Access token sent in `Authorization: Bearer <token>` header
3. Tokens stored in Redux state and localStorage
4. Automatic token refresh on 401 responses (handled in `baseQueryWithReauth`)

### API Base Configuration

- Backend API endpoint: `/api/`
- Token endpoints: `/api/token/` (login), `/api/token/refresh/` (refresh)
- All API calls use RTK Query with automatic token handling

## Environment Variables

### Backend (.env)
- `DJANGO_SECRET_KEY` - Django secret key
- `DJANGO_DEBUG` - Debug mode (True/False)
- `DJANGO_ALLOWED_HOSTS` - Comma-separated allowed hosts
- `DJANGO_FRONTEND_BUILD_DIR` - Path to frontend build directory
- Database configuration variables

### Frontend (.env)
- `VITE_API_BASE_URL` - API base URL (defaults to window.location.origin)

## Docker & Deployment

- Development: Use `docker-compose.dev.yml`
- Production: Use `docker-compose.yml`
- Caddy serves as reverse proxy
- Frontend must be built before running production containers

## Common Tasks

### Adding a New Django Model
1. Add model to `backend/api/models.py`
2. Create serializer in `backend/api/serializers.py`
3. Create viewset in `backend/api/views.py`
4. Register URL in `backend/api/urls.py`
5. Run `python manage.py makemigrations` and `python manage.py migrate`

### Adding a New Frontend Page
1. Create page component in `frontend/src/app/pages/<page-name>/`
2. Add route in `frontend/src/app/Routes.tsx`
3. Create TypeScript types if needed in `frontend/src/app/types/`
4. If API calls needed, define in RTK Query service

### Adding a New API Endpoint
1. Update backend (see "Adding a New Django Model")
2. Frontend: Add endpoint to RTK Query API definition
3. Use generated hooks in components: `useGetXxxQuery`, `useCreateXxxMutation`, etc.

## Best Practices

### Backend
- Always use Django's built-in features (ORM, authentication, admin)
- Use DRF serializers for validation
- Keep business logic in models when appropriate
- Use environment variables for configuration
- Write migrations for schema changes

### Frontend
- Keep components small and focused
- Use TypeScript strictly - define proper types
- Avoid prop drilling - use Redux for global state
- Use RTK Query for all API calls - no manual fetch()
- Handle loading and error states in UI
- Use Material-UI components for consistency
- Follow React hooks rules

### General
- Keep backend and frontend concerns separated
- Frontend consumes backend API only - no direct database access
- Test API endpoints before integrating in frontend
- Use meaningful variable and function names
- Comment complex logic

## Testing

- Backend: Django tests in `backend/api/tests.py`
- Frontend: Test files should be co-located with components

## Notes for Copilot

- When suggesting Django code, assume DRF is being used
- When suggesting React code, use functional components with hooks
- Always include proper TypeScript types in frontend suggestions
- Suggest RTK Query endpoints for new API integrations
- Remember that the frontend build is served by Django, not separately
- **CRITICAL: Always use Material-UI (MUI) components for ALL UI elements** - Never suggest plain HTML elements
  - Use `Box` instead of `<div>`
  - Use `Button` instead of `<button>`
  - Use `TextField` instead of `<input>`
  - Use `Typography` instead of `<h1>`, `<p>`, etc.
- Authentication is JWT-based, not session-based
- Forms should use Formik with formik-mui components
