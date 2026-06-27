# KGtech File Processing Service

A production-ready **File Processing Service** built for the KGtech backend technical assessment. Users submit file-processing jobs that are queued via **BullMQ**, persisted in **MongoDB**, and processed asynchronously by a dedicated worker with retry handling and observability.

## Features

- **Async job processing** with BullMQ and Redis
- **MongoDB** as the source of truth for job data
- **REST API** with consistent response envelope
- **Retry strategy** — 3 attempts with exponential backoff
- **Simulated failures** (~20% random) to demonstrate retry handling
- **Structured logging** with Pino
- **Request validation** with Zod
- **Centralized error handling** with custom exception hierarchy
- **Swagger/OpenAPI** documentation at `/api/docs`
- **Bull Board** queue dashboard at `/admin/queues`
- **JWT authentication** (optional, env-controlled)
- **Rate limiting**, Helmet, CORS, compression
- **AWS S3 pre-signed upload URL** (bonus endpoint)
- **Unit & integration tests** with Jest and Supertest

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20.19.0+ |
| Language | TypeScript |
| API | Express.js |
| Database | MongoDB + Mongoose |
| Queue | BullMQ + Redis |
| Validation | Zod |
| Logging | Pino |
| Testing | Jest + Supertest |

## Architecture

```
Client → Express API → Services → Repositories → MongoDB
                              ↘ Queue Service → BullMQ → Redis
Worker Process → BullMQ Worker → Job Handler → MongoDB updates
```

**Design decisions:**

- **MongoDB** stores all job metadata (status, timestamps, attempts). BullMQ handles queue orchestration only.
- **Separate processes** for API (`server.ts`) and worker (`worker.ts`) enable independent horizontal scaling.
- **Clean Architecture** — controllers are thin; business logic lives in services; repositories abstract MongoDB.
- **Centralized messages** in `src/messages/en.ts` — no hardcoded response strings.

## Folder Structure

```
src/
├── app.ts                 # Express app factory
├── server.ts              # API entry point
├── worker.ts              # Worker entry point
├── config/                # Env, Redis, MongoDB, BullMQ, AWS, Swagger, Logger
├── controllers/           # HTTP handlers (thin)
├── services/              # Business logic
├── repositories/          # MongoDB data access
├── models/                # Mongoose schemas
├── routes/                # Route definitions
├── validators/            # Zod schemas + validation middleware
├── middlewares/           # Auth, errors, rate limit, request ID
├── queues/                # BullMQ queue service (producer)
├── workers/               # Worker bootstrap
├── jobs/                  # Job processor logic
├── exceptions/            # Custom error hierarchy
├── messages/              # Application messages (en.ts)
├── helpers/               # Response helper, async handler
├── types/                 # TypeScript types
├── interfaces/            # Repository/service contracts
├── utils/                 # Shared utilities
├── constants/             # Queue names, regex patterns
└── enums/                 # JobStatus, HttpStatus
```

## Installation

### Prerequisites

- Node.js 20.19.0+
- MongoDB 6+
- Redis 6.2+ (BullMQ recommended minimum; 5.0+ works with warnings)

### Setup

```bash
git clone <repository-url>
cd KGtech_task
npm install
cp .env.example .env   # Linux/macOS/Git Bash
# Edit .env with your configuration
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Environment Variables

See [`.env.example`](./.env.example) for all variables. Key settings:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | required |
| `REDIS_HOST` | Redis host | `127.0.0.1` |
| `REDIS_PORT` | Redis port | `6380` (use `6379` for native Linux/macOS Redis) |
| `RATE_LIMIT_WINDOW_MS` | Global rate-limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Max requests per IP per window (global) | `100` |
| `AUTH_ENABLED` | Require JWT on protected routes | `false` |
| `AUTH_USERNAME` / `AUTH_PASSWORD` | Login credentials when auth is enabled | `admin` / `admin123` |
| `JWT_SECRET` | JWT signing secret (min 16 chars) | dev default in schema |
| `JOB_FAILURE_RATE` | Simulated failure rate | `0.2` |
| `JOB_MAX_ATTEMPTS` | Max retry attempts | `3` |
| `WORKER_CONCURRENCY` | Parallel jobs per worker | `5` |
| `AWS_*` | S3 credentials and bucket for `/upload-url` | optional |

## Running Locally

### Option A — Docker Compose (infrastructure)

Start MongoDB and Redis via Docker Compose (requires Docker Desktop with WSL2/virtualization enabled):

```bash
docker compose up -d
```

Compose maps Redis to host port **6380** (to avoid conflicts with legacy Windows Redis 3.x on `6379`). Set in `.env`:

```env
REDIS_PORT=6380
```

MongoDB is exposed on `27017` as usual.

### Option B — Manual services

Ensure MongoDB and a Redis **6.2+** instance are running. On Windows, the `Redis.Redis` winget package ships Redis 3.0 and is **not** compatible with BullMQ — use Docker Compose, [Memurai Developer](https://www.memurai.com/), or the portable Redis 7 build under `tools/redis7/`.

Then run the app in **two terminals**:

```bash
# Terminal 1 — API server
npm run dev

