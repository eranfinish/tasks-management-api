# Task Management API - Project Documentation

## Overview
A RESTful API for task management built with NestJS, TypeORM, and PostgreSQL. This project is part of a Full Stack bootcamp and provides complete CRUD operations for managing tasks with validation, security, and database integration.

## Tech Stack

### Core Framework
- **NestJS** v11.0.1 - Progressive Node.js framework
- **TypeScript** v5.7.3 - Type-safe JavaScript
- **Node.js** - Runtime environment

### Database
- **PostgreSQL** - Relational database
- **TypeORM** v0.3.27 - Object-Relational Mapping
- **pg** v8.16.3 - PostgreSQL client

### Validation & Transformation
- **class-validator** v0.14.2 - Decorator-based validation
- **class-transformer** v0.5.1 - Object transformation

### API Documentation
- **Swagger** (@nestjs/swagger) v11.2.1 - OpenAPI documentation
- **swagger-ui-express** v5.0.1 - Swagger UI

### Code Quality
- **ESLint** v9.18.0 - Linting
- **Prettier** v3.4.2 - Code formatting
- **typescript-eslint** v8.20.0 - TypeScript ESLint rules

### Testing
- **Jest** v30.0.0 - Testing framework
- **Supertest** v7.0.0 - HTTP testing

## Project Structure

```
task-managemet-api/
├── src/
│   ├── app.controller.ts          # Main app controller
│   ├── app.service.ts              # Main app service
│   ├── app.module.ts               # Root module
│   ├── main.ts                     # Application entry point
│   │
│   ├── task/                       # Task module
│   │   ├── entities/
│   │   │   └── task.entity.ts      # Task entity (TypeORM)
│   │   ├── dtos/
│   │   │   ├── create-task.dto.ts  # Create task DTO
│   │   │   ├── update-task.dto.ts  # Update task DTO
│   │   │   ├── filter-tasks.dto.ts # Filter tasks DTO
│   │   │   └── index.ts            # Barrel export
│   │   ├── enums/
│   │   │   ├── task-status.enum.ts # Task status enum
│   │   │   └── task-priority.enum.ts # Task priority enum
│   │   ├── task.controller.ts      # Task endpoints
│   │   ├── task.service.ts         # Task business logic
│   │   └── task.module.ts          # Task module definition
│   │
│   ├── user/                       # User module
│   │   └── entities/
│   │       └── user.entity.ts      # User entity (TypeORM)
│   │
│   └── common/                     # Shared utilities
│       ├── guards/
│       │   └── api-key.guard.ts    # API key authentication
│       └── interceptors/
│           ├── logging.interceptor.ts     # Request logging
│           └── transform.interceptor.ts   # Response transformation
│
├── test/                           # E2E tests
├── .env                            # Environment variables
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── nest-cli.json                   # NestJS CLI config
└── eslint.config.mjs              # ESLint configuration
```

## Database Schema

### Task Entity
| Field | Type | Description |
|-------|------|-------------|
| id | number | Primary key (auto-generated) |
| title | string | Task title |
| description | text | Task description |
| assignedTo | User | Many-to-One relation to User |

### User Entity
| Field | Type | Description |
|-------|------|-------------|
| id | number | Primary key (auto-generated) |
| name | string | User name |
| tasks | Task[] | One-to-Many relation to Tasks |

### Enumerations

**TaskStatus**
- `OPEN` - Task is open
- `IN_PROGRESS` - Task is in progress
- `DONE` - Task is completed

**TaskPriority**
- `LOW` - Low priority
- `MEDIUM` - Medium priority
- `HIGH` - High priority

## API Endpoints

### Tasks

