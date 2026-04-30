# RLS Policies Documentation

## Overview

Row Level Security (RLS) policies are enabled on all 12 core tables in the OHB Platform schema. These policies ensure data access is controlled based on user roles and ownership.

## Table-by-Table RLS Status

### ✅ USERS
- **RLS Enabled**: Yes
- **Default Deny**: Yes

#### Policies

| Policy Name | Event | Condition |
|---|---|---|
| `users_admin_full_access` | ALL | `auth.jwt() ->> 'role' = 'admin'` |
| `users_select_own` | SELECT | `id = auth.uid()` |
| `users_update_own` | UPDATE | User can modify own profile only |
| `users_select_public` | SELECT | `role != 'admin' AND is_active = true` |

**Access Matrix**:
- Admin: Read/Write all users
- Authenticated User: Read own profile, Update own profile
- Public: Read public profiles of non-admin users

---

### ✅ PROPERTIES
- **RLS Enabled**: Yes
- **Default Deny**: Yes

#### Policies

| Policy Name | Event | Condition |
|---|---|---|
| `properties_admin_full_access` | ALL | `auth.jwt() ->> 'role' = 'admin'` |
| `properties_asesor_manage_own` | ALL | `auth.jwt() ->> 'role' = 'asesor' AND created_by = auth.uid()` |
| `properties_public_select_active` | SELECT | `status = 'activa' AND published_at IS NOT NULL` |

**Access Matrix**:
- Admin: Create, Read, Update, Delete all properties
- Asesor: Create, Read, Update, Delete own properties only
- Public: Read active published properties only
- Cliente: Read active published properties only

**Status Values**:
- `activa`: Active listing (visible to public when published)
- `vendida`: Sold (hidden from public view)
- `reservada`: Reserved (hidden from public view)

---

### ✅ PROPERTY_IMAGES
- **RLS Enabled**: Yes
- **Default Deny**: Yes

#### Policies

| Policy Name | Event | Condition |
|---|---|---|
| `property_images_public_select` | SELECT | Property exists AND property status = 'activa' |

**Access Matrix**:
- Public: View images of active properties only
- Admin: View all property images
- Asesor: Managed via property ownership

---

### ✅ LEADS
- **RLS Enabled**: Yes
- **Default Deny**: Yes

#### Policies

| Policy Name | Event | Condition |
|---|---|---|
| `leads_admin_full_access` | ALL | `auth.jwt() ->> 'role' = 'admin'` |
| `leads_asesor_select` | SELECT | `auth.jwt() ->> 'role' = 'asesor'` |
| `leads_asesor_update_assigned` | UPDATE | `auth.jwt() ->> 'role' = 'asesor' AND assigned_to = auth.uid()` |
| `leads_insert_own` | INSERT | Any authenticated user can create leads |

**Access Matrix**:
- Admin: Full CRUD on all leads
- Asesor: Read all leads, Update assigned leads only
- Cliente: Create own leads only, Read own leads
- Public: Cannot access leads

**Lead Status Values**:
- `nuevo`: New lead just captured
- `contactado`: Asesor has contacted
- `calificado`: Qualified for sales process
- `cerrado`: Closed/Converted
- `perdido`: Lost opportunity

---

### ✅ COURSES
- **RLS Enabled**: Yes
- **Default Deny**: Yes

#### Policies

| Policy Name | Event | Condition |
|---|---|---|
| `courses_public_select_published` | SELECT | `published = true` |

**Access Matrix**:
- Public: View published courses
- Authenticated: View published courses
- Admin: Create, Read, Update, Delete courses
- Instructor: Managed via course ownership

---

### ✅ COURSE_ENROLLMENTS
- **RLS Enabled**: Yes
- **Default Deny**: Yes

#### Policies

| Policy Name | Event | Condition |
|---|---|---|
| `course_enrollments_select_own` | SELECT | `user_id = auth.uid()` |
| `course_enrollments_insert_own` | INSERT | `user_id = auth.uid()` |

**Access Matrix**:
- User: View own enrollments, Create own enrollments
- Admin: Full access to all enrollments

---

### ✅ COURSE_LESSONS
- **RLS Enabled**: Yes (inherited via course access)

Lessons are managed as part of courses. Access controlled through course publishing status.

---

### ✅ CERTIFICATES
- **RLS Enabled**: Yes
- **Default Deny**: Yes

#### Policies

| Policy Name | Event | Condition |
|---|---|---|
| `certificates_select_own` | SELECT | `user_id = auth.uid()` |

**Access Matrix**:
- User: View own certificates only
- Admin: View all certificates

---