# Terminal 2 — Worker
npm run dev:worker
```

Portable Redis 7 (Windows fallback, port 6380 — avoids BullMQ version warnings):

```powershell
tools\redis7\Redis-7.4.9-Windows-x64-msys2\redis-server.exe tools\redis7\redis-dev.conf
```

If the portable build is missing, download [Redis 7.4.9 for Windows (msys2)](https://github.com/redis-windows/redis-windows/releases/tag/7.4.9) and extract it to `tools/redis7/`.

Production build:

```bash
npm run build
npm start          # API
npm run start:worker  # Worker
```

## Swagger

OpenAPI documentation: **http://localhost:3000/api/docs**

## Bull Board

Queue monitoring dashboard: **http://localhost:3000/admin/queues**

## API Endpoints

All endpoints return a consistent JSON envelope:

```json
{
  "success": true,
  "message": "...",
  "data": { },
  "errors": [],
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

| Method | Endpoint | Auth when `AUTH_ENABLED=true` | Description |
|--------|----------|--------------------------------|-------------|
| `GET` | `/health` | No | Health check (API, Redis, MongoDB) |
| ~~`POST`~~ | ~~`/auth/login`~~ | — | ~~Get JWT token~~ *(route disabled)* |
| `POST` | `/jobs` | Yes | Create a processing job |
| `GET` | `/jobs/:id` | Yes | Get job status |
| `GET` | `/stats` | Yes | Queue statistics |
| `POST` | `/upload-url` | Yes | Generate S3 pre-signed upload URL |

### Create Job

`POST /jobs` is limited to **30 requests per minute per IP** (in addition to the global rate limit). Exceeding either limit returns **429 Too Many Requests**.

```bash
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{"filename": "orders.csv", "size": 1024}'
```

Returns **201 Created**. Response:

```json
{
  "success": true,
  "message": "Job queued successfully.",
  "data": { "jobId": "...", "status": "queued" },
  "errors": [],
  "meta": { "requestId": "...", "timestamp": "..." }
}
```

### Get Job Status

```bash
curl http://localhost:3000/jobs/{jobId}
```

### Queue Statistics

```bash
curl http://localhost:3000/stats
```

Response `data`:

```json
{
  "waiting": 5,
  "active": 2,
  "completed": 15,
  "failed": 3
}
```

### Authentication

JWT auth middleware is implemented but **`POST /auth/login` is currently disabled** in `src/routes/index.routes.ts`. To re-enable, uncomment the login route and imports.

When enabled, set `AUTH_ENABLED=true` in `.env`, obtain a token, and pass it on protected routes:

```bash
# Uncomment /auth/login in routes first, then:
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

curl http://localhost:3000/jobs/{jobId} \
  -H "Authorization: Bearer <token>"
```

### S3 Upload URL

Requires `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_S3_BUCKET` in `.env`.

```bash
curl -X POST http://localhost:3000/upload-url \
  -H "Content-Type: application/json" \
  -d '{"filename": "orders.csv", "contentType": "text/csv"}'
```

Response `data`:

```json
{
  "uploadUrl": "...",
  "key": "uploads/orders.csv"
}
```

## Testing

Run from the project root after `npm install`:

```bash
npm test
npm run test:coverage
```

Tests cover validators, utilities, repository layer, job handler logic, and API integration. Integration tests use in-memory MongoDB and mock Redis/BullMQ, so **MongoDB and Redis do not need to be running**.

On the first run, `mongodb-memory-server` may download a MongoDB binary (requires internet). Use **Node.js 20.19.0+** to avoid compatibility warnings from the test MongoDB binary.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start API in watch mode |
| `npm run dev:worker` | Start worker in watch mode |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled API (`dist/server.js`) |
| `npm run start:worker` | Run compiled worker (`dist/worker.js`) |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Run Prettier |

## Docker

[`docker-compose.yml`](./docker-compose.yml) starts **MongoDB 7** and **Redis 7** for local development:

```bash
docker compose up -d        # start infrastructure
docker compose down         # stop containers
docker compose logs -f redis
```

A `Dockerfile` for running the API and worker inside containers is not included yet — run `npm run dev` and `npm run dev:worker` on the host after starting Compose.

## Future Improvements

- `Dockerfile` and full `docker compose up` for API + worker containers
- GitHub Actions CI pipeline
- Prometheus metrics export
- Job cancellation endpoint
- Webhook notifications on job completion
- Pagination for job listing
- Redis caching for stats endpoint

## License

MIT
