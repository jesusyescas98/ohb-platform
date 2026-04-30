# OHB Platform API Routes

Comprehensive API documentation for the OHB Asesorías y Consultorías platform. All routes return JSON responses following the standard `ApiResponse<T>` format.

## API Response Format

All endpoints return responses in this format:

```typescript
{
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    timestamp: number;
    version: string;
  };
}
```

## Authentication

### JWT Token

All authenticated routes require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

JWT tokens are obtained from `/api/auth/login` and should be refreshed using `/api/auth/refresh` before expiration.

### Public Access

Some endpoints (like property listings) support public access without authentication.

---

## Authentication Routes

### POST `/api/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "phone": "+526561234567",
  "role": "cliente"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "name": "..." },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ...",
      "expiresIn": 900
    }
  }
}
```

**Errors:**
- `400 Bad Request` - Missing required fields
- `409 Conflict` - Email already exists
- `422 Validation Error` - Password doesn't meet requirements

---

### POST `/api/auth/login`
Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "name": "...", "role": "..." },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ...",
      "expiresIn": 900
    }
  }
}
```

**Errors:**
- `400 Bad Request` - Missing credentials
- `401 Unauthorized` - Invalid email or password
- `429 Too Many Requests` - Rate limited after failed attempts

---

### POST `/api/auth/refresh`
Refresh an expired access token using a valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 900
  }
}
```

**Errors:**
- `400 Bad Request` - Missing refresh token
- `401 Unauthorized` - Invalid or expired refresh token

---

### POST `/api/auth/logout`
Invalidate tokens and end session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": { "message": "Logged out successfully" }
}
```

---

## Properties Routes

### GET `/api/properties`
List all active properties with optional filtering.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `type` - Filter by type (casa, departamento, terreno, comercial, inversion)
- `location` - Filter by location (text search)
- `minPrice` - Minimum price in MXN
- `maxPrice` - Maximum price in MXN

**Example:**
```
GET /api/properties?type=casa&minPrice=2000000&maxPrice=5000000&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      { "id": "prop-001", "title": "Casa...", "price": 4500000, ... }
    ],
    "total": 42,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3
  }
}
```

**Authentication:** None (public)

---

### GET `/api/properties/:id`
Get detailed information about a specific property.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prop-001",
    "title": "Residencia Premium",
    "type": "casa",
    "price": 4500000,
    "location": "Campestre, Ciudad Juárez",
    "images": ["url1", "url2", "url3"],
    "amenities": ["Jardín", "Terraza", ...],
    ...
  }
}
```

**Authentication:** None (public)

---

### POST `/api/properties`
Create a new property listing (admin/asesor only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "id": "prop-013",
  "title": "Nueva Propiedad",
  "type": "casa",
  "price": 3500000,
  "location": "Centro, Ciudad Juárez",
  "address": "Calle Principal #123",
  "sqMeters": 250,
  "bedrooms": 3,
  "bathrooms": 2,
  "parking": 2,
  "description": "Descripción detallada...",
  "amenities": ["Jardín", "Cocina Integral"],
  "images": ["url1", "url2"],
  "lat": 31.69,
  "lng": -106.42
}
```

**Response:**
```json
{
  "success": true,
  "data": { "id": "prop-013", "title": "Nueva Propiedad", ... }
}
```

**Errors:**
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not admin/asesor
- `422 Validation Error` - Invalid property data

---

### PUT `/api/properties/:id`
Update a property listing (admin/asesor).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Propiedad Actualizada",
  "price": 3800000,
  "description": "Descripción actualizada..."
}
```

**Errors:**
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not owner or admin
- `404 Not Found` - Property not found

---

### DELETE `/api/properties/:id`
Delete a property listing (admin).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Errors:**
- `403 Forbidden` - Not admin
- `404 Not Found` - Property not found

---

## Leads Routes

### GET `/api/leads`
Get leads assigned to the current user (asesor) or all leads (admin).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status` - Filter by status (nuevo, contactado, calificado, cerrado, perdido)
- `page` - Page number

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "lead-001",
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "phone": "+5265612345",
        "status": "nuevo",
        "source": "formulario",
        "createdAt": 1683532800000
      }
    ],
    "total": 25
  }
}
```

**Authentication:** Required (asesor or admin)

---

### POST `/api/leads`
Create a new lead (public or authenticated users).

**Request Body:**
```json
{
  "name": "María García",
  "email": "maria@example.com",
  "phone": "+5265619876",
  "propertyId": "prop-001",
  "source": "formulario",
  "interestType": "compra",
  "budgetMin": 2000000,
  "budgetMax": 5000000,
  "notes": "Interesada en propiedades con 3+ recámaras"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "lead-new",
    "name": "María García",
    "status": "nuevo",
    "createdAt": 1683532800000
  }
}
```

**Authentication:** None (public)

---

### PUT `/api/leads/:id/status`
Update lead status (asesor/admin).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "status": "contactado",
  "notes": "Cliente llamado, interesado en propiedades premium"
}
```

