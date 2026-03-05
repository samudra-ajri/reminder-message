# Birthday Greeting Message App

An automated birthday messaging application built with TypeScript, ExpressJS, PostgreSQL, Redis, and BullMQ. This service automatically sends a "Happy Birthday" message to users precisely at 9:00 AM in their local time zone.

## Architecture & Features

This project implements Clean Architecture and Domain-Driven Design principles while strictly avoiding over-engineering:
- **Clean Layers:** Clear separation concerns utilizing `Controller`, `Service`, and `Repository` layers.
- **Dynamic Timezone Parsing:** Users specify their location's IANA timezone (e.g., `America/New_York`). The system dynamically resolves when it is 9:00 AM locally, correctly adjusting for Daylight Saving Time via `luxon`.
- **Message Queue & Retries:** Powered by BullMQ. Asynchronous execution guarantees performance scale. The external mocked Email API call utilizes exponential backoff for resilience against transient errors.
- **Idempotency & Recovery Mechanism:** Built to ensure duplicate messages are never sent. Uses a PostgreSQL `OutboxMessage` table with a UNIQUE constraint (`userId`, `eventType`, `eventYear`). If the server goes down, the Cron job will scan for missed birthdays (past 9 AM today) and retroactively send them upon recovery.
- **Avoiding N+1 execution:** The queries use strategic outer joins to identify correct users natively in PostgreSQL, instead of sequentially checking in memory.

## Tech Stack

- **Node.js**: Backend JavaScript runtime.
- **TypeScript**: Typed language.
- **Express.js**: REST API Framework.
- **PostgreSQL**: Primary Data Store.
- **Prisma (v6)**: Type-safe modern ORM.
- **Redis & BullMQ**: Lightning-fast message queue and worker execution.
- **Jest**: Unit testing framework.

---

## Prerequisites

- Node.js (v18+)
- PostgreSQL installed and running locally.
- Redis installed and running locally.

## Getting Started

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   A `.env` file should be present in the root directory. Ensure your `DATABASE_URL` is pointing to an active PostgreSQL database. Example:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/greeting?schema=public"
   REDIS_HOST="localhost"
   REDIS_PORT="6379"
   REDIS_PASSWORD=""
   PORT="3000"
   EXTERNAL_EMAIL_API_URL="https://email-service.digitalenvision.com.au/send"
   ```

3. **Start Required Services:**
   Ensure your local PostgreSQL and Redis servers are running.
   For Mac users, you can run Redis via Homebrew:
   ```bash
   brew services start redis
   ```
   Or to just run it in the foreground:
   ```bash
   redis-server
   ```

4. **Run Database Migrations:**
   Sync the current application schema to your Postgres database:
   ```bash
   npx prisma db push
   ```

5. **Start the Application:**
   This system is modularized into three services running concurrently. You can start them all parallel in development mode using:
   ```bash
   npm run dev
   ```

   *Alternatively, you can run them individually:*
   - `npm run dev:api` (Express Server for CRUD)
   - `npm run dev:worker` (BullMQ message execution worker)
   - `npm run dev:scheduler` (Hourly Cron Job scanner)

## API Endpoints

### 1. Create a User
**POST /api/user**

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "birthday": "1990-11-01",
  "location": "America/New_York"
}
```

### 2. Update a User
**PUT /api/user/:id**

Allows users to update their information. If the timezone changes, the 9 AM logic dynamically adjusts.

**Body:**
```json
{
  "location": "Australia/Melbourne"
}
```

### 3. Delete a User
**DELETE /api/user/:id**
Cascading automatically drops pending internal system Outbox messages.

## Testing

Jest is configured for testing business critical logic (like dynamic IANA timezone resolution). 

To run tests:
```bash
npm test
```
