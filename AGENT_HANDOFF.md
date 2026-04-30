# OHB Platform Phase C - Agent Handoff Summary

## Infrastructure Complete ✅

Agent A has completed the infrastructure foundation for Phase C. All agents can now proceed with their specialized work.

---

## What's Ready

### Core Configuration Files

| File | Purpose | Status |
|------|---------|--------|
| `tsconfig.json` | TypeScript config with path aliases | ✅ Complete |
| `next.config.ts` | Next.js config with security headers, image optimization | ✅ Complete |
| `.env.local.example` | Environment variables template | ✅ Complete |
| `.gitignore` | Git ignore patterns (comprehensive) | ✅ Complete |
| `src/middleware.ts` | Route protection and auth validation | ✅ Complete |

### Type System

| File | Contains | Status |
|------|----------|--------|
| `src/lib/types.ts` | All domain types (Property, Lead, User, Course, Order, etc.) | ✅ Enhanced |
| `src/lib/types.ts` | RLS claims, JWT payload, API response types | ✅ New |
| `src/lib/types.ts` | Database row types vs domain types | ✅ New |

### Supabase Integration

| File | Exports | Status |
|------|---------|--------|
| `src/lib/supabaseClient.ts` | `supabase` (browser client, respects RLS) | ✅ Enhanced |
| `src/lib/supabaseClient.ts` | `getServerClient()` (server client, bypasses RLS) | ✅ New |
| `src/lib/supabaseClient.ts` | `queryTyped<T>()`, `handleSupabaseError()` helpers | ✅ New |
| `src/lib/supabaseClient.ts` | `uploadFile()`, `deleteFile()` for storage | ✅ New |
| `src/lib/supabaseClient.ts` | `subscribeToTable()` for real-time | ✅ New |

### Utilities & Constants

| File | Contains | Status |
|------|----------|--------|
| `src/lib/constants.ts` | Company info, design tokens, API config, feature flags | ✅ New |
| `src/lib/utils.ts` | Formatting, validation, storage, async utilities | ✅ New |
| `src/hooks/useAuth.ts` | Authentication context hook | ✅ New |
| `src/hooks/useSupabase.ts` | Real-time and data loading hooks | ✅ New |

### Documentation

| File | Audience | Status |
|------|----------|--------|
| `INFRASTRUCTURE.md` | All agents - complete setup guide | ✅ New |
| `AGENT_HANDOFF.md` | This document | ✅ New |

---

## Path Aliases Available

Use these in imports (no relative paths):

```typescript
@/*              → src/
@components/*    → src/components/
@lib/*           → src/lib/
@types/*         → src/types/
@hooks/*         → src/hooks/
@context/*       → src/context/
@app/*           → src/app/
```

Example:
```typescript
import { Property } from '@lib/types';
import { useAuth } from '@hooks/useAuth';
import { supabase } from '@lib/supabaseClient';
import { COLORS, COMPANY } from '@lib/constants';
import { formatCurrency } from '@lib/utils';
```

---

## Environment Variables Required

### For Development

1. Copy `.env.local.example` to `.env.local`
2. Fill in Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Generate JWT_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. Add other services as needed:
   - Stripe keys (for Agent B)
   - Resend API key (for email)
   - Google Analytics ID (optional)

### Never Commit

- `.env.local` (actual credentials)
- Any `.env*` files with real values
- `*.pem`, `*.key` files

Use `.env.local.example` as the template.

---

## For Agent B (Database & API Routes)

### What You Have

- `src/lib/types.ts` - Type definitions for all entities
- `src/lib/constants.ts` - `SUPABASE_CONFIG` with table/bucket names
- `src/lib/supabaseClient.ts` - `getServerClient()` for server-side operations
- `src/middleware.ts` - Route protection (you add API auth)

### Table & Bucket Names

From `SUPABASE_CONFIG`:

```typescript
Tables:
- users
- properties
- leads
- orders
- courses
- enrollments
- certificates
- transactions

Storage Buckets:
- properties
- courses
- certificates
- profiles
```

### API Route Template