### ✅ ORDERS
- **RLS Enabled**: Yes
- **Default Deny**: Yes

#### Policies

| Policy Name | Event | Condition |
|---|---|---|
| `orders_select_own` | SELECT | `user_id = auth.uid()` |

**Access Matrix**:
- User: View own orders only
- Admin: View all orders

---

### ✅ TRANSACTIONS
- **RLS Enabled**: Yes
- **Default Deny**: Yes

#### Policies

| Policy Name | Event | Condition |
|---|---|---|
| `transactions_select_own` | SELECT | `user_id = auth.uid()` |

**Access Matrix**:
- User: View own transactions only
- Admin: View all transactions

---

### ✅ SETTINGS
- **RLS Enabled**: Yes
- **Default Deny**: Yes

**Access Pattern**: User-level settings are isolated per `user_id`.

---

### ✅ DOCUMENTS
- **RLS Enabled**: Yes
- **Default Deny**: Yes

Documents are grouped by `related_id` and `document_type`. Access typically requires ownership or admin role.

---

## JWT Claims Used in RLS

RLS policies reference JWT claims via `auth.jwt()`:

```typescript
{
  sub: string;              // auth.uid() - User ID
  email: string;            // User email
  role: 'admin' | 'asesor' | 'cliente';  // User role
  iat: number;              // Issued at
  exp: number;              // Expiration
}
```

**JWT Extraction in Policies**:
- `auth.jwt() ->> 'role'` — Extract role as text
- `auth.uid()` — Get authenticated user's UUID

---

## Authentication Flow & JWT

1. **Login** → API route `/api/auth/login` validates credentials
2. **JWT Creation** → Access token + refresh token generated
3. **Request Headers** → Client sends `Authorization: Bearer <token>`
4. **Supabase Validation** → JWT verified, claims extracted
5. **RLS Enforcement** → Policies evaluated against JWT claims

---

## Role-Based Access Control (RBAC)

### Admin Role
- Full access to all tables
- Can perform any operation
- Access to user management
- Access to reporting and analytics
- Access to system settings

### Asesor Role (Real Estate Agent)
- Create and manage own properties
- View all leads
- Update and manage assigned leads
- Cannot access user management
- Cannot access payment information

### Cliente Role (Customer)
- View published properties
- Create own leads
- View own courses
- View own orders
- Cannot manage properties
- Cannot manage other users' data

---

## Implementation Notes

### Service Role Key
The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS entirely. It should be:
- Used ONLY on server-side routes (`src/app/api/*`)
- Never exposed to the browser
- Protected in environment variables
- Used for administrative operations only

### Anon Key
The `NEXT_PUBLIC_SUPABASE_ANON_KEY` respects all RLS policies:
- Safe for browser/client-side use
- Used by default in `supabase` client
- Enforces row-level access control
- Required for public property queries

---

## Testing RLS Policies

### Test Case: Public Property Access
```sql
-- As anonymous user (no JWT)
SELECT * FROM properties WHERE status = 'activa';
-- ✅ Returns: All published active properties

-- As authenticated user
SELECT * FROM properties;
-- ✅ Returns: All published active properties (same as public)
```

### Test Case: Lead Assignment
```sql
-- As asesor (assigned_to = their UUID)
UPDATE leads SET status = 'contactado'
WHERE assigned_to = auth.uid();
-- ✅ Success: Updates own assigned leads

-- As asesor (not assigned)
UPDATE leads SET status = 'contactado'
WHERE assigned_to != auth.uid();
-- ❌ Error: No rows affected (policy enforced)
```

### Test Case: Order Privacy
```sql
-- As user viewing orders
SELECT * FROM orders WHERE user_id = auth.uid();
-- ✅ Returns: Own orders only

-- As admin
SELECT * FROM orders;
-- ✅ Returns: All orders (service role key)
```

---

## Monitoring & Auditing

### Enable Audit Logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50),
  table_name VARCHAR(100),
  record_id VARCHAR(100),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Real-Time Alerts
Monitor for suspicious RLS policy violations in Supabase logs.

---

## Deployment Checklist

- [ ] Execute `SUPABASE_SCHEMA.sql` in Supabase SQL console
- [ ] Verify all RLS policies are enabled
- [ ] Test public property access
- [ ] Test asesor lead management
- [ ] Test user profile privacy
- [ ] Configure JWT secret in Supabase Auth
- [ ] Set up environment variables (`NEXT_PUBLIC_SUPABASE_*`)
- [ ] Enable realtime subscriptions if needed
- [ ] Monitor for RLS policy errors in logs
- [ ] Backup database after schema deployment
