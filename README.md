# NestJS Application with Request Context and Cron Jobs

This NestJS application implements the requested functionality for managing request context and cron job execution.

> **🇺🇦 [Українська документація](README.uk.md)**

## Features

### Task 1: Request Entry Point
- Single entry point that returns a unique request identifier as `executionId`
- Global context module using AsyncLocalStorage (ALS) to manage per-request context
- Request ID generated using UUID v4
- ID retrieved from context and returned in response

### Task 2: Cron Job Execution
- Cron job that runs every 30 minutes
- Logs a unique execution identifier
- Universal context decorator for Cron execution duration
- Context accessible via dedicated service
- Uses ALS to manage Cron execution context
- Execution ID generated using UUID v4
- ID retrieved from context and logged to console

## Project Structure

```
src/
├── config/
│   ├── configuration.ts         # Environment configuration
│   └── config.module.ts        # Configuration module
├── context/
│   ├── context.interface.ts    # Request context interface
│   ├── context.service.ts      # Context service with ALS
│   ├── context.middleware.ts   # Middleware for request context
│   └── context.module.ts       # Context module
├── cron/
│   ├── cron.service.ts         # Cron job service
│   └── cron.module.ts          # Cron module
├── app.controller.ts            # Main controller
├── app.module.ts               # Main module
└── main.ts                     # Application entry point
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.example .env
# Edit .env file with your configuration
```

3. Build the application:
```bash
npm run build
```

4. Start the application:
```bash
npm run start:dev
```

## Usage

### Request Entry Point
- **Endpoint**: `GET /`
- **Response**: `{ "executionId": "uuid-v4-string" }`
- Each request gets a unique execution ID stored in the context

### Cron Job
- Runs automatically every 30 minutes
- Generates a unique execution ID for each run
- Logs the execution ID to the console
- Uses the same context mechanism as HTTP requests

## Technical Details

- **AsyncLocalStorage**: Used to manage per-request and per-cron execution context
- **UUID v4**: Generates unique identifiers for each execution
- **Middleware**: Automatically sets context for all incoming requests
- **Context Service**: Provides access to execution context throughout the application
- **Cron Scheduling**: Uses `@nestjs/schedule` for cron job management
- **Environment Configuration**: Uses `@nestjs/config` for centralized configuration management

## Environment Variables

The application uses the following environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Application environment |
| `PORT` | `3000` | Server port |
| `LOG_LEVEL` | `info` | Logging level |
| `CRON_ENABLED` | `true` | Enable/disable cron jobs |
| `CRON_INTERVAL` | `30` | Cron job interval in minutes |
| `CONTEXT_TIMEOUT` | `30000` | Context timeout in milliseconds |

## Development Tools

### Code Formatting and Linting

Format code with Prettier:
```bash
npm run format
```

Lint code with ESLint:
```bash
npm run lint
```

Check code formatting without changes:
```bash
npm run format:check
```

Check linting without auto-fix:
```bash
npm run lint:check
```

### Git Hooks with Husky

The project uses Husky to enforce code quality standards:

- **Pre-commit**: Automatically runs linting, formatting checks, and tests
- **Commit-msg**: Validates commit message format (conventional commits)
- **Prepare-commit-msg**: Adds branch information to commit messages
- **Post-merge**: Runs dependency updates and cleanup after merges

Install Husky hooks:
```bash
npm run prepare
# or manually
chmod +x .husky/* && chmod +x .husky/_/*
```

Skip hooks temporarily:
```bash
HUSKY=0 git commit -m "your message"
```

### Available Scripts

```bash
# Development
npm run start:dev          # Start in development mode
npm run start:debug        # Start with debug enabled
npm run build              # Build the application

# Code Quality
npm run lint               # Lint and auto-fix
npm run lint:check         # Lint without auto-fix
npm run format             # Format code with Prettier
npm run format:check       # Check formatting without changes

# Testing
npm test                   # Run tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests

# CI/CD
npm run ci                 # Run all checks for CI
npm run precommit          # Run pre-commit checks
npm run clean              # Clean build artifacts

# Git Hooks
npm run prepare            # Install Husky hooks
```

## CI/CD Pipeline

The project includes a comprehensive GitHub Actions workflow:

### Workflow Jobs

1. **Test Job** (runs on Node.js 18.x and 20.x):
   - Code checkout
   - Dependency installation
   - Linting and formatting checks
   - Unit tests execution
   - Coverage reporting

2. **Security Job**:
   - Security audit with npm audit
   - Dependency outdated check

3. **Build Job** (main branch only):
   - Application build
   - Artifact upload

### Workflow Triggers

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### Coverage Reporting

Test coverage is automatically uploaded to Codecov for tracking code quality metrics.

## Testing

Run the tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:cov
```

## Contributing

1. Follow the conventional commit format for commit messages
2. Ensure all tests pass before committing
3. Run `npm run ci` locally to verify CI checks
4. Use feature branches for new development

### Commit Message Format

```
<type>(<scope>): <description>

Examples:
feat: add new user authentication
fix(auth): resolve login issue
docs: update README
test: add unit tests for user service
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert` 