```typescript
// src/app/api/properties/route.ts
import { getServerClient } from '@lib/supabaseClient';
import { Property } from '@lib/types';

export async function GET(req: Request) {
  const supabase = getServerClient();
  
  const { data, error } = await supabase
    .from('properties')
    .select('*');
  
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  
  return Response.json({ data });
}
```

### RLS Policies

Implement RLS on:
- `properties` - Public read, admin write
- `leads` - Admin read, client create own
- `orders` - User read own, admin read all
- `users` - Admin read all, user read self

### Webhook Setup

Create webhook routes for:
- Stripe payment events (`src/app/api/webhooks/stripe/`)
- Supabase auth events (if needed)

---

## For Agent D (Property Management UI)

### What You Have

- Property type: `src/lib/types.ts` → `Property`
- Constants: `src/lib/constants.ts` → `PROPERTY_CONFIG`
- Utilities: `src/lib/utils.ts` → formatting functions
- Hook: `src/hooks/useSupabase.ts` → `useSupabaseData<Property>()`
- Route protection: `/propiedades/*` is public, `/dashboard/properties` is admin-only

### Key Constants

```typescript
import { PROPERTY_CONFIG, COLORS, COMPANY } from '@lib/constants';

PROPERTY_CONFIG.types        // ['casa', 'departamento', 'terreno', ...]
PROPERTY_CONFIG.statuses     // ['activa', 'vendida', 'reservada']
PROPERTY_CONFIG.maxImages    // 20
PROPERTY_CONFIG.minPrice     // 100,000 MXN
PROPERTY_CONFIG.maxPrice     // 100,000,000 MXN

COLORS.primary              // '#D4A843' (gold accent)
COLORS.background           // '#0A0A0F' (dark background)

COMPANY.phone               // '+526561327685'
COMPANY.whatsapp            // '+526561327685'
```

### Loading Properties

```typescript
import { useSupabaseData } from '@hooks/useSupabase';
import { Property } from '@lib/types';

export function PropertiesList() {
  const { data: properties, loading } = useSupabaseData<Property>('properties', [
    { column: 'status', operator: 'eq', value: 'activa' }
  ]);
  
  if (loading) return <div>Cargando...</div>;
  
  return (
    <div>
      {properties?.map(prop => (
        <PropertyCard key={prop.id} property={prop} />
      ))}
    </div>
  );
}
```

### Formatting Values

```typescript
import { formatCurrency, formatPhoneNumber, formatAddress } from '@lib/utils';

formatCurrency(1500000)        // '$1,500,000'
formatPhoneNumber('6561327685') // '656-132-7685'
formatAddress(street, colony, city, state) // Full formatted address
```

### Protected Routes

Dashboard routes are protected by middleware:
- `/dashboard` - Requires admin/asesor role
- `/dashboard/properties` - Property management
- `/propiedades` - Public property listing (no auth needed)

---

## For Agent E (Academy & Courses)

### What You Have

- Course types: `src/lib/types.ts` → `CourseRecord`, `CourseLesson`, `Order`
- Career paths: `src/lib/types.ts` → `CAREER_PATHS`
- Constants: `src/lib/constants.ts` → `COURSE_CONFIG`, `PAYMENT_CONFIG`
- Auth hook: `src/hooks/useAuth.ts` → `useAuth()`
- Route protection: `/academy` is public, `/my-courses` requires auth

### Key Types

```typescript
import {
  CourseRecord,
  CourseLesson,
  CourseEnrollment,
  Order,
  Certificate,
  CareerPath
} from '@lib/types';

interface CourseRecord {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number;      // minutes
  level?: 'basico' | 'intermedio' | 'avanzado';
  careerPath?: 'INFONAVIT' | 'Inversiones' | 'Inmobiliarias';
  price?: number;        // MXN
  topics: string[];
  lessons?: CourseLesson[];
  // ... more fields
}
```

### Course Configuration

```typescript
import { COURSE_CONFIG, PAYMENT_CONFIG } from '@lib/constants';

COURSE_CONFIG.levels           // ['basico', 'intermedio', 'avanzado']
COURSE_CONFIG.careerPaths      // ['INFONAVIT', 'Inversiones', 'Inmobiliarias']
COURSE_CONFIG.maxVideoDuration // 4 hours

PAYMENT_CONFIG.currency        // 'MXN'
PAYMENT_CONFIG.taxRate         // 0.16 (IVA)
PAYMENT_CONFIG.minOrderAmount  // 10,000 MXN
```

