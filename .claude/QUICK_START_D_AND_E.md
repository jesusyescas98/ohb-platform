# Quick Start Guide for Agents D & E

**This is your starting point. Read this first before building components or pages.**

---

## 1. Architecture Overview (60 seconds)

The app has three layers:

```
Pages/Routes (Agent E)
    ↓
Components (Agent D)
    ↓
State Management Hooks (Agent C ✓ DONE)
    ↓
Database (localStorage + Supabase)
```

**Agent C has completed the bottom layer.** You can now build on top of it without worrying about state logic.

---

## 2. Available Hooks (Use These!)

Import from `@hooks`:

### Authentication
```tsx
const { isLoggedIn, email, role, isAdmin, logout } = useAuth();
```

### Properties Data
```tsx
const { properties, loading, error } = usePropertyData({
  filters: { type: 'casa', maxPrice: 500000 }
});
```

### CRM Leads
```tsx
const { leads, addLead, updateLead } = useLeadsData({ status: 'nuevo' });
```

### Forms
```tsx
const form = useFormData({ fields: [
  { name: 'email', type: 'email', required: true }
] });
```

### Generic Fetch
```tsx
const { data, loading } = useFetch('/api/endpoint');
```

---

## 3. Setup Root Layout (ONE-TIME SETUP)

In `src/app/layout.tsx`:

```tsx
'use client';
import { Providers } from '@providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Your meta tags */}
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**That's it.** All context is now available to every component below.

---

## 4. Component Example (Agent D)

```tsx
'use client';
import { usePropertyData } from '@hooks';

export function PropertyList() {
  const { properties, loading, error } = usePropertyData();

  if (loading) return <div className={styles.skeleton}>Cargando...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.list}>
      {properties.map(prop => (
        <PropertyCard key={prop.id} property={prop} />
      ))}
    </div>
  );
}
```

---

## 5. Page Example (Agent E)

```tsx
'use client';
import { useAuth } from '@hooks';
import { redirect } from 'next/navigation';

export default function AdminPage() {
  const { isAdmin } = useAuth();

  // Redirect if not admin
  if (!isAdmin) redirect('/');

  return (
    <div>
      <h1>Panel de Administración</h1>
      <AdminContent />
    </div>
  );
}
```

---

## 6. Common Patterns

### Pattern: Show/Hide Based on Auth Status
```tsx
const { isLoggedIn, isAdmin } = useAuth();

return (
  <>
    {isLoggedIn && <UserMenu />}
    {isAdmin && <AdminLink />}
  </>
);
```

### Pattern: Form with Validation
```tsx
const form = useFormData({
  fields: [
    { name: 'name', type: 'text', required: true, minLength: 3 },
    { name: 'email', type: 'email', required: true }
  ]
});

return (
  <form onSubmit={form.handleSubmit(async (data) => {
    await fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) });
  })}>
    <input {...form.getFieldProps('name')} placeholder="Nombre" />
    {form.errors.name && <span>{form.errors.name}</span>}
    
    <button type="submit" disabled={form.isSubmitting}>
      {form.isSubmitting ? 'Enviando...' : 'Enviar'}
    </button>
  </form>
);
```

### Pattern: Loading + Error States
```tsx
const { data, loading, error } = useFetch('/api/properties');

if (loading) return <Spinner />;
if (error) return <ErrorBanner message={error} />;
if (!data) return <EmptyState />;

return <PropertyDetail data={data} />;
```

---

## 7. TypeScript Imports

All type-safe. Common imports:

```tsx
import { useAuth, usePropertyData, useLeadsData, useFetch, useFormData } from '@hooks';
import { Providers } from '@providers';
import type { PropertyRecord, LeadRecord } from '@lib/database';
```

---

## 8. CSS Modules (Design System)

All styles use CSS Modules (NO Tailwind). Example:

```tsx
// MyComponent.tsx
import styles from './MyComponent.module.css';

export function MyComponent() {
  return <div className={styles.container}>Content</div>;
}
```

```css
/* MyComponent.module.css */
.container {
  background: var(--surface);
  color: var(--text-primary);
  padding: var(--spacing-4);
  border-radius: 8px;
}
```

**Design tokens in `src/app/globals.css`:**
- `--background` (dark)
- `--surface` (cards)
- `--primary` (gold)
- `--text-primary`, `--text-secondary`
- `--spacing-*` (4px units)

---

## 9. Role-Based Access (useAuth)

```tsx
const { isAdmin, isAdvisor, canManageContent } = useAuth();