**Errors:**
- `403 Forbidden` - Not assigned to this lead

---

### DELETE `/api/leads/:id`
Delete a lead (admin).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Errors:**
- `403 Forbidden` - Not admin

---

### GET `/api/leads/:id/csv`
Export lead data to CSV (admin).

**Response:** CSV file download

---

## Courses Routes

### GET `/api/courses`
List all published courses.

**Query Parameters:**
- `careerPath` - Filter by career path (INFONAVIT, Inversiones, Inmobiliarias)
- `level` - Filter by level (basico, intermedio, avanzado)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "curso-001",
      "title": "Inversión Inmobiliaria 101",
      "description": "...",
      "price": 1000,
      "duration": 180,
      "level": "basico",
      "careerPath": "Inversiones"
    }
  ]
}
```

**Authentication:** None (public)

---

### GET `/api/courses/:id`
Get detailed course information with lessons.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "curso-001",
    "title": "Inversión Inmobiliaria 101",
    "lessons": [
      {
        "id": "lesson-001",
        "title": "Fundamentos de Inversión",
        "duration": 45,
        "videoUrl": "..."
      }
    ]
  }
}
```

**Authentication:** None (public)

---

### POST `/api/courses/:courseId/enroll`
Enroll user in a course.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollmentId": "enroll-001",
    "courseId": "curso-001",
    "status": "active",
    "enrolledAt": 1683532800000
  }
}
```

**Errors:**
- `401 Unauthorized` - Not authenticated
- `409 Conflict` - Already enrolled in course

---

## Users Routes

### GET `/api/users/me`
Get current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-001",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "cliente",
    "phone": "+5265612345"
  }
}
```

**Authentication:** Required

---

### PUT `/api/users/:id`
Update user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+5265619876",
  "bio": "Inversora inmobiliaria"
}
```

**Note:** Users can only update their own profile. Admins can update any user.

**Errors:**
- `403 Forbidden` - Cannot modify other users' profiles (non-admin)

---

## Webhook Routes

### POST `/api/webhooks/stripe`
Handle Stripe payment webhook events.

**Required Headers:**
```
stripe-signature: <signature>
```

**Handled Events:**
- `payment_intent.succeeded` - Payment completed
- `payment_intent.payment_failed` - Payment failed
- `customer.subscription.created` - Subscription created
- `customer.subscription.deleted` - Subscription cancelled

**Response:**
```json
{
  "success": true,
  "data": { "received": true }
}
```

---

## Error Codes

| Code | HTTP | Description |
|------|------|---|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT token |
| `FORBIDDEN` | 403 | Insufficient permissions for operation |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid request data |
| `CONFLICT` | 409 | Resource already exists (email, etc.) |
| `INTERNAL_ERROR` | 500 | Server error |
| `RATE_LIMITED` | 429 | Too many requests |

---

## Rate Limiting

API endpoints are rate limited:
- **Public endpoints**: 100 requests/hour per IP
- **Authenticated endpoints**: 1000 requests/hour per user
- **Auth endpoints**: 5 failed attempts/5 minutes

Rate limit info is returned in response headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1683532800
```

---

## Examples

### Login and Get Properties
```javascript
// 1. Login
const loginRes = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { data: { tokens } } = await loginRes.json();

// 2. Get properties with auth
const propsRes = await fetch('/api/properties?type=casa', {
  headers: {
    'Authorization': `Bearer ${tokens.accessToken}`
  }
});

const props = await propsRes.json();
```

### Create Lead
```javascript
const leadRes = await fetch('/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '+5265612345',
    propertyId: 'prop-001',
    source: 'formulario'
  })
});

const lead = await leadRes.json();
```

---

## Deployment Notes

- All API routes use `src/lib/database/queries.ts` for type-safe database access
- JWT tokens are verified server-side before any RLS-sensitive operation
- Supabase RLS policies are enforced automatically on queries
- Service role key is used only in admin-only endpoints
- All responses include proper CORS headers for browser access
- Timestamps are in Unix epoch milliseconds for consistency

---

For database schema details, see `src/lib/database/SUPABASE_SCHEMA.sql`.
For RLS policy documentation, see `src/lib/database/RLS_POLICIES.md`.
