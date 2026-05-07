# RBAC Server Setup - Complete Infrastructure

## 📋 Overview

Your RBAC project now has a complete, production-ready server infrastructure with proper error handling, database connection management, request logging, and health checks.

## 🏗️ Architecture Components

### 1. **Database Connection** (`src/db/connection.ts`)

- ✅ Database initialization with connection test
- ✅ Graceful database shutdown
- ✅ Database health check endpoint support
- ✅ PrismaClient with PrismaPg adapter for PostgreSQL

### 2. **Error Handling** (`src/middlewares/errorHandler.ts`)

Comprehensive error handling for:

- **Prisma Errors**
  - P2002: Unique constraint violations (409 Conflict)
  - P2025: Record not found (404 Not Found)
  - P2003: Foreign key constraint failures (400 Bad Request)
  - Validation errors (400 Bad Request)
- **Custom Application Errors**
  - ValidationError (400)
  - AuthError (401)
  - ForbiddenError (403)
  - NotFoundError (404)
  - ConflictError (409)
  - InternalServerError (500)
- **Unknown Errors**: Generic 500 responses with request tracking

### 3. **Request Logging** (`src/middlewares/requestLogger.ts`)

- ✅ Request duration tracking
- ✅ HTTP method and path logging
- ✅ Response status codes
- ✅ Unique request ID per request
- ✅ Pretty-printed logs in development (pino-pretty)
- ✅ JSON logs in production

### 4. **Health Check Routes** (`src/routes/health.ts`)

Two endpoints:

- **`GET /health`** - Basic server status
  ```json
  {
    "success": true,
    "message": "RBAC server is running 🚀",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
  ```
- **`GET /health/detailed`** - Detailed health with database status
  ```json
  {
    "success": true,
    "message": "All systems operational",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "services": {
      "database": "healthy",
      "server": "healthy"
    }
  }
  ```

### 5. **Response Formatting** (`src/utils/response.ts`)

Standardized response wrappers for consistency:

- `successResponse<T>()` - Success responses with data
- `errorResponse()` - Structured error responses

### 6. **Custom Error Classes** (`src/utils/errors.ts`)

- `AppError` - Base error class
- `ValidationError` - 400
- `AuthError` - 401
- `ForbiddenError` - 403
- `NotFoundError` - 404
- `ConflictError` - 409
- `InternalServerError` - 500

## 🚀 Server Initialization (`src/app.ts`)

The server now:

1. Initializes database connection
2. Registers JWT plugin with Fastify
3. Sets up request logging middleware
4. Configures error handling
5. Registers health check routes
6. Listens on configured port (default: 3000)
7. Handles graceful shutdown (SIGINT/SIGTERM)

## 🔧 Configuration

### Environment Variables Needed

```env
DATABASE_URL=postgresql://user:password@localhost:5432/rbac
JWT_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

### Scripts

```bash
npm run dev          # Development with hot reload
npm run build        # Build TypeScript to dist/
npm start            # Run compiled server
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Generate Prisma Client
npm run db:studio    # Open Prisma Studio
```

## 📊 Logging Output

**Development (Pretty Output):**

```
  19:32:45.123 INFO  GET /health - 200 (5ms)
```

**Production (JSON):**

```json
{
  "level": 30,
  "time": "2024-01-01T12:00:00.000Z",
  "requestId": "abc123",
  "method": "GET",
  "path": "/health",
  "statusCode": 200,
  "duration": "5ms"
}
```

## 🔒 Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "message": "Human readable error message",
  "error": "ERROR_TYPE",
  "details": {},
  "requestId": "unique-request-id",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 📁 New Files Created

```
src/
  ├── app.ts (updated)
  ├── db/
  │   ├── prisma.ts (existing)
  │   └── connection.ts (new)
  ├── middlewares/
  │   ├── errorHandler.ts (new)
  │   └── requestLogger.ts (new)
  ├── routes/
  │   └── health.ts (new)
  ├── utils/
  │   ├── errors.ts (new)
  │   └── response.ts (new)
  └── ...
```

## 🔄 Request Flow

```
Request → Logger Hook → JWT Plugin → Routes/Handlers → Error Handler (if error) → Logger Hook → Response
```

## 📦 Dependencies Added

- `pino-pretty` (dev) - Beautiful log output

## ✅ Ready for Next Steps

The infrastructure is now ready for:

- Implementing authentication routes (auth module)
- Implementing user management (user module)
- Implementing role & permission management (role module)
- Adding business logic handlers
- Creating API route handlers

## 🧪 Testing the Setup

```bash
# Start development server
npm run dev

# In another terminal, test health endpoint
curl http://localhost:3000/health
curl http://localhost:3000/health/detailed

# Watch request logs
# Should see formatted logs for each request
```

## 🛡️ What's Protected

✅ Database errors are caught and formatted
✅ Validation errors are caught and formatted
✅ Unhandled errors are caught and logged
✅ Every request has a unique ID
✅ Server gracefully shuts down on signals
✅ Request/response times are tracked
✅ Health checks verify database connectivity
