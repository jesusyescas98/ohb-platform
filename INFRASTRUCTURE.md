# OHB Platform - Infrastructure Setup (Phase C)

This document outlines the complete infrastructure foundation for OHB Platform Phase C.

## Overview

The infrastructure is built on:
- **Next.js 16** with TypeScript 5
- **Supabase** for database, auth, and storage
- **CSS Modules** for styling (no Tailwind)
- **Stripe** for payments (future)
- **Resend** for email (transactional)

## Project Structure

```
ohb_platform/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API routes (Agent B)
│   │   ├── dashboard/        # Protected admin dashboard (Agents D, E)
│   │   ├── propiedades/      # Public property portal (Agent D)
│   │   ├── academy/          # Course platform (Agent E)
│   │   └── layout.tsx        # Global layout with SEO
│   ├── components/           # React components (Agents D, E)
│   ├── context/              # React context (AuthContext)
│   ├── hooks/                # Custom React hooks (NEW - Phase C)
│   │   ├── useAuth.ts        # Auth context hook
│   │   └── useSupabase.ts    # Supabase data hooks
│   ├── lib/
│   │   ├── types.ts          # TypeScript types (ENHANCED - Phase C)
│   │   ├── constants.ts      # Global constants (NEW - Phase C)
│   │   ├── utils.ts          # Utility functions (NEW - Phase C)
│   │   ├── supabaseClient.ts # Supabase clients (ENHANCED - Phase C)
│   │   ├── database.ts       # Data layer (Agent B)
│   │   └── stripe.ts         # Stripe integration (Agent B)
│   └── middleware.ts         # Route protection (NEW - Phase C)
├── public/                   # Static assets
├── next.config.ts            # Next.js config (ENHANCED - Phase C)
├── tsconfig.json             # TypeScript config (ENHANCED - Phase C)
├── .env.local                # Local env vars (ignored by git)
├── .env.local.example        # Template for env vars (NEW - Phase C)
└── .gitignore                # Git ignore patterns (ENHANCED - Phase C)
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

### Required Variables

- **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Supabase anonymous key
- **SUPABASE_SERVICE_ROLE_KEY**: Supabase service role key (server-only)
- **JWT_SECRET**: Secret for JWT signing (min 32 chars)

### Optional Variables

- **NEXT_PUBLIC_STRIPE_PUBLIC_KEY**: Stripe publishable key
- **STRIPE_SECRET_KEY**: Stripe secret key
- **STRIPE_WEBHOOK_SECRET**: Stripe webhook signing secret
- **RESEND_API_KEY**: Resend email service API key
- **NEXT_PUBLIC_GA_ID**: Google Analytics ID

See `.env.local.example` for all available variables.

## TypeScript Configuration

### Path Aliases

Imports use @ aliases for cleaner imports:

```typescript
// Instead of:
import { useAuth } from '../../../context/AuthContext';

