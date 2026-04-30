# OHB Platform — State Management Layer (Agent C)

## Overview

This document describes the complete state management architecture for the OHB platform, built with React Contexts and custom hooks.

**Status:** ✅ Complete and ready for Agent D (Components) and Agent E (Pages)

---

## Architecture

### Context Providers

1. **AuthContext** (`src/context/AuthContext.tsx`)
   - Manages user authentication, session, and roles
   - Stores session tokens, login timestamp, browser fingerprint
   - 8-hour timeout with auto-logout
   - Role-based access: admin, asesor, cliente
   - Provides CSRF token for form submissions

2. **Root Provider** (`src/providers/Providers.tsx`)
   - Wraps app with AuthProvider + CookieConsent
   - Single entry point for all context setup
   - Used in `src/app/layout.tsx`

### Custom Hooks

#### Authentication
- **useAuth()** — Access authentication state and methods
  - Returns: `{ isLoggedIn, email, role, fullName, phone, sessionToken, isAdmin, isAdvisor, canManageContent, ... }`
  - Methods: `signUp()`, `loginWithPassword()`, `login()`, `logout()`

#### Data Management
- **usePropertyData(options?)** — Fetch and filter properties with caching
  - Supports filters: type, price range, bedrooms, location, status
  - Includes search and sorting (price, newest, featured)
  - Auto-caches for 5 minutes
  - Listens to db_updated events

- **useLeadsData(filters?)** — Manage CRM leads with role-based access
  - Admins see all, advisors see only their own leads
  - Methods: `addLead()`, `updateLead()`, `deleteLead()`, `getLead()`
  - Filters: status, source, priority, advisor, interestType, date range

#### Forms
- **useFormData(schema)** — Form validation and state management
  - Field types: text, email, phone, number, password, select, checkbox, textarea
  - Built-in validators: required, email, phone, minLength, maxLength, pattern, custom rules
  - Returns: `{ formData, errors, isDirty, isSubmitting, touched, ... }`
  - Methods: `handleSubmit()`, `handleChange()`, `handleBlur()`, `reset()`, `validate()`
  - All error messages in Spanish (es-MX)

#### HTTP Requests
- **useFetch<T>(url, options?)** — Generic data fetching with JWT auth
  - Auto-includes Authorization header (if authenticated)
  - Built-in retry logic (3 retries by default)
  - Request timeout (30s default)
  - In-memory cache with TTL
  - Returns: `{ data, loading, error, refetch, isValidating }`

---

## Usage Examples

### 1. Using Authentication

```tsx
'use client';
import { useAuth } from '@hooks';

export function MyComponent() {
  const { email, isLoggedIn, isAdmin, logout, loginWithPassword } = useAuth();

  if (!isLoggedIn) {
    return <p>No estás autenticado</p>;
  }

  return (
    <div>
      <p>Bienvenido, {email}</p>
      {isAdmin && <p>Eres administrador</p>}
      <button onClick={() => logout()}>Cerrar sesión</button>
    </div>
  );
}
```

### 2. Fetching Properties with Filters

```tsx
'use client';
import { usePropertyData } from '@hooks';

export function PropertyList() {
  const { properties, loading, error } = usePropertyData({
    filters: {
      type: 'casa',
      minPrice: 100000,
      maxPrice: 500000,
      bedrooms: 3,
      location: 'Campestre'
    },
    sortBy: 'price'
  });

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {properties.map(prop => (
        <li key={prop.id}>{prop.title} - ${prop.price}</li>
      ))}
    </ul>
  );
}
```

### 3. Managing CRM Leads

```tsx
'use client';
import { useLeadsData } from '@hooks';

export function LeadsList() {
  const { leads, addLead, updateLead, loading } = useLeadsData({
    status: 'nuevo'
  });

  const handleAddLead = async () => {
    const result = addLead({
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '6561234567',
      source: 'formulario',
      status: 'nuevo',
      // ... other fields
    });
    if (result) console.log('Lead agregado:', result.id);
  };

  const handleUpdateStatus = (leadId: string) => {
    const success = updateLead(leadId, { status: 'contactado' });
    if (success) console.log('Lead actualizado');
  };

  return (
    <div>
      <button onClick={handleAddLead}>Agregar Lead</button>
      {leads.map(lead => (
        <div key={lead.id}>
          <p>{lead.name} ({lead.email})</p>
          <button onClick={() => handleUpdateStatus(lead.id)}>
            Marcar contactado
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 4. Building Forms with Validation

```tsx
'use client';
import { useFormData, type FieldSchema } from '@hooks';

const schema: FieldSchema[] = [
  {
    name: 'email',
    type: 'email',
    required: true,
    initialValue: ''
  },
  {
    name: 'phone',
    type: 'phone',
    required: true,
    initialValue: ''
  },
  {
    name: 'message',
    type: 'textarea',
    required: true,
    minLength: 10,
    maxLength: 500,
    initialValue: ''
  }
];

export function ContactForm() {
  const form = useFormData({ fields: schema });

  const handleSubmit = form.handleSubmit(async (data) => {
    // Send to backend
    await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    alert('Mensaje enviado!');
  });

  return (
    <form onSubmit={handleSubmit}>
      <input
        {...form.getFieldProps('email')}
        placeholder="Email"
      />
      {form.errors.email && <span>{form.errors.email}</span>}

      <textarea {...form.getFieldProps('message')} />
      {form.errors.message && <span>{form.errors.message}</span>}

      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Enviando...' : 'Enviar'}
      </button>
    </form>
  );
}
```

### 5. Fetching Data from API

```tsx
'use client';
import { useFetch } from '@hooks';

