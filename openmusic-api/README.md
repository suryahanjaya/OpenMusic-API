# OpenMusic API

OpenMusic API is a backend service for managing music albums, songs, and playlists. This project has been enhanced with advanced features including Docker containerization, comprehensive testing, configuration management, and CI/CD.

## Features

- **RESTful API**: Built with Hapi framework.
- **Database**: PostgreSQL with query optimization (indexes).
- **Authentication**: JWT-based authentication.
- **Testing**: Unit and Integration tests using Jest and Supertest.
- **Containerization**: Docker and Docker Compose support.
- **Configuration**: Environment-specific configuration management.
- **Logging**: Structured logging with Winston.
- **CI/CD**: GitHub Actions workflow for automated testing and linting.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (if running locally without Docker)
- Docker & Docker Compose (optional, for containerized run)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd openmusic-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and update the values.
   ```bash
   cp .env.example .env
   ```

## Running the Application

### Local Development

1. Start PostgreSQL database.
2. Run migrations:
   ```bash
   npm run migrate up
   ```
3. Start the server:
   ```bash
   npm run start:dev
   ```

### Using Docker

1. Build and start containers:
   ```bash
   docker-compose up -d --build
   ```
   The API will be available at `http://localhost:5000`.

## Testing

Run unit and integration tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Configuration

Configuration files are located in `src/config/`.
- `development.js`: Local development settings.
- `production.js`: Production settings.
- `test.js`: Test environment settings.

The application automatically loads the correct configuration based on `NODE_ENV`.

## Logging

Logs are stored in the `logs/` directory.
- `combined.log`: All logs (info level and above).
- `error.log`: Error logs only.

## CI/CD

This project uses GitHub Actions for CI. The workflow is defined in `.github/workflows/ci.yml` and runs on every push and pull request to the `main` branch.
