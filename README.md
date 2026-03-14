# Birthday Reminder Service

This project is a backend application that stores user data (with birthdays) and uses a worker process to automatically send a "Happy Birthday" message at 9 AM in their local time zone on their birthday.

## Technology Stack

- **Backend Framework:** Node.js with ExpressJS
- **Language:** TypeScript
- **Database:** MongoDB (using Mongoose)
- **Scheduling/Worker:** node-cron
- **Containerization:** Docker & Docker Compose
- **Testing:** Jest & Supertest

## Architecture

The application follows Clean Architecture and Domain-Driven Design (DDD) principles:
- **Controllers** handle HTTP requests and input validation (using Joi).
- **Services** encapsulate the core business logic.
- **Repositories** manage data access and database operations.
- **Models** define Mongoose schemas and TypeScript interfaces.

## Project Structure

```
├── Dockerfile
├── docker-compose.yml
├── package.json
├── src
│   ├── app.ts                  # Express application setup
│   ├── server.ts               # API server entry point
│   ├── worker.ts               # Worker entry point
│   ├── controllers             # Request handlers & validation
│   ├── models                  # Mongoose models
│   ├── repositories            # Database access
│   ├── routes                  # Express routes
│   ├── services                # Business logic & Cron scheduling
│   └── utils                   # DB connection & utilities
└── tests
    ├── user.test.ts            # Unit tests for API endpoints
    └── worker.test.ts          # Unit tests for the cron worker
```

## Running the Application with Docker

Prerequisites: Make sure you have Docker and Docker Compose installed.

1. **Build and start the containers**
   ```bash
   docker-compose up --build
   ```
   This will spin up three containers:
   - `mongodb`: The MongoDB database
   - `api_service`: The Express REST API
   - `worker_service`: The node-cron scheduling worker

2. **Access the API**
   The API will be accessible at `http://localhost:3000`.

## API Documentation & Examples

### 1. Create a User
**POST** `/user`
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "birthday": "1990-05-15T00:00:00.000Z",
  "timezone": "America/New_York"
}
```

### 2. Get User by ID
**GET** `/user/:id`
Returns the user detail corresponding to the specific ID.

### 3. Update User
**PUT** `/user/:id`
```json
{
  "name": "Jane Updated",
  "timezone": "Asia/Jakarta"
}
```

### 4. Delete User
**DELETE** `/user/:id`
Removes the user from the database.

## Running Tests Locally

To run tests without Docker, you will need Node.js installed locally.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the tests:
   ```bash
   npm test
   ```
   Tests use `mongodb-memory-server` for a fast, isolated database during testing.

## Design Decisions & Assumptions
- **Database:** MongoDB was chosen to strictly fulfill the project requirements.
- **Validation:** `joi` is used directly inside the controller to provide strict validation on the incoming requests.
- **Worker/Scheduling:** Used `node-cron` scheduled to run every minute (`* * * * *`). It checks if the current time in the user's specific timezone matches 9:00 AM.
- **Timezone Support:** IANA timezone validation is performed correctly and local times are resolved utilizing `moment-timezone`.
