# OHB Platform — API Endpoints Reference

Quick reference for all API endpoints with authentication requirements and data models.

## Endpoint Matrix

### Authentication Endpoints

| Endpoint | Method | Auth | Description | Status |
|---|---|---|---|---|
| `/api/auth/signup` | POST | ❌ | Register new account | 📋 To Build |
| `/api/auth/login` | POST | ❌ | Authenticate user | 📋 To Build |
| `/api/auth/refresh` | POST | ❌ | Refresh JWT token | 📋 To Build |
| `/api/auth/logout` | POST | ✅ | End session | 📋 To Build |

### Properties Endpoints

| Endpoint | Method | Auth | Role | Description | Status |
|---|---|---|---|---|---|
| `/api/properties` | GET | ❌ | Public | List active properties | ✅ Built |
| `/api/properties/:id` | GET | ❌ | Public | Get property details | 📋 To Build |
| `/api/properties` | POST | ✅ | Admin/Asesor | Create property | ✅ Built |
| `/api/properties/:id` | PUT | ✅ | Admin/Asesor | Update property | 📋 To Build |
| `/api/properties/:id` | DELETE | ✅ | Admin | Delete property | 📋 To Build |
| `/api/properties/:id/views` | POST | ❌ | Public | Increment view count | 📋 To Build |

### Leads Endpoints

| Endpoint | Method | Auth | Role | Description | Status |
|---|---|---|---|---|---|
| `/api/leads` | GET | ✅ | Asesor/Admin | Get leads | 📋 To Build |
| `/api/leads/:id` | GET | ✅ | Asesor/Admin | Get lead details | 📋 To Build |
| `/api/leads` | POST | ❌ | Public | Create lead | 📋 To Build |
| `/api/leads/:id` | PUT | ✅ | Asesor/Admin | Update lead | 📋 To Build |
| `/api/leads/:id/status` | PUT | ✅ | Asesor/Admin | Update status | 📋 To Build |
| `/api/leads/:id` | DELETE | ✅ | Admin | Delete lead | 📋 To Build |
| `/api/leads/:id/csv` | GET | ✅ | Admin | Export to CSV | 📋 To Build |
| `/api/leads/bulk-import` | POST | ✅ | Admin | Bulk import leads | 📋 To Build |

### Courses Endpoints

| Endpoint | Method | Auth | Role | Description | Status |
|---|---|---|---|---|---|
| `/api/courses` | GET | ❌ | Public | List published | 📋 To Build |
| `/api/courses/:id` | GET | ❌ | Public | Get details | 📋 To Build |
| `/api/courses` | POST | ✅ | Admin | Create course | 📋 To Build |
| `/api/courses/:id` | PUT | ✅ | Admin | Update course | 📋 To Build |
| `/api/courses/:id` | DELETE | ✅ | Admin | Delete course | 📋 To Build |
| `/api/courses/:id/lessons` | GET | ❌ | Public | Get lessons | 📋 To Build |
| `/api/courses/:id/enroll` | POST | ✅ | Cliente | Enroll user | 📋 To Build |
| `/api/courses/:courseId/lessons` | POST | ✅ | Admin | Create lesson | 📋 To Build |

### User Endpoints

| Endpoint | Method | Auth | Description | Status |
|---|---|---|---|---|
| `/api/users/me` | GET | ✅ | Get current user | 📋 To Build |
| `/api/users/:id` | GET | ✅ | Get user profile | 📋 To Build |
| `/api/users/:id` | PUT | ✅ | Update profile | 📋 To Build |
| `/api/users/:id/password` | PUT | ✅ | Change password | 📋 To Build |
| `/api/users` | GET | ✅ | List users (admin) | 📋 To Build |

### Order Endpoints

| Endpoint | Method | Auth | Description | Status |
|---|---|---|---|---|
| `/api/orders` | GET | ✅ | Get user's orders | 📋 To Build |
| `/api/orders/:id` | GET | ✅ | Get order details | 📋 To Build |
| `/api/orders` | POST | ✅ | Create order | 📋 To Build |
| `/api/orders/:id/invoice` | GET | ✅ | Download invoice | 📋 To Build |

### Certificate Endpoints

| Endpoint | Method | Auth | Description | Status |
|---|---|---|---|---|
| `/api/certificates` | GET | ✅ | Get user's certificates | 📋 To Build |
| `/api/certificates/:code` | GET | ❌ | Verify certificate | 📋 To Build |
| `/api/certificates/:id` | GET | ✅ | Get certificate details | 📋 To Build |