// Use:
import { useAuth } from '@context/AuthContext';
```

Available aliases:
- `@/*` - Root src directory
- `@components/*` - Components
- `@lib/*` - Library/utilities
- `@types/*` - Type definitions
- `@hooks/*` - Custom hooks
- `@context/*` - React context
- `@app/*` - App directory

## Type System

### Core Types

All types are in `src/lib/types.ts`:

- **Property** - Real estate property
- **Lead** - Sales lead/contact
- **User** - Platform user (admin, asesor, cliente)
- **Course** - Educational course
- **Order** - Transaction/purchase
- **Transaction** - Payment record
- **Certificate** - Course completion

### Database vs API Types

- **Row Types** (e.g., `PropertyRow`) - Raw database responses
- **Domain Types** (e.g., `Property`) - Business logic types
- **API Types** (e.g., `ApiResponse<T>`) - Response wrappers

### RLS Claims

Row-Level Security claims are in `RLSClaim`:

```typescript
interface RLSClaim {
  user_id: string;
  role: string;
  email: string;
}
```

## Supabase Integration

### Browser Client

Use in React components (respects RLS):

```typescript
import { supabase } from '@lib/supabaseClient';

const { data, error } = await supabase
  .from('properties')
  .select('*');
```

### Server Client

Use in API routes only (bypasses RLS):

```typescript
import { getServerClient } from '@lib/supabaseClient';

const supabase = getServerClient();
const { data, error } = await supabase
  .from('properties')
  .select('*');
```

### Typed Queries

Helper for type-safe queries:

```typescript
import { queryTyped } from '@lib/supabaseClient';
import { Property } from '@lib/types';

const { data, error } = await queryTyped<Property>(
  'properties',
  '*',
  [{ column: 'status', operator: 'eq', value: 'activa' }]
);
```

### Real-time Subscriptions

```typescript
import { useSupabaseRealtime } from '@hooks/useSupabase';
import { Property } from '@lib/types';

export function MyComponent() {
  const { data, loading } = useSupabaseRealtime<Property>('properties');
  // ...
}
```

## Authentication

### Session Cookies

Stored as secure HTTP-only cookies:
- `ohb_session` - JWT session token
- `ohb_role` - User role (admin/asesor/cliente)
- `ohb_fingerprint` - Browser fingerprint

### Routes Protection

Middleware in `src/middleware.ts` protects routes:

- `/dashboard` - Admin/Asesor only
- `/my-courses` - Clients only
- Public routes available to all

### Using Auth

```typescript
import { useAuth } from '@hooks/useAuth';

export function MyComponent() {
  const { user, isLoggedIn, login, logout } = useAuth();
  // ...
}
```

## Constants & Configuration

Global configuration in `src/lib/constants.ts`:

- **COMPANY** - Company info (name, email, phone, etc.)
- **COLORS** - Design tokens (dark theme)
- **SUPABASE_CONFIG** - Table and bucket names
- **AUTH_CONFIG** - Session timeouts
- **ROLES** - Role definitions
- **PASSWORD_REQUIREMENTS** - Security rules
- **FEATURES** - Feature flags
- **ROUTES** - Route definitions

Usage:

```typescript
import { COMPANY, COLORS, ROUTES } from '@lib/constants';

// Company email
COMPANY.email // 'jyeskas1111@gmail.com'

// Design token
COLORS.primary // '#D4A843'

// Navigation
navigate(ROUTES.dashboard.leads)
```

## Utility Functions

In `src/lib/utils.ts`:

### Formatting
- `formatCurrency(amount)` - Format as MXN
- `formatPhoneNumber(phone)` - Format as Mexican phone
- `formatDate(date)` - Format as Spanish date
- `formatDateTime(date)` - Format with time

### Validation
- `isValidEmail(email)` - Email validation
- `isValidPhone(phone)` - Mexican phone validation
- `isValidUrl(url)` - URL validation
- `isStrongPassword(password)` - Password strength check

### Storage
- `getLocalStorage<T>(key)` - Read from localStorage
- `setLocalStorage<T>(key, value)` - Write to localStorage
- `removeLocalStorage(key)` - Delete from localStorage

### Arrays
- `groupBy<T>(array, key)` - Group by property
- `unique<T>(array)` - Remove duplicates
- `sortBy<T>(array, key, order)` - Sort array

### Strings
- `truncate(text, maxLength)` - Truncate with ellipsis
- `capitalize(text)` - Capitalize first letter
- `toSlug(text)` - Convert to URL slug
- `generateId(length)` - Random string

### Objects
- `deepClone<T>(obj)` - Deep copy
- `merge<T>(base, ...overrides)` - Merge objects
- `cn(...classes)` - Join classnames

### Async
- `debounce<T>(func, delay)` - Debounce function
- `throttle<T>(func, limit)` - Throttle function
- `sleep(ms)` - Async delay

## Security

### Security Headers (next.config.ts)

Set via Next.js headers():
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: HSTS
- Content-Security-Policy: Restrictive CSP
- Referrer-Policy: strict-origin-when-cross-origin

### Middleware Security

`src/middleware.ts` enforces:
- Route-based access control
- Session token validation
- Browser fingerprinting
- Secure cookie handling

### Best Practices

1. **Never commit .env.local** - Use .env.local.example template
2. **Use Service Role Key server-only** - Never expose in client
3. **Validate all inputs** - Use validation functions in utils.ts
4. **Secure passwords** - Use PASSWORD_REQUIREMENTS
5. **RLS Policies** - Database enforces access (Agent B sets these up)
6. **CORS/CSP** - next.config.ts restricts external resources

## Middleware Routes

Middleware (`src/middleware.ts`) protects:

```
Protected Routes:
├── /dashboard           (admin/asesor only)
├── /my-courses          (authenticated)
└── /checkout-success    (authenticated)

Public Routes:
├── /                    (home)
├── /about               (about)
├── /academy             (public academy)
├── /propiedades         (property listing)
├── /services/*          (services)
└── /privacy & /terms    (legal)
```

Session cookies are validated before allowing access to protected routes.

## Performance

### Image Optimization

- Unsplash images optimized via Next.js Image
- Supabase Storage images cached with 1-year TTL
- AVIF and WebP formats for modern browsers

### Code Splitting

- Next.js App Router automatic code splitting
- Dynamic imports for large components

### Caching

- Static assets (CSS, fonts, images): 1-year cache
- API responses: Configurable via hooks
- Real-time subscriptions for live data

## Development Workflow

### Setup

```bash
# Install dependencies
npm install

# Copy env template
cp .env.local.example .env.local

# Edit .env.local with your values
# Then start dev server
npm run dev
```

### Build & Test

```bash
# Development
npm run dev

# Production build
npm run build

# Production start
npm start

# Lint code
npm run lint
```

## Integration Points for Other Agents

### Agent B (Database & API)

- Define SQL schemas (referenced in `SUPABASE_CONFIG.tables`)
- Set up RLS policies
- Create API routes in `src/app/api/`
- Implement server-side database operations using `getServerClient()`

### Agent D (Property Management UI)

- Use `Property` type from `src/lib/types.ts`
- Use `useSupabaseData<Property>()` hook for loading
- Use `formatCurrency()` for prices
- Protect routes with middleware
- Use `@components/*` imports

### Agent E (Academy & Courses)

- Use `CourseRecord`, `User`, `Order` types from `src/lib/types.ts`
- Use `COURSE_CONFIG` from `src/lib/constants.ts`
- Use `useAuth()` hook for user data
- Implement course enrollment UI
- Use `formatDateTime()` for timestamps

## Troubleshooting

### Import Issues

- Use `@/*` aliases (no relative paths)
- Check `tsconfig.json` for path definitions
- Run `npm run build` to catch type errors early

### Supabase Connection

- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase dashboard for project status
- Review RLS policies if queries fail

### Auth Issues

- Check session cookie in browser DevTools
- Verify JWT_SECRET is set in environment
- Check middleware logs for route protection issues

### Build Errors

- Run `npm run lint` to check for style issues
- Run `npm run build` to catch TypeScript errors
- Check `next.config.ts` for syntax errors

## References

- Next.js 16: https://nextjs.org
- Supabase: https://supabase.com
- TypeScript: https://www.typescriptlang.org
- Stripe: https://stripe.com
- Resend: https://resend.com

---

**Infrastructure Set Up By**: Agent A (Infrastructure & Setup Coordinator)
**Last Updated**: 2026-04-29
**Phase**: Phase C
