# Hooks Module Exports

## Central Export Point: `src/hooks/index.ts`

All hooks are exported from `src/hooks/index.ts` for clean imports:

```tsx
import {
  useAuth,
  usePropertyData,
  useLeadsData,
  useFetch,
  useFormData,
  type FetchOptions
} from '@hooks';
```

---

## Individual Hook Exports

### useAuth
- **File:** `src/hooks/useAuth.ts`
- **Default Export:** `useAuth` function
- **Type Safe:** ✅
- **Usage:**
  ```tsx
  const { isLoggedIn, email, role, logout } = useAuth();
  ```

### usePropertyData
- **File:** `src/hooks/usePropertyData.ts`
- **Default Export:** `usePropertyData` function
- **Generic:** No (returns PropertyRecord[])
- **Usage:**
  ```tsx
  const { properties, loading } = usePropertyData({
    filters: { type: 'casa' }
  });
  ```

### useLeadsData
- **File:** `src/hooks/useLeadsData.ts`
- **Default Export:** `useLeadsData` function
- **Type Safe:** ✅ LeadRecord[]
- **Usage:**
  ```tsx
  const { leads, addLead } = useLeadsData({ status: 'nuevo' });
  ```

### useFetch
- **File:** `src/hooks/useFetch.ts`
- **Default Export:** `useFetch` function
- **Generic:** ✅ `useFetch<T>(url)` → T | null
- **Usage:**
  ```tsx
  const { data } = useFetch<PropertyRecord>('/api/property/123');
  ```
- **Exported Types:** `FetchOptions`

### useFormData
- **File:** `src/hooks/useFormData.ts`
- **Default Export:** `useFormData` function
- **Exported Types:**
  - `ValidationRule` interface
  - `FieldSchema` interface
  - `FormSchema` interface
- **Usage:**
  ```tsx
  const form = useFormData({
    fields: [{ name: 'email', type: 'email' }]
  });
  ```

---

## Context Exports

### AuthContext
- **File:** `src/context/AuthContext.tsx`
- **Export:** `export const AuthContext`
- **Type:** `React.Context<AuthContextType | undefined>`
- **Usage:** Directly use `useAuth()` hook instead of consuming context
- **Note:** Exported for advanced use cases, hooks are preferred

### AuthProvider
- **File:** `src/context/AuthContext.tsx`
- **Export:** `export function AuthProvider`
- **Note:** Used in `Providers.tsx`, don't use directly

### useAuth (from context)
- **File:** `src/context/AuthContext.tsx`
- **Export:** Built-in hook from AuthContext
- **Usage:** `import { useAuth } from '@hooks'` (re-exported)

---

## Provider Exports

### Providers
- **File:** `src/providers/Providers.tsx`
- **Default Export:** `Providers` component
- **Props:** `{ children: ReactNode }`
- **Usage:**
  ```tsx
  <Providers>
    <YourApp />
  </Providers>
  ```

---

## Type Exports

From `src/lib/database.ts`:
- `PropertyRecord` — Property schema
- `LeadRecord` — Lead schema
- `UserProfile` — User schema
- `FileRecord` — File upload schema
- And 15+ others

From `src/lib/types.ts`:
- `Property` — Legacy property type
- `Lead` — Legacy lead type
- `User` — User type
- `JWTPayload` — Auth token type
- And 10+ others

---

## How to Import Everything

```tsx
// Hooks (primary - use these)
import {
  useAuth,
  usePropertyData,
  useLeadsData,
  useFetch,
  useFormData,
  type FetchOptions
} from '@hooks';

// Provider (wrap root layout)
import { Providers } from '@providers';

// Types from database
import type {
  PropertyRecord,
  LeadRecord,
  UserProfile
} from '@lib/database';

// Types from lib
import type {
  Property,
  Lead,
  JWTPayload,
  AuthToken
} from '@lib/types';

// Context (rarely needed)
import { AuthContext, useAuth } from '@context/AuthContext';
```

---

## Export Organization

```
src/
├── hooks/
│   ├── index.ts                    ← Use this for imports
│   ├── useAuth.ts
│   ├── usePropertyData.ts
│   ├── useLeadsData.ts
│   ├── useFetch.ts
│   ├── useFormData.ts
│   └── EXPORTS.md                  ← This file
├── providers/
│   ├── index.ts                    ← Use this for imports
│   └── Providers.tsx
└── context/
    └── AuthContext.tsx
```

---

## Best Practices

✅ **DO:**
```tsx
import { useAuth } from '@hooks';
import { Providers } from '@providers';
import type { PropertyRecord } from '@lib/database';
```

❌ **DON'T:**
```tsx
import { useAuth } from '@context/AuthContext';
import { Providers } from '@providers/Providers';
import { PropertiesDB } from '@lib/database'; // Access through usePropertyData hook
```

---

## Re-Exports

The following are exported from index files for convenience:

### From `@hooks`:
- `useAuth` (from `./useAuth.ts`)
- `usePropertyData` (from `./usePropertyData.ts`)
- `useLeadsData` (from `./useLeadsData.ts`)
- `useFetch` (from `./useFetch.ts`)
- `useFormData` (from `./useFormData.ts`)
- `type FetchOptions` (from `./useFetch.ts`)

### From `@providers`:
- `Providers` (from `./Providers.tsx`)

---

## Type Safety

All exports are fully typed:

```tsx
// Type inference works
const { properties } = usePropertyData(); // properties: PropertyRecord[]
const { data } = useFetch<MyType>('/api'); // data: MyType | null
const form = useFormData({ fields: [] }); // form fully typed
```

---

## Import Aliases (tsconfig.json)

```json
{
  "@hooks": "src/hooks",
  "@context": "src/context",
  "@providers": "src/providers",
  "@lib": "src/lib"
}
```

Use path aliases for clean imports. Avoid relative paths.

---

## Summary

| Export | Location | Import |
|--------|----------|--------|
| useAuth | src/hooks | `@hooks` |
| usePropertyData | src/hooks | `@hooks` |
| useLeadsData | src/hooks | `@hooks` |
| useFetch | src/hooks | `@hooks` |
| useFormData | src/hooks | `@hooks` |
| Providers | src/providers | `@providers` |
| AuthContext | src/context | `@context` |
| PropertyRecord | src/lib/database | `@lib/database` |
| LeadRecord | src/lib/database | `@lib/database` |

---

**For Agents D & E:** Use the path aliases (`@hooks`, `@providers`) for all imports. They're already configured in tsconfig.json.