### Webhook Endpoints

| Endpoint | Method | Auth | Description | Status |
|---|---|---|---|---|
| `/api/webhooks/stripe` | POST | ❌ | Handle Stripe events | 📋 To Build |

---

## Request/Response Models

### Property Model

**Request (POST/PUT):**
```typescript
{
  id: string;                    // "prop-001"
  title: string;                 // "Residencia Premium"
  type: string;                  // "casa" | "departamento" | "terreno" | "comercial" | "inversion"
  price: number;                 // 4500000
  currency: string;              // "MXN"
  location: string;              // "Campestre, Ciudad Juárez"
  colonia: string;               // "Campestre"
  address: string;               // "Av. Campestre #456"
  sqMeters: number;              // 320
  bedrooms: number;              // 4
  bathrooms: number;             // 3
  parking: number;               // 2
  description: string;           // Full property description
  shortDescription: string;      // Short 1-2 line summary
  images: string[];              // ["url1", "url2", "url3"]
  amenities: string[];           // ["Jardín", "Terraza"]
  status: string;                // "activa" | "vendida" | "reservada"
  featured: boolean;             // true
  lat?: number;                  // 31.6904
  lng?: number;                  // -106.4245
}
```

**Response (GET):**
```typescript
{
  ...request,
  views_count: number;           // 123
  created_at: number;            // Unix timestamp
  updated_at: number;            // Unix timestamp
  published_at: string | null;   // ISO timestamp
}
```

### Lead Model

**Request (POST):**
```typescript
{
  name: string;                  // "Juan Pérez"
  email: string;                 // "juan@example.com"
  phone: string;                 // "+5265612345"
  propertyId?: string;           // "prop-001"
  source: string;                // "formulario" | "whatsapp" | "chatbot" | "newsletter"
  interestType?: string;         // "compra" | "venta" | "renta" | "inversion"
  budgetMin?: number;            // 2000000
  budgetMax?: number;            // 5000000
  notes?: string;                // Additional notes
}
```

**Response (GET):**
```typescript
{
  id: string;                    // UUID
  ...request,
  status: string;                // "nuevo" | "contactado" | "calificado" | "cerrado" | "perdido"
  assigned_to?: string;          // Asesor's UUID
  contacted_at?: number;         // Unix timestamp
  created_at: number;            // Unix timestamp
  updated_at: number;            // Unix timestamp
}
```

### Course Model

**Request (POST/PUT):**
```typescript
{
  id: string;                    // "curso-001"
  title: string;                 // "Inversión Inmobiliaria 101"
  description: string;           // Full course description
  shortDescription?: string;     // 1 line summary
  instructor: string;            // "Juan Instructor"
  duration: number;              // 180 (minutes)
  level: string;                 // "basico" | "intermedio" | "avanzado"
  careerPath: string;            // "INFONAVIT" | "Inversiones" | "Inmobiliarias"
  price: number;                 // 1000 (MXN)
  topics: string[];              // ["Fundamentals", "Risk Management"]
  imageUrl: string;              // "https://..."
  lessons?: CourseLesson[];      // Lesson definitions
}
```

**Response (GET):**
```typescript
{
  ...request,
  published: boolean;            // true
  published_at: string | null;   // ISO timestamp
  created_at: number;            // Unix timestamp
  updated_at: number;            // Unix timestamp
}
```

### User Model

**Request (PUT):**
```typescript
{
  name?: string;                 // "John Updated"
  phone?: string;                // "+5265619876"
  bio?: string;                  // User bio
  profile_image_url?: string;    // "https://..."
}
```

**Response (GET):**
```typescript
{
  id: string;                    // UUID
  email: string;                 // "user@example.com"
  name: string;                  // "John Doe"
  phone: string;                 // "+5265612345"
  role: string;                  // "admin" | "asesor" | "cliente"
  bio?: string;                  // User bio
  profile_image_url?: string;    // Avatar URL
  is_active: boolean;            // true
  email_verified: boolean;       // true
  last_login: number;            // Unix timestamp
  created_at: number;            // Unix timestamp
}
```

### Order Model

**Request (POST):**
```typescript
{
  course_ids: string[];          // ["curso-001", "curso-002"]
  total_price: number;           // 2000
  currency: string;              // "MXN"
  // stripe_session_id set by webhook after payment
}
```

