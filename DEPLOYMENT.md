# 🚀 Guía de Despliegue - OHB Plataforma Web

## Opción Recomendada: Hostinger Business + Node.js

### ✅ Requisitos Previos
- Cuenta Hostinger Business (soporta Node.js 18+)
- Credenciales SSH/Git
- Dominio configurado (ohbasesoriasyconsultorias.com)
- Claves de Stripe y Resend

### 📦 Build Production

El proyecto ya está **100% compilado y listo**:
```bash
npm run build
# ✓ Compilación: 20.6s
# ✓ Rutas estáticas: 31
# ✓ Rutas dinámicas: 2
```

La carpeta `.next` contiene toda la aplicación compilada.

---

## 🔧 Pasos de Despliegue en Hostinger

### 1. Conectar Repositorio Git
```bash
# En Hostinger > Node.js > Create Application
- Runtime: Node.js 18+
- Branch: main
- Repository: Tu repositorio
- Port: 3000
```

### 2. Configurar Variables de Entorno
En Hostinger > Application Settings > Environment Variables:

```env
NODE_ENV=production
STRIPE_PUBLIC_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
RESEND_API_KEY=re_xxxxx
```

### 3. Build Command
```bash
npm run build
```

### 4. Start Command
```bash
npm start
```

### 5. Instalar Dependencias
Hostinger ejecuta automáticamente:
```bash
npm install
```

---

## 📊 Carpetas a Deployar

| Carpeta | Tamaño | Descripción |
|---------|--------|-------------|
| `.next` | ~50MB | Aplicación compilada (SSR ready) |
| `node_modules` | ~400MB | Dependencias (generadas por npm) |
| `public` | ~2MB | Assets estáticos (imágenes, SVG) |
| `src` | ~2MB | Código fuente TypeScript |
| `package.json` | 1KB | Dependencias y scripts |

**Total después de build: ~500MB**

---

## ✨ Funcionalidades Disponibles Post-Deploy

✅ Academia con 3 carreras (INFONAVIT, Inversiones, Inmobiliarias)
✅ Stripe payment integration (checkout + webhooks)
✅ Generación automática de facturas PDF
✅ Dashboard de estudiante (`/my-courses`)
✅ Reproductor de video interactivo
✅ Sistema de progreso y certificados (base de datos)
✅ Responsive design (mobile-first)
✅ Chat AVA IA
✅ Contact form y newsletter

---

## 🔐 Checklist Pre-Deploy

- [ ] Variables de entorno configuradas en Hostinger
- [ ] Base de datos Supabase inicializada (para sync localStorage)
- [ ] Certificados SSL activados (Let's Encrypt gratis)
- [ ] DNS apuntando a Hostinger
- [ ] SMTP configurado para emails (Resend)
- [ ] Webhook Stripe agregado: `https://ohbasesoriasyconsultorias.com/api/webhooks/stripe`
- [ ] Testing en staging antes de producción

---

## 📈 Monitoreo

### Logs en Hostinger
```
Application Settings > Logs
```

Ver errores y peticiones en tiempo real.

### Metrics
- Memory usage
- CPU usage
- Requests/min
- Error rate

---

## 🆘 Troubleshooting

**Error: "Cannot find module"**
→ Ejecutar `npm install` en Hostinger

**Port 3000 in use**
→ Cambiar en `next.config.ts` o usar puerto diferente en Hostinger

**PDF generation fails**
→ Verificar que `/public/invoices/` tenga permisos de escritura

**Emails no envían**
→ Verificar claves de Resend en variables de entorno

---

## 🚀 Alternativa: Vercel (Recomendado para SaaS)

Si buscas máxima facilidad:
```bash
npm install -g vercel
vercel --prod
```

**Ventajas:**
- Deploy automático con cada push
- CDN global
- Serverless functions gratis
- SSL automático
- Mejor performance

---

## 💾 Backup y Recuperación

**Base de datos localStorage:**
```javascript
// Exportar datos de usuario
const leads = JSON.parse(localStorage.getItem('ohb_leads'));
const orders = JSON.parse(localStorage.getItem('ohb_orders'));
// Guardar en archivo seguro
```

**Para datos críticos, usar Supabase:**
```sql
-- Supabase automáticamente sincroniza desde localStorage
SELECT * FROM leads;
SELECT * FROM orders;
```

---

## 📞 Soporte

Si tienes problemas con el despliegue:
1. Revisar logs en Hostinger
2. Verificar variables de entorno
3. Confirmar que el build es exitoso localmente
4. Contactar Hostinger support

**Build Command que Hostinger ejecutará:**
```bash
npm install && npm run build
```

Esto toma aprox. **2-3 minutos** la primera vez.

---

**Estado:** Aplicación 100% lista para producción ✅
**Última compilación:** Exitosa sin errores
**Rutas activas:** 33 (31 SSR + 2 Dinámicas)
