# OHB Asesorías y Consultorías — Guía del Proyecto

## 🎯 OBJETIVO DEL PROYECTO

Construir y monetizar la plataforma web de **OHB Asesorías y Consultorías**, una empresa inmobiliaria premium en Ciudad Juárez, Chihuahua, México. La **meta financiera es generar $250,000 MXN/mes para el 20 de mayo de 2026.**

## 📋 DATOS CLAVE DEL NEGOCIO

| Dato | Valor |
|------|-------|
| **Empresa** | OHB Asesorías y Consultorías |
| **Dominio** | ohbasesoriasyconsultorias.com |
| **WhatsApp** | 656-132-7685 (formato: +526561327685) |
| **Ubicación** | Tomás Fernández #7818, local 19, Col. Buscari, 32460 Juárez, Chihuahua |
| **Admin email** | jyeskas1111@gmail.com |
| **Logo** | /public/logo-ohb.png (ya existe) |
| **Meta financiera** | $250,000 MXN/mes para 20 de mayo 2026 |
| **Presupuesto inicial** | $0 MXN |

## 🏗️ STACK TÉCNICO

- **Framework**: Next.js 16 + TypeScript + React 19
- **Estilo**: CSS Modules (NO Tailwind) — Tema dark mode premium con acentos dorados (#D4A843)
- **Fuentes**: Inter (body) + Outfit (headings) via next/font/google
- **Base de datos**: localStorage con sync a Supabase (ver src/lib/database.ts)
- **Auth**: Custom auth con sessions, tokens, roles (admin/asesor/cliente) — ver src/context/AuthContext.tsx
- **Deploy target**: Hostinger Business via Git
- **Iconos**: Lucide React + emoji

## 📁 ESTRUCTURA DEL PROYECTO

```
ohb_platform/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout global con SEO/JSON-LD
│   │   ├── globals.css             # Design system completo
│   │   ├── page.tsx                # Homepage con hero, featured props, testimonials, calculators
│   │   ├── page.module.css         # Estilos del homepage y header compartido
│   │   ├── LayoutShell.tsx         # Wrapper: Footer + Chatbot en pages públicas
│   │   ├── propiedades/            # ✅ Portal inmobiliario público
│   │   │   ├── page.tsx            # Listado con filtros (tipo, ubicación, precio, recámaras)
│   │   │   └── [id]/page.tsx       # Ficha individual con galería, formulario, mapa
│   │   ├── about/                  # Página About
│   │   ├── academy/                # Academia pública
│   │   ├── portfolio/              # Portfolio antiguo (redirect a /propiedades)
│   │   ├── services/               # Páginas de servicios
│   │   ├── privacy/                # Aviso de privacidad
│   │   ├── terms/                  # Términos y condiciones
│   │   └── dashboard/              # Panel de administración (requiere login admin/asesor)
│   │       ├── layout.tsx          # Sidebar del dashboard
│   │       ├── page.tsx            # KPIs y métricas
│   │       ├── properties/         # CRUD de propiedades
│   │       ├── leads/              # CRM de leads
│   │       ├── academy/            # CMS de artículos/cursos/infografías
│   │       ├── calendar/           # Agenda de citas
│   │       ├── contacts/           # Contactos
│   │       ├── files/              # Gestor de archivos
│   │       ├── keys/               # Gestión de llaves
│   │       ├── asesores/           # Stats de asesores
│   │       ├── reports/            # Reportes semanales
│   │       ├── usuarios/           # Gestión de usuarios
│   │       ├── ai-chat/            # Chat IA
│   │       └── about-editor/       # Editor de página About
│   ├── components/
│   │   ├── Header.tsx              # Navegación principal con auth
│   │   ├── Footer.tsx              # Footer con newsletter, mapa, redes
│   │   ├── ChatbotAI.tsx           # Chatbot AVA IA
│   │   ├── LoginModal.tsx          # Modal de login/registro
│   │   ├── CookieConsent.tsx       # Banner de cookies
│   │   ├── MortgageCalculator.tsx  # Calculadora de hipoteca
│   │   ├── InvestmentCalculator.tsx # Calculadora de inversión
│   │   ├── EducationSection.tsx    # Sección de academia en homepage
│   │   ├── Portfolio.tsx           # Portfolio antiguo
│   │   ├── RouteGuard.tsx          # Protección de rutas por rol
│   │   └── properties/
│   │       ├── PropertyCard.tsx    # ✅ Card de propiedad premium
│   │       └── PropertyCard.module.css
│   ├── lib/
│   │   ├── database.ts            # Base de datos completa (926 líneas) con CRUD
│   │   ├── types.ts               # ✅ Tipos: Property, Lead, Testimonial, constantes
│   │   ├── propertyData.ts        # ✅ 12 propiedades demo + 5 testimonios + utilities
│   │   └── supabaseClient.ts      # Cliente de Supabase
│   └── context/
│       └── AuthContext.tsx         # Provider de autenticación completo
├── public/
│   ├── logo-ohb.png               # Logo de OHB
│   ├── hero-bg.png                 # Imagen de fondo
│   ├── manifest.json              # PWA manifest
│   ├── robots.txt                  # Robots para SEO
│   └── sitemap.xml                # Sitemap para SEO
└── next.config.ts                  # Config con security headers, redirects, image optimization
```

## 🎨 REGLAS DE DISEÑO

1. **Dark mode obligatorio** — Background: `#0A0A0F`, Surface: `#12121C`, Cards: `#18182A`
2. **Acentos dorados** — Primary: `#D4A843`, Light: `#E8C96A`, Dark: `#B08A2E`
3. **Glassmorphism** — `backdrop-filter: blur(20px)`, borders sutiles
4. **CSS Modules exclusivamente** — NO usar Tailwind ni utility classes
5. **Mobile-first** — 70% del tráfico será móvil
6. **Micro-animaciones** — Hover effects, fade-in, slide-up suaves
7. **WhatsApp prominente** — Es el canal #1 de conversión

## 🔑 DATOS IMPORTANTES PARA EL CÓDIGO

- **WhatsApp links**: `https://wa.me/526561327685?text=...`
- **Admin user**: `jyeskas1111@gmail.com` (se crea automáticamente en database.ts)
- **Fuentes**: Ya configuradas via `next/font/google` en layout.tsx, usar `var(--font-inter)` y `var(--font-outfit)`
- **Imágenes remotas**: Unsplash está permitido en next.config.ts
- **Base de datos**: localStorage con sync a Supabase. Los módulos CRUD están en `database.ts` (UsersDB, PropertiesDB, LeadsDB, ArticlesDB, etc.)

## ⚠️ REGLAS AL PROGRAMAR

1. NUNCA usar Tailwind. Solo CSS Modules.
2. SIEMPRE mantener las variables CSS del design system (globals.css).
3. NUNCA hardcodear teléfonos — usar constantes de `src/lib/types.ts`.
4. Los formularios de leads DEBEN guardar datos en localStorage (key: `ohb_leads`).
5. Cada componente nuevo necesita su `.module.css` correspondiente.
6. Las páginas del dashboard SOLO son accesibles para admin/asesor.
7. Todos los textos en ESPAÑOL (es-MX).
8. El chatbot AVA IA debe estar presente en todas las páginas públicas.