if (!canManageContent) {
  return <p>No tienes permisos para ver esta página</p>;
}

return <AdminDashboard />;
```

**Roles:**
- `admin` — Full access
- `asesor` (advisor) — Can manage leads, see filtered data
- `cliente` (client) — Limited to own data

---

## 10. Real-Time Data Updates

Hooks listen to `db_updated` events automatically:

```tsx
// When you add a lead, all components using useLeadsData() refetch
addLead({ name: 'John', ... }); // This triggers cache invalidation

// All components see the update
```

**No polling needed.** Data stays in sync across browser tabs/windows.

---

## 11. Form Validation Rules (Reference)

Built-in validators:
- `required: true` — Not empty
- `type: 'email'` — Valid email format
- `type: 'phone'` — Valid phone number
- `minLength: 3` — At least 3 characters
- `maxLength: 100` — Max 100 characters
- `pattern: /regex/` — Match pattern

Custom validators:
```tsx
{
  name: 'age',
  type: 'number',
  rules: [
    {
      validate: (value) => value >= 18,
      message: 'Debes ser mayor de edad'
    }
  ]
}
```

---

## 12. API Endpoints (for Agent E)

Use `useFetch` for backend calls:

```tsx
const { data } = useFetch('/api/properties', {
  method: 'GET',
  cacheTime: 10 * 60 * 1000 // 10 minutes
});

// Sends Authorization header automatically if user is logged in
```

---

## 13. Database Tables (Read Only)

You can query but **use hooks instead**:

```tsx
// DON'T do this directly:
import { PropertiesDB } from '@lib/database';
const props = PropertiesDB.getAll();

// DO this instead:
const { properties } = usePropertyData();
```

**Why?** Hooks provide:
- Caching
- Real-time updates
- Error handling
- Loading states
- Role-based filtering

---

## 14. Path Aliases (tsconfig.json)

Use these for clean imports:

```tsx
// Good:
import { useAuth } from '@hooks';
import { Providers } from '@providers';
import { PropertyRecord } from '@lib/database';

// Avoid:
import { useAuth } from '../../../../hooks/useAuth';
```

---

## 15. Common Gotchas

### ❌ Don't forget 'use client'
```tsx
'use client'; // REQUIRED for components using hooks
import { useAuth } from '@hooks';
```

### ❌ Don't use hooks outside components
Hooks must be in components/functions that render on client.

### ❌ Don't forget Providers wrapper
Without `<Providers>` in root layout, useAuth() will crash.

### ✅ Always handle error state
```tsx
const { properties, error } = usePropertyData();
if (error) return <ErrorComponent message={error} />;
```

---

## 16. Debugging

### Check if hook is working:
```tsx
const auth = useAuth();
console.log('Auth:', { 
  isLoggedIn: auth.isLoggedIn, 
  email: auth.email, 
  role: auth.role 
});
```

### Check form validation:
```tsx
const form = useFormData({ fields: [...] });
console.log('Errors:', form.errors);
console.log('Touched:', form.touched);
console.log('Data:', form.formData);
```

### Browser DevTools:
- **Application > Local Storage > ohb_*** — Database state
- **Application > Session Storage > ohb_secure_session** — Auth token
- **Console** — Errors from fetch/validation

---

## 17. Next Steps for Agents D & E

### Agent D (Components)
1. Read `.claude/STATE_MANAGEMENT.md` for detailed API reference
2. Build reusable components using hooks
3. Use CSS Modules for styling
4. Test with different auth roles

### Agent E (Pages)
1. Create page routes in `src/app/*/page.tsx`
2. Import components from Agent D
3. Use useAuth for route protection
4. Implement breadcrumbs and navigation

---

## 18. Reference Files

| File | Purpose |
|------|---------|
| `.claude/STATE_MANAGEMENT.md` | Complete hook API reference |
| `.claude/AGENT_C_HANDOFF.md` | What Agent C delivered |
| `src/hooks/index.ts` | All hook exports |
| `src/lib/database.ts` | Database schema + methods |
| `src/lib/types.ts` | TypeScript interfaces |

---

## Final Checklist Before You Start

- [ ] Read this file
- [ ] Setup Providers in layout.tsx (one-time)
- [ ] Verify `npm run build` works
- [ ] Import hooks with `@hooks` alias
- [ ] Add 'use client' to components
- [ ] Test useAuth in a simple component

**You're ready to build!**

Questions? See `.claude/STATE_MANAGEMENT.md` for detailed API reference.