### Getting Current User

```typescript
import { useAuth } from '@hooks/useAuth';

export function CourseEnrollPage() {
  const { user, isLoggedIn } = useAuth();
  
  if (!isLoggedIn) {
    return <LoginPrompt />;
  }
  
  return <CourseContent userId={user?.id} />;
}
```

### Loading Courses

```typescript
import { useSupabaseData } from '@hooks/useSupabase';
import { CourseRecord } from '@lib/types';

export function CourseList() {
  const { data: courses } = useSupabaseData<CourseRecord>('courses', [
    { column: 'status', operator: 'eq', value: 'published' }
  ]);
  
  return courses?.map(course => <CourseCard key={course.id} course={course} />);
}
```

### Payment Integration

```typescript
import { PAYMENT_CONFIG } from '@lib/constants';
import { calculateWithTax } from '@lib/utils';

const basePrice = course.price || 0;
const totalWithTax = calculateWithTax(basePrice, PAYMENT_CONFIG.taxRate);
// Pass to Stripe checkout
```

---

## TypeScript Strict Mode

Project uses `strict: true` in `tsconfig.json`:

- No implicit `any`
- Null checks required
- Function return types required
- Type everything!

Example:

```typescript
// ❌ Wrong - missing type
export function getName(user) {
  return user.name;
}

// ✅ Correct - full types
import { User } from '@lib/types';

export function getName(user: User): string {
  return user.name;
}
```

---

## Git Workflow

### Branch Convention

```bash
# Feature branches
git checkout -b feature/dashboard-redesign

# Bug fixes
git checkout -b fix/property-filter-issue

# Chores
git checkout -b chore/update-dependencies
```

### Commit Messages

```
feat: Add property filter system
fix: Correct date formatting in course list
docs: Update API documentation
chore: Update dependencies
```

### Before Pushing

```bash
npm run lint
npm run build
# Fix any errors before committing
```

---

## Security Checklist

Before committing:

- [ ] No `.env.local` files (use `.env.local.example` template)
- [ ] No hardcoded API keys
- [ ] No `console.log()` in production code
- [ ] All user inputs validated
- [ ] Types are strict (no `any`)
- [ ] RLS policies enforced (Agent B)
- [ ] CORS properly configured

---

## Common Issues & Solutions

### "Cannot find module '@components/...'"

- Check path alias in `tsconfig.json`
- Run `npm run build` to validate

### Supabase query returns null

- Check RLS policies (Agent B)
- Verify user is authenticated
- Check `user_id` matches in data

### Next.js middleware not triggering

- Verify pattern in `src/middleware.ts`
- Check cookie names: `ohb_session`, `ohb_role`
- Clear browser cookies and reload

### Type errors with strict mode

- Add explicit return types
- Check for nullable values
- Use `as const` for literal types

---

## Resources

- **CLAUDE.md** - Project brief and requirements
- **INFRASTRUCTURE.md** - Complete setup guide
- **next.config.ts** - Build configuration
- **src/lib/types.ts** - Type definitions (850+ lines)
- **src/lib/constants.ts** - Configuration (700+ lines)
- **src/lib/utils.ts** - Utility functions (700+ lines)

---

## Next Steps

1. **Agent A**: Mark infrastructure complete ✅
2. **Agent B**: Set up database schema and API routes
3. **Agent D**: Build property management UI
4. **Agent E**: Build academy and course system
5. **All**: Test integration points

---

## Support

If you encounter issues:

1. Check `INFRASTRUCTURE.md` first
2. Verify `tsconfig.json` and `next.config.ts`
3. Run `npm run build` for validation
4. Check console errors and logs
5. Review type definitions in `src/lib/types.ts`

---

**Infrastructure Complete**: 2026-04-29  
**Agent**: Agent A (Infrastructure & Setup Coordinator)  
**Status**: Ready for handoff to Agents B, D, E  
**Phase**: Phase C