interface Property {
  id: string;
  title: string;
  price: number;
}

export function PropertyDetail({ id }: { id: string }) {
  const { data, loading, error, refetch } = useFetch<Property>(
    `/api/properties/${id}`,
    { cacheTime: 10 * 60 * 1000 } // 10 min cache
  );

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>No encontrado</p>;

  return (
    <div>
      <h1>{data.title}</h1>
      <p>${data.price.toLocaleString('es-MX')}</p>
      <button onClick={() => refetch()}>Recargar</button>
    </div>
  );
}
```

---

## Type Definitions

### AuthContextType
```tsx
interface AuthContextType extends AuthState {
  register: (email, password, role, fullName, phone) => { success, error? };
  loginWithPassword: (email, password, rememberMe?) => { success, error? };
  login: (email, role, fullName?, phone?) => void;
  logout: (showConfirmation?) => void;
  updateActivity: () => void;
  isSessionValid: () => boolean;
  getActivityLogs: () => { timestamp, action, details }[];
  checkLoginAttempts: () => boolean;
  incrementLoginAttempts: () => void;
  resetLoginAttempts: () => void;
  csrfToken: string;
  isAdmin: boolean;
  isAdvisor: boolean;
  canManageContent: boolean;
}
```

### PropertyRecord
See `src/lib/types.ts` — TypeScript definition for property objects with all fields.

### LeadRecord
See `src/lib/database.ts` — Comprehensive lead CRM schema with all fields.

---

## Database Connection

All hooks connect to localStorage (with Supabase sync):

- **PropertiesDB** — Property CRUD operations
- **LeadsDB** — Lead CRUD operations (role-aware)
- **UsersDB** — User registration and authentication
- **ActivityLogDB** — User action tracking

Database sync fires on:
- Direct operations (add, update, delete)
- `db_updated` event broadcasts to all listeners
- Automatic background sync to Supabase

See `src/lib/database.ts` for full API documentation.

---

## Environment Variables Required

None additional. All env vars already configured in `.env.local`.

If adding backend APIs:
```env
NEXT_PUBLIC_API_URL=https://api.ohbasesoriasyconsultorias.com
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Security Features

✅ **Authentication:**
- JWT tokens with refresh logic
- Browser fingerprinting to prevent token theft
- Session timeout after 8 hours of inactivity
- Max 5 login attempts with 15-minute lockout

✅ **Data Protection:**
- CSRF token generation and validation
- Input sanitization (XSS prevention)
- Role-based access control in hooks
- Password strength validation (5-level scoring)

✅ **Error Handling:**
- All errors localized in Spanish
- Network errors with retry logic
- Graceful fallbacks for auth failures

---

## Performance Optimizations

1. **Caching:**
   - Property data cached 5 minutes
   - Fetch requests cached independently
   - Cache invalidation on db_updated event

2. **Lazy Loading:**
   - usePropertyData: on-demand filter evaluation
   - useFetch: only fetches when URL provided

3. **Memoization:**
   - useCallback for all event handlers
   - useRef to avoid unnecessary re-renders

4. **Role-based Queries:**
   - useLeadsData filters data at source (not in render)
   - Admins see all, advisors see only their own

---

## Handoff Checklist for Agent D & E

### For Agent D (Components):
- [ ] Import hooks with: `import { useAuth, usePropertyData } from '@hooks'`
- [ ] Wrap app root with `<Providers>` from `@providers`
- [ ] Use form hook for all form components
- [ ] Use useAuth for protected UI elements
- [ ] Error messages already localized to Spanish

### For Agent E (Pages):
- [ ] Use usePropertyData for property listings
- [ ] Use useLeadsData for CRM pages (check role access)
- [ ] Use useFetch for API endpoints
- [ ] Implement route guards using useAuth.isAdmin/isAdvisor
- [ ] All database access through hooks, not direct DB calls

### Path Aliases (already configured in tsconfig.json):
```
@hooks         → src/hooks
@context       → src/context
@providers     → src/providers
@components    → src/components
@lib           → src/lib
```

---

## Testing Hooks

```tsx
// Test useFormData validation
const { validate, errors } = useFormData({ fields: [...] });
validate(); // Returns boolean, populates errors object

// Test usePropertyData filtering
const { properties } = usePropertyData({
  filters: { type: 'casa', maxPrice: 300000 }
});
assert(properties.every(p => p.category === 'casa'));

// Test useLeadsData role access
const { leads } = useLeadsData(); // Advisor sees only own
assert(leads.every(l => l.advisor === currentUser.email));
```

---

## Common Patterns

### Protected Routes
```tsx
'use client';
import { useAuth } from '@hooks';
import { redirect } from 'next/navigation';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  if (!isAdmin) redirect('/');
  return <AdminContent />;
}
```

### Combining Multiple Data Sources
```tsx
const { properties } = usePropertyData({ filters: { ... } });
const { leads } = useLeadsData();
// Use both in same component
```

### Error Boundaries
All hooks return `{ error: string | null }`. Always check:
```tsx
if (error) return <ErrorComponent message={error} />;
```

---

**Ready for Agent D & E integration.** All exports are stable and fully typed.
