# Proxicare

Proxicare is a web application for managing home healthcare coordination. It connects healthcare professionals with their patients, enabling appointment scheduling, prescription management, and act validation via QR code.

---

## Features

- User authentication via Auth0 (login, registration, onboarding)
- Dashboard for healthcare professionals and patients
- Appointment management (creation, listing, tracking)
- Prescription management linked to patients and healthcare acts
- QR code generation and scanning for validating healthcare acts on-site
- Patient profile management
- Structure (clinic/practice) management
- Role-based access control

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | Next.js 16, React 19, TypeScript, Tailwind CSS  |
| Backend    | Node.js, Express, TypeScript, Sequelize ORM     |
| Database   | PostgreSQL 16                                   |
| Auth       | Auth0                                           |
| Reverse proxy | Nginx                                        |
| Containers | Docker, Docker Compose                          |

---

## Project Structure

```
proxicare_v2/
├── front/          # Next.js frontend application
├── back/           # Express REST API
├── nginx/          # Reverse proxy configuration
├── deploy/         # SSL and deployment scripts
├── docker-compose.yml          # Main Compose file
└── docker-compose.prod.yml     # Production Compose file
```

---

## Getting Started

### Prerequisites

- Docker and Docker Compose
- An Auth0 tenant with a configured application and API

### Environment Variables

Create a `.env` file at the root of the project based on the following variables:

```env
# Auth0
AUTH0_SECRET=
AUTH0_BASE_URL=http://localhost:3001
AUTH0_ISSUER_BASE_URL=https://<your-tenant>.auth0.com
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_AUDIENCE=
AUTH0_DOMAIN=

# Database
DB_NAME=proxicare
DB_USER=proxicare
DB_PASSWORD=proxicare_password

# Ports (optional, defaults shown)
FRONT_PORT=3001
API_PORT=3000
DB_PORT=5432
```

### Launch with Docker

```bash
docker compose up -d
```

The frontend will be available at `http://localhost:3001` and the API at `http://localhost:3000`.

### Local Development (without Docker)

**Backend:**

```bash
cd back
npm install
npm run dev        # starts the API with hot reload on port 3000
npm run migrate    # run database migrations
npm run seed       # seed initial data
```

**Frontend:**

```bash
cd front
npm install
npm run dev        # starts Next.js on port 3001
```

### Running Tests

```bash
cd back
npm test           # run all tests
npm run coverage   # run tests with coverage report
```

---

## API Documentation

The API exposes a Swagger UI at `http://localhost:3000/api-docs` when the backend is running.

