# React Components Quick Reference

## Import Paths & Component Exports

### 1. Header
```typescript
import Header from '@/components/Header';

// No props required - uses useAuth() context
<Header />
```

### 2. Footer
```typescript
import Footer from '@/components/Footer';

// No props required
<Footer />
```

### 3. PropertyCard
```typescript
import PropertyCard from '@/components/properties/PropertyCard';
import { Property } from '@/lib/types';

interface PropertyCardProps {
  property: Property;
}

// Usage
<PropertyCard property={propertyData} />
```

### 4. MortgageCalculator
```typescript
import MortgageCalculator from '@/components/MortgageCalculator';

// No props required
<MortgageCalculator />
```

### 5. InvestmentCalculator
```typescript
import InvestmentCalculator from '@/components/InvestmentCalculator';

// No props required
<InvestmentCalculator />
```

### 6. ChatbotAI
```typescript
import ChatbotAI from '@/components/ChatbotAI';

// No props required
<ChatbotAI />
```

### 7. CookieConsent
```typescript
import CookieConsent from '@/components/CookieConsent';

// No props required
<CookieConsent />
```

### 8. LoginModal
```typescript
import LoginModal from '@/components/LoginModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Usage
const [isOpen, setIsOpen] = useState(false);
<LoginModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
```

### 9. CoursePlayer
```typescript
import CoursePlayer from '@/components/CoursePlayer';
import { Course } from '@/lib/types';

interface CoursePlayerProps {
  course: Course;
  onProgress?: (percent: number) => void;
}

// Usage
<CoursePlayer course={courseData} onProgress={(p) => console.log(p)} />
```

---

## CSS Module Classes Available

### Header (uses `page.module.css`)
```css
.header
.logoContainer
.brandLogo
.logoText
.mobileToggle
.nav
.navLink
.dropdownContainer
.userMenu
.sessionInfo
```

### Footer (uses `Footer.module.css`)
```css
.footer
.container
.brand
.logoText
.description
.contactInfo
.links
.socialLogos
.bottomBar
.terms
.copyright
```

### PropertyCard (uses `properties/PropertyCard.module.css`)
```css
.card
.imageWrapper
.image
.badge
  .badgeCasa
  .badgeDepartamento
  .badgeTerreno
  .badgeComercial
  .badgeInversion
.featuredRibbon
.statusOverlay
.statusLabel
.content
.price
.title
.location
.locationIcon
.specs
.spec
.specIcon
.specValue
.footer
.viewBtn
.whatsappBtn
```

### MortgageCalculator (uses `MortgageCalculator.module.css`)
```css
.calculator
.title
.inputGroup
.labelRow
.inputWrapper
.prefix
.numberInput
.range
.valueDisplay
.result
.amount
```

### InvestmentCalculator (uses `InvestmentCalculator.module.css`)
```css
.calculator
.title
.inputGroup
.labelRow
.inputWrapper
.prefix
.numberInput
.suffix
.valueDisplay
.resultContainer
.resultItem
.yieldAmount
.totalAmount
```

### ChatbotAI (uses `Chatbot.module.css`)
```css
.container
.toggleButton
.window
.header
.title
.minimize
.close
.messageList
.message
  .messageBubble
  .userMessage
  .aiMessage
.timestamp
.quickReplies
.inputArea
.input
.sendButton
.minimized
```

### LoginModal (uses `LoginModal.module.css`)
```css
.overlay
.modal
.content
.header
.title
.description
.modeSelect
.mode
.form
.field
.label
.input
.error
.passwordStrength
.submit
.link
.toggle
```

### CookieConsent (inline styles)
- No module, uses style prop
- Positioned: `fixed bottom-0 left-0 right-0 z-9999`

### CoursePlayer (uses `CoursePlayer.module.css`)
```css
.container
.player
.video
.controls
.progress
.metadata
.title
.description
.sections
.section
.content
```

---

## Design System Variables Used

### Colors
```css
--bg-color: #FAFAF8                  /* Main background */
--bg-surface: #FFFFFF                /* Cards background */
--bg-card: #FFFFFF
--text-primary: #1A1A2E              /* Main text */
--text-secondary: #4A4A68            /* Secondary text */
--text-muted: #8A8AA0
--accent-blue: #1B3A6B               /* Primary brand blue */
--accent-blue-light: #2D5AA0
--accent-blue-dark: #0F2847
--accent-warm: #C4956A               /* BOHO warm accent */
--accent-warm-light: #D4A97E
--success: #10B981
--warning: #F59E0B
--danger: #EF4444
```

### Glass Effect
```css
--glass-bg: rgba(255, 255, 255, 0.75)
--glass-border: rgba(27, 58, 107, 0.1)
--glass-highlight: rgba(27, 58, 107, 0.04)
```