**Response (GET):**
```typescript
{
  id: string;                    // UUID
  user_id: string;               // UUID
  course_ids: string[];          // ["curso-001", "curso-002"]
  total_price: number;           // 2000
  currency: string;              // "MXN"
  status: string;                // "pending" | "paid" | "refunded"
  invoice_number: string;        // "OHB-001"
  invoice_pdf_url?: string;      // "https://..."
  created_at: number;            // Unix timestamp
  paid_at?: number;              // Unix timestamp
}
```

### Login Response

```typescript
{
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
    tokens: {
      accessToken: string;       // JWT token (15 min)
      refreshToken: string;      // JWT refresh token (7 days)
      expiresIn: number;         // 900 (seconds)
    };
  };
}
```

### Paginated Response

```typescript
{
  success: true;
  data: {
    items: T[];                  // Array of items
    total: number;               // Total count
    page: number;                // Current page
    pageSize: number;            // Items per page
    totalPages: number;          // Total pages
  };
}
```

### Error Response

```typescript
{
  success: false;
  error: {
    code: string;                // "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | etc.
    message: string;             // Human-readable message
    details?: {                  // Additional error details
      [key: string]: any;
    };
  };
}
```

---

## Query Parameters

### Pagination
- `page` (number, default: 1) — Page number
- `limit` (number, default: 20) — Items per page (max: 100)

### Property Filters
- `type` (string) — "casa" | "departamento" | "terreno" | "comercial" | "inversion"
- `location` (string) — Search by location (text match)
- `minPrice` (number) — Minimum price in MXN
- `maxPrice` (number) — Maximum price in MXN

### Lead Filters
- `status` (string) — "nuevo" | "contactado" | "calificado" | "cerrado" | "perdido"
- `source` (string) — "formulario" | "whatsapp" | "chatbot" | "newsletter"
- `assigned_to` (string) — Filter by asesor UUID

### Course Filters
- `careerPath` (string) — "INFONAVIT" | "Inversiones" | "Inmobiliarias"
- `level` (string) — "basico" | "intermedio" | "avanzado"
- `published` (boolean) — true for published courses

---

## Authentication

### Token-Based (JWT)

All authenticated endpoints require:

```
Authorization: Bearer <accessToken>
```

**Token obtained from:**
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Token expires after 15 minutes. Refresh using:**
```bash
POST /api/auth/refresh
{
  "refreshToken": "<refreshToken>"
}
```

---

## Status Codes

| Code | Meaning |
|---|---|
| `200 OK` | Request succeeded, data returned |
| `201 Created` | Resource created successfully |
| `204 No Content` | Request succeeded, no response body |
| `400 Bad Request` | Invalid request format |
| `401 Unauthorized` | Missing or invalid JWT token |
| `403 Forbidden` | Insufficient permissions |
| `404 Not Found` | Resource not found |
| `422 Unprocessable Entity` | Validation error in request data |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Server error |

---

## Rate Limits

- **Public endpoints**: 100 req/hour per IP
- **Authenticated endpoints**: 1000 req/hour per user
- **Auth endpoints**: 5 failed attempts/5 minutes

Headers returned:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1683532800
```

---

## CORS Headers

All API endpoints support CORS with:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Example Requests

### Get Active Properties
```bash
curl -X GET "http://localhost:3000/api/properties?type=casa&minPrice=2000000" \
  -H "Content-Type: application/json"
```

### Login
```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

### Create Property (Authenticated)
```bash
curl -X POST "http://localhost:3000/api/properties" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  -d '{
    "id": "prop-013",
    "title": "Nueva Propiedad",
    "type": "casa",
    "price": 3500000,
    "location": "Centro"
  }'
```

### Create Lead (Public)
```bash
curl -X POST "http://localhost:3000/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María García",
    "email": "maria@example.com",
    "phone": "+5265619876",
    "propertyId": "prop-001",
    "source": "formulario"
  }'
```

### Refresh Token
```bash
curl -X POST "http://localhost:3000/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }'
```

---

## Implementation Status

- ✅ Schema designed (12 tables)
- ✅ RLS policies documented
- ✅ Query helpers created (40+ functions)
- ✅ JWT authentication system
- ✅ Server-safe client
- ✅ Example route (properties GET/POST)
- ✅ API documentation
- 📋 Remaining routes to build (Agent E)
- 📋 React hooks/services (Agent C)
- 📋 Components/forms (Agent D)

---

**For detailed documentation, see:**
- `src/app/api/README.md` — API reference
- `src/lib/database/SUPABASE_SCHEMA.sql` — Database schema
- `src/lib/database/RLS_POLICIES.md` — Authorization rules
- `DATABASE_IMPLEMENTATION.md` — Complete guide