#### Get All Tasks
```
GET /tasks
```
Returns all tasks from the database.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Sample Task",
    "description": "Task description",
    "assignedTo": { "id": 1, "name": "User Name" }
  }
]
```

#### Get Task by ID
```
GET /tasks/:id
```
Returns a specific task by ID.

**Response:** `200 OK` | `404 Not Found`

#### Create Task
```
POST /tasks
```
Creates a new task.

**Request Body:**
```json
{
  "title": "Task Title",
  "description": "Task description (min 10 chars)",
  "status": "OPEN",
  "priority": "HIGH"
}
```

**Validation Rules:**
- `title`: Required, 3-100 characters
- `description`: Required, minimum 10 characters
- `status`: Must be one of: OPEN, IN_PROGRESS, DONE
- `priority`: Must be one of: LOW, MEDIUM, HIGH

**Response:** `201 Created`

#### Update Task
```
PATCH /tasks/:id
```
Updates an existing task (all fields optional).

**Request Body:**
```json
{
  "title": "Updated Title",
  "status": "IN_PROGRESS"
}
```

**Response:** `200 OK` | `404 Not Found`

#### Delete Task
```
DELETE /tasks/:id
```
Deletes a task.

**Response:** `204 No Content` | `404 Not Found`

## Security Features

### API Key Authentication
- API key guard available but currently disabled
- Configured via `API_KEY` environment variable
- Validates `x-api-key` header when enabled
- To enable: Uncomment `@UseGuards(ApiKeyGuard)` in task.controller.ts

### Validation
- Global ValidationPipe enabled
- Whitelist mode: removes unknown properties
- Transform mode: auto-converts types
- ForbidNonWhitelisted: rejects unknown properties

## Configuration

### Environment Variables (.env)
```env
# API Security
API_KEY=secret123

# Database Configuration
DB_HOST=localhost
DB_PORT=5434
DB_USERNAME=postgres
DB_PASSWORD=123456
DB_DATABASE=tasks_db
```

### Database Connection (app.module.ts)
```typescript
TypeOrmModule.forRoot({
  type: "postgres",
  host: "localhost",
  port: 5434,
  username: "postgres",
  password: "123456",
  database: "tasks_db",
  entities: [Task, User],
  synchronize: true  // ⚠️ Only for development!
})
```

## Features

### Request Logging
The `LoggingInterceptor` logs all incoming requests and responses with execution time:
```
→ GET /tasks
← GET /tasks - 45ms
```

### Response Transformation
The `TransformInterceptor` wraps responses in a consistent format.

### Swagger Documentation
Interactive API documentation available at:
```
http://localhost:3000/api
```

Features:
- Try out API endpoints
- View request/response schemas
- API key authentication support

## Scripts

```bash
# Development
npm run start:dev          # Start with hot-reload
npm run start:debug        # Start in debug mode

# Production
npm run build              # Build the project
npm run start:prod         # Run production build

# Code Quality
npm run format             # Format code with Prettier
npm run lint               # Lint and fix with ESLint

# Testing
npm test                   # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests
```

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Steps

1. **Clone the repository**
```bash
cd task-managemet-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup PostgreSQL Database**
```sql
CREATE DATABASE tasks_db;
```

4. **Configure environment**
Create `.env` file in the root directory with the configuration above.

5. **Run the application**
```bash
npm run start:dev
```

6. **Access the application**
- API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api

## Development Notes

### TypeORM Synchronize
```typescript
synchronize: true  // ⚠️ WARNING
```
- Currently set to `true` for development
- Automatically syncs database schema
- **MUST be disabled in production!**
- Can cause data loss

### Code Style
- Double quotes for strings
- 2 spaces indentation
- Trailing commas
- Enforced by Prettier + ESLint

### Relations
- Task → User: Many-to-One (each task has one assigned user)
- User → Tasks: One-to-Many (each user can have multiple tasks)

## Future Enhancements

Potential features to add:
- [ ] User authentication (JWT)
- [ ] Task filtering by status/priority
- [ ] Pagination for task lists
- [ ] Task due dates and reminders
- [ ] Task comments and attachments
- [ ] User roles and permissions
- [ ] Task assignment to multiple users
- [ ] Task history and audit logs
- [ ] Environment-based configuration module
- [ ] Migration scripts for production

## Troubleshooting

### Port 3000 already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Database connection failed
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database `tasks_db` exists
- Check port 5434 is not blocked

### ESLint/Prettier conflicts
```bash
npm run format  # Fix all formatting issues
```

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation
4. Ensure all tests pass
5. Run linting before committing

## License

UNLICENSED - Private project for bootcamp training

---

**Created for:** Full Stack Development Bootcamp
**Framework:** NestJS
**Database:** PostgreSQL with TypeORM
**Last Updated:** 2025