### Shadows
```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06)
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.07)
--shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.08)
--shadow-card: 0 2px 16px rgba(0, 0, 0, 0.05)
--shadow-card-hover: 0 8px 30px rgba(27, 58, 107, 0.1)
```

### Border Radius
```css
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 24px
--radius-full: 9999px
```

### Transitions
```css
--transition-fast: 150ms ease
--transition-base: 300ms ease
--transition-slow: 500ms ease
```

---

## Key Integration Hooks

### useAuth()
```typescript
const { 
  isLoggedIn,        // boolean
  role,              // 'admin' | 'asesor' | 'cliente'
  fullName,          // string
  email,             // string
  logout,            // () => void
  loginWithPassword, // (email, password) => Promise<boolean>
  register,          // (data) => Promise<boolean>
  checkLoginAttempts,// () => boolean
  incrementLoginAttempts, // () => void
} = useAuth();
```

---

## Utility Functions

### From `lib/propertyData.ts`
```typescript
formatPrice(price: number): string
// Example: formatPrice(500000) → "$500,000"

getPropertyTypeIcon(type: PropertyType): string
// Example: getPropertyTypeIcon('casa') → "🏠"

getWhatsAppLink(property: Property, customText?: string): string
// Returns WhatsApp web link with pre-filled message
```

### From `lib/leadBridge.ts`
```typescript
savePublicLead(data: {
  email: string;
  name?: string;
  phone?: string;
  source: 'newsletter' | 'formulario' | 'whatsapp' | 'chatbot' | 'calculadora';
}): void
```

### From `context/AuthContext.tsx`
```typescript
validatePasswordStrength(password: string): {
  score: number;        // 0-5
  label: string;        // "Muy débil" to "Muy fuerte"
  color: string;        // Hex color
  requirements: Array;  // Met requirements
}

validateEmail(email: string): boolean
```

---

## Button Classes (from `globals.css`)

```css
.btn                 /* Base button */
.btn-primary         /* Blue gradient with shadow */
.btn-secondary       /* Outlined blue */
.btn-warm            /* Warm/brown gradient */
.btn-whatsapp        /* Green WhatsApp style */
```

---

## Component Nesting Hierarchy

```
LayoutShell (src/app/LayoutShell.tsx)
├── Header
├── [Page Content]
│   ├── PropertyCard (in grids)
│   ├── MortgageCalculator (in sections)
│   ├── InvestmentCalculator (in sections)
│   └── LoginModal (from Header user interaction)
├── Footer
└── ChatbotAI (floating)

Root Layout (src/app/layout.tsx)
├── CookieConsent (once)
└── LayoutShell (wrapping pages)
```

---

## Mobile Breakpoints

```css
Mobile:  < 768px   (full width)
Tablet:  768px - 1024px
Desktop: > 1024px

Key breakpoint: @media (max-width: 768px)
```

---

## Common Patterns

### Rendering PropertyCard Grid
```typescript
import PropertyCard from '@/components/properties/PropertyCard';
import { Property } from '@/lib/types';

export default function PropertiesPage() {
  const properties: Property[] = [...];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
      {properties.map(prop => (
        <PropertyCard key={prop.id} property={prop} />
      ))}
    </div>
  );
}
```

### Adding Calculators to Hero Section
```typescript
import MortgageCalculator from '@/components/MortgageCalculator';
import InvestmentCalculator from '@/components/InvestmentCalculator';

export default function HomePage() {
  return (
    <>
      {/* Hero section */}
      <section className={styles.hero}>
        {/* Content */}
      </section>

      {/* Tools section */}
      <section className={styles.tools}>
        <MortgageCalculator />
        <InvestmentCalculator />
      </section>
    </>
  );
}
```

### Managing LoginModal State
```typescript
import { useState } from 'react';
import LoginModal from '@/components/LoginModal';

export default function MyComponent() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <button onClick={() => setShowLogin(true)}>
        Iniciar sesión
      </button>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
```

---

## Common Mistakes to Avoid

❌ **Don't**: Import from wrong path
```typescript
// Wrong
import Header from '@/components/header';  // lowercase path
import Header from 'components/Header';    // no alias
```

✅ **Do**: Use correct path with alias
```typescript
import Header from '@/components/Header';
```

---

❌ **Don't**: Override CSS Module classes with inline styles
```typescript
// Wrong - breaks design system
<div style={{ color: '#000', fontSize: '16px' }}>
```

✅ **Do**: Use CSS Module classes or design system variables
```typescript
// Right - uses module
<div className={styles.title}>

// Right - uses CSS var
<div style={{ color: 'var(--text-primary)' }}>
```

---

❌ **Don't**: Use Tailwind classes
```typescript
// Wrong
<div className="flex items-center gap-4">
```

✅ **Do**: Use CSS Modules
```typescript
// Right
<div className={styles.container}>
```

---

## Ready to Use!

All components are **production-ready** and can be imported directly into Agent E's page templates. No additional setup required beyond the existing AuthContext provider.
