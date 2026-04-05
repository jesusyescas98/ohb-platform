# Hostinger Setup - Guía Paso a Paso

## 1️⃣ Crear Aplicación Node.js en Hostinger

1. Inicia sesión en tu panel de **Hostinger**
2. Ir a: **Aplicaciones > Node.js**
3. Click en **"Crear Aplicación"**
4. Selecciona:
   - **Runtime:** Node.js 18 LTS o superior
   - **Port:** 3000
   - **Domain:** ohbasesoriasyconsultorias.com

---

## 2️⃣ Conectar Repositorio Git

1. En la aplicación creada, ir a **Settings > Repository**
2. Click en **"Connect Repository"**
3. Autorizar GitHub
4. Seleccionar: `OHB-Asesorias/ohb_platform` (o tu repositorio)
5. **Branch:** main
6. Click **"Connect"**

---

## 3️⃣ Configurar Build & Start Commands

### Build Command:
```bash
npm install && npm run build
```

### Start Command:
```bash
npm start
```

En Hostinger:
- Applications > [Tu App] > Settings > Build & Deploy
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

---

## 4️⃣ Variables de Entorno (.env)

Ir a: **Settings > Environment Variables**

Agregar TODAS estas variables:

```env
NODE_ENV=production

# Stripe (obtener de https://dashboard.stripe.com)
STRIPE_PUBLIC_KEY=pk_live_51234567890
STRIPE_SECRET_KEY=sk_live_98765432101
STRIPE_WEBHOOK_SECRET=whsec_1234567890

# Resend API (obtener de https://resend.com)
RESEND_API_KEY=re_1234567890abcdef

# Supabase (opcional, para sync de datos)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxx

# Domain
NEXT_PUBLIC_DOMAIN=https://ohbasesoriasyconsultorias.com
```

---

## 5️⃣ SSL Certificate

Hostinger automáticamente configura SSL gratis con Let's Encrypt.

**Verificar:**
- Applications > [Tu App] > Settings > SSL Certificate
- Debe decir: "✅ Active"

---

## 6️⃣ Deploy Manual

Después de configurar:

1. Ir a: **Applications > [Tu App] > Overview**
2. Click en **"Redeploy"**
3. Esperar 3-5 minutos para que compile
4. Ver logs en **"Logs"** tab

---

## 7️⃣ Configurar Stripe Webhook

1. Ir a Stripe Dashboard: https://dashboard.stripe.com
2. Developers > Webhooks
3. Click "Add endpoint"
4. Endpoint URL:
   ```
   https://ohbasesoriasyconsultorias.com/api/webhooks/stripe
   ```
5. Select events:
   - `checkout.session.completed`
6. Click "Create endpoint"
7. Copiar "Signing secret" (whsec_...)
8. Pegar en Hostinger env como `STRIPE_WEBHOOK_SECRET`

---

## 8️⃣ Testing Pre-Deploy

### En Local (antes de pushar):
```bash
npm run build     # Compila sin errores
npm start         # Inicia servidor
```

### En Hostinger:
1. Abrir: https://ohbasesoriasyconsultorias.com
2. Verificar homepage carga
3. Ir a: https://ohbasesoriasyconsultorias.com/academy
4. Ir a: https://ohbasesoriasyconsultorias.com/checkout
5. Ir a: https://ohbasesoriasyconsultorias.com/my-courses

---

## 🔍 Troubleshooting

### Aplicación no inicia
**Error en logs:** `Cannot find module`
**Solución:**
```bash
# En Hostinger terminal
npm install
npm run build
```

### Puerto ya en uso
**Error:** `EADDRINUSE: address already in use`
**Solución:** Hostinger automáticamente asigna puerto disponible

### Build falla
**Solución:**
1. Verificar que `npm run build` funciona en local
2. Revisar Node.js version (debe ser 18+)
3. Limpiar cache: `rm -rf .next node_modules && npm install`

### Emails no envían
**Solución:**
1. Verificar `RESEND_API_KEY` en variables de entorno
2. Verificar que Resend está en plan de pago
3. Revisar logs para ver error específico

---

## 📊 Monitorear Aplicación

### Acceder a Logs
Applications > [Tu App] > Logs

Buscar por:
- Errors: "error" o "Error"
- Requests: "GET /academy"
- Webhook events: "webhook"

### Metrics
Applications > [Tu App] > Metrics
- Memory usage
- CPU
- Requests per minute
- Response time

---

## 🔄 Auto-Deploy

Después de configurar el repositorio, cada push a `main` despliega automáticamente:

```bash
git push origin main
# ↓
# Hostinger detecta cambios
# ↓
# npm install && npm run build
# ↓
# npm start
# ↓
# ✅ Sitio actualizado en 3-5 min
```

---

## 📈 Performance Tips

1. **Caché estático:** Las 31 páginas prerrenderizadas tienen TTL de 24h
2. **Compresión:** Next.js automáticamente comprime assets
3. **CDN:** Hostinger usa CDN global (images, CSS, JS)
4. **Optimización:** Imágenes automáticamente servidas en WebP

---

## 🆘 Soporte Hostinger

Si necesitas ayuda:
- Email: support@hostinger.com
- Chat: Panel de Hostinger > Help
- Status: https://status.hostinger.com

---

**Setup completo toma: 15-20 minutos**
**Primera compilación: 3-5 minutos**
**Redeploys subsecuentes: 2-3 minutos**
