# JWT Authentication Guard Usage Guide

## Overview

Your application has a complete JWT authentication system with the `JwtAuthGuard` that validates Bearer tokens from the `Authorization` header.

## Components

### 1. JwtAuthGuard ([src/common/guards/jwt-auth.guard.ts](src/common/guards/jwt-auth.guard.ts:5))

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

This guard uses Passport JWT strategy to validate tokens from the Authorization header.

### 2. JWT Strategy ([src/auth/jwt.strategy.ts](src/auth/jwt.strategy.ts:10))

Extracts and validates the JWT token:
- Extracts token from `Authorization: Bearer <token>` header
- Validates token signature and expiration
- Loads user from database
- Attaches user info to `request.user`

## How to Use

### Method 1: Protect Entire Controller

Apply the guard to all routes in a controller:

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)  // 🔒 All routes protected
export class TaskController {
  @Get()
  getAllTasks(@Request() req) {
    // req.user contains { userId, username }
    return this.taskService.findAllByUser(req.user.userId);
  }
}
```

### Method 2: Protect Individual Routes

Apply the guard to specific routes only:

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('tasks')
export class TaskController {

  @Get('public')
  getPublicTasks() {
    // 🌍 Public route - no authentication required
    return this.taskService.findPublic();
  }

  @Get('my-tasks')
  @UseGuards(JwtAuthGuard)  // 🔒 Protected route
  getMyTasks(@Request() req) {
    return this.taskService.findAllByUser(req.user.userId);
  }
}
```

### Method 3: Global Guard (Optional)

To protect all routes by default, configure in `main.ts`:

```typescript
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply guard globally
  app.useGlobalGuards(new JwtAuthGuard());

  await app.listen(3000);
}
```

## Making Authenticated Requests

### 1. Login to Get Token

```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### 2. Use Token in Protected Requests

**Required Header Format:**
```
Authorization: Bearer <your_access_token>
```

**Example Request:**
```bash
GET http://localhost:3000/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Examples with Different Clients

#### Using cURL
```bash
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Using Postman
1. Go to **Authorization** tab
2. Select **Type: Bearer Token**
3. Paste your token in the **Token** field

#### Using Axios (JavaScript)
```javascript
const axios = require('axios');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

axios.get('http://localhost:3000/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

#### Using Fetch (JavaScript)
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

fetch('http://localhost:3000/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

## Authentication Flow

```
1. Client sends login credentials
   POST /auth/login { username, password }

2. Server validates and returns JWT token
   { access_token: "eyJ..." }

3. Client stores token (localStorage, cookie, etc.)

4. Client includes token in subsequent requests
   GET /tasks
   Authorization: Bearer eyJ...

5. JwtAuthGuard intercepts request
   - Extracts token from Authorization header
   - Validates token signature
   - Checks expiration
   - Loads user from database

6. If valid: Request proceeds with req.user populated
   If invalid: Returns 401 Unauthorized
```

## Accessing User Info in Controllers

When a request is authenticated, user info is available in `req.user`:

```typescript
@Get()
@UseGuards(JwtAuthGuard)
getMyTasks(@Request() req) {
  console.log(req.user);
  // { userId: 1, username: 'john_doe' }

  // Use userId to filter data
  return this.taskService.findAllByUser(req.user.userId);
}
```

## Error Responses

### Missing Token
**Request:**
```bash
GET http://localhost:3000/tasks
# No Authorization header
```

**Response:** `401 Unauthorized`
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Invalid Token
**Request:**
```bash
GET http://localhost:3000/tasks
Authorization: Bearer invalid_token_here
```

**Response:** `401 Unauthorized`
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Expired Token
**Response:** `401 Unauthorized`
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## Current Implementation

Your `TaskController` ([src/task/task.controller.ts](src/task/task.controller.ts:23)) already uses `JwtAuthGuard`:

```typescript
@Controller("tasks")
@UseGuards(JwtAuthGuard)  // ✅ All task routes are protected
export class TaskController {
  // All methods require valid JWT token
}
```

## Configuration

JWT settings are configured in [src/auth/auth.module.ts](src/auth/auth.module.ts:13):

```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  signOptions: { expiresIn: '24h' },  // Token expires after 24 hours
})
```

**Important:** Set `JWT_SECRET` environment variable in production!

## Token Lifespan

- Default: **24 hours**
- After expiration, users must log in again to get a new token
- To change: Modify `expiresIn` in `auth.module.ts`

## Security Best Practices

1. **Always use HTTPS in production** - Prevents token interception
2. **Set strong JWT_SECRET** - Use environment variable
3. **Store tokens securely on client** - Use httpOnly cookies or secure storage
4. **Don't log tokens** - They provide full access to user account
5. **Implement token refresh** - For better UX (optional enhancement)
6. **Validate user exists** - JWT strategy checks if user still exists in database

## Testing with REST Client

Create a file `test.http` for testing:

```http
### Login
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "username": "test_user",
  "password": "password123"
}

### Get Tasks (Protected)
GET http://localhost:3000/tasks
Authorization: Bearer {{token}}

### Create Task (Protected)
POST http://localhost:3000/tasks
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "New Task",
  "description": "Task description"
}
```

## Summary

Your JWT authentication is **fully implemented** and working! The `JwtAuthGuard`:

✅ Validates `Authorization: Bearer <token>` header
✅ Checks token signature and expiration
✅ Loads user from database
✅ Populates `req.user` with user info
✅ Returns 401 for invalid/missing tokens
✅ Already protecting your Task routes

Just make sure to include the `Authorization` header with Bearer token in all protected requests!
