Backend Developer Technical Assessment
Deadline: 27-June-2026 (1:00 PM)
Overview
Build a scalable backend service using Node.js, TypeScript, Redis, and BullMQ.
The goal is to evaluate your ability to design production-ready backend systems rather than simply
creating REST endpoints.
---
Problem Statement
Create a File Processing Service.
Users should be able to submit jobs that simulate processing uploaded files.
The service should queue the jobs and process them asynchronously.
---
Technical Requirements
Required stack:
* Node.js
* TypeScript
* Express or Fastify
* Redis
* BullMQ
Bonus:
* AWS S3 integration
* Docker
* Unit tests
* Swagger/OpenAPI

---

Functional Requirements
1. Create Job
Endpoint:
POST /jobs
Request:
```json
{
"filename": "orders.csv",
"size": 1024
}
```
Response:
```json
{
"jobId": "...",
"status": "queued"
}
```

---
2. Queue Processing
Process jobs asynchronously using BullMQ.
Simulate processing by waiting 5–10 seconds.
After processing:
* mark job as completed
* save processing timestamp
Randomly fail around 20% of jobs to demonstrate retry handling.
Retries:
* 3 attempts
* exponential backoff
---
3. Job Status
Endpoint:
GET /jobs/:id
Example response:
```json

{
"jobId": "...",
"status": "completed",
"createdAt": "...",
"completedAt": "...",
"attempts": 1
}
```
Possible statuses:
* queued
* active
* completed
* failed
---
4. Queue Statistics
Endpoint:
GET /stats
Return:
```json
{
"waiting": 5,
"active": 2,
"completed": 15,
"failed": 3
}
```

---
5. Logging
Log:
* Job started
* Job completed
* Job failed
* Retry attempts
---
AWS Bonus
If you have AWS experience:
Create an endpoint that generates a pre-signed S3 upload URL or any other alternative .
Example:
POST /upload-url

Return:
```json
{
"uploadUrl": "...",
"key": "uploads/file.csv"
}
```
Actual uploads are not required.
---
Docker
Provide:
* Dockerfile
* docker-compose.yml
The application should run with:
```
docker compose up
```

---
README
Include:
* Installation
* Environment variables
* Running locally
* Running with Docker
* Architecture decisions
---
Evaluation Criteria
We will evaluate:
* Project structure
* TypeScript quality
* Clean architecture
* Error handling
* Redis/BullMQ usage
* Scalability considerations
* API design
* Code readability
* Documentation
* Git commit history
---

Bonus Points
* Authentication
* Rate limiting
* Request validation
* Unit tests
* Integration tests
* CI pipeline (GitHub Actions)
* Monitoring (Bull Board)
* Winston/Pino logging
* Environment configuration
---
Submission
Please submit:
* GitHub repository
* README
* Instructions to run the project