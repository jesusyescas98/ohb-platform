# Terra Agents — WhatsApp AI Agent Blueprint
## Stack: Twilio + Make.com + Claude API + Google Sheets

> **Tier gratuito:** Make.com Free (1,000 ops/mes · 2 escenarios) + Twilio Trial ($15.50 crédito) + Google Sheets (ilimitado)

---

## Arquitectura general

```
Usuario WhatsApp
       │
       ▼
  Twilio (recibe)
       │  HTTP POST (webhook)
       ▼
  Make.com Scenario
       │
       ├─► Claude Haiku API ──► clasifica intención + genera respuesta
       │
       ├─► Google Sheets "Propiedades" ──► busca coincidencias (si aplica)
       │
       ├─► Twilio (envía respuesta al usuario)
       │
       └─► Google Sheets "Logs" ──► registra interacción
```

**Costo estimado por mensaje recibido:**
- Make.com: ~4 operaciones/mensaje = 250 mensajes/mes en free tier
- Claude Haiku: ~$0.001 USD/mensaje (clasificación + respuesta corta)
- Twilio: ~$0.005 USD/mensaje enviado (descontado del crédito trial)

---

## Pre-requisitos

| Herramienta | URL | Tier necesario |
|---|---|---|
| Make.com | https://www.make.com | Free |
| Twilio | https://www.twilio.com | Trial |
| Anthropic API | https://console.anthropic.com | Pay-as-you-go |
| Google Sheets | sheets.google.com | Free |
| Google Cloud (Apps Script) | script.google.com | Free |

---

## PASO 1 — Configurar Twilio WhatsApp Sandbox

### 1.1 Crear cuenta Twilio
1. Regístrate en twilio.com → verifica tu número de teléfono.
2. En el dashboard, ve a **Messaging → Try it out → Send a WhatsApp message**.
3. Twilio te dará un número sandbox (ej. `+1 415 523 8886`) y una frase de activación (`join <palabra>`).
4. Desde tu WhatsApp personal, envía esa frase al número sandbox para activar el sandbox.

### 1.2 Configurar el webhook de Twilio
1. En Twilio Console: **Messaging → Settings → WhatsApp Sandbox Settings**.
2. En el campo **"When a message comes in"**, pega la URL del webhook de Make.com (la obtienes en el Paso 2).
3. Método: `HTTP POST`.
4. Guarda.

> **Para producción:** necesitas solicitar acceso a WhatsApp Business API en Twilio (aprobación Meta, ~1-3 días). El sandbox es funcional para pruebas ilimitadas.

---

## PASO 2 — Crear el Escenario en Make.com

### Documentación oficial Make.com
- Introducción a escenarios: https://www.make.com/en/help/scenarios
- Módulo Webhooks: https://www.make.com/en/help/tools/webhooks
- Módulo HTTP (llamadas API): https://www.make.com/en/help/apps/http
- Módulo Google Sheets: https://www.make.com/en/help/apps/google-sheets

---

### 2.1 Módulo 1 — Webhook (trigger)

1. En Make.com, crea un nuevo escenario.
2. Primer módulo: **Webhooks → Custom webhook**.
3. Haz clic en **"Add"** → dale un nombre: `twilio-whatsapp-in`.
4. Copia la URL generada (ej. `https://hook.make.com/abc123xyz`).
5. Pégala en Twilio (Paso 1.2).
6. Haz clic en **"Redetermine data structure"** y envía un WhatsApp de prueba al sandbox para que Make.com detecte el schema automáticamente.

**Campos que Twilio enviará (Form Data):**
```
Body          → texto del mensaje del usuario
From          → número del usuario (ej. whatsapp:+526561234567)
To            → tu número Twilio sandbox
MessageSid    → ID único del mensaje
ProfileName   → nombre del usuario en WhatsApp
```

---

### 2.2 Módulo 2 — Clasificar con Claude API (HTTP module)

1. Añade módulo: **HTTP → Make a request**.
2. Configura:

```
URL:     https://api.anthropic.com/v1/messages
Method:  POST
Headers:
  x-api-key:         TU_ANTHROPIC_API_KEY
  anthropic-version: 2023-06-01
  content-type:      application/json

Body (JSON):
{
  "model": "claude-haiku-4-5-20251001",
  "max_tokens": 400,
  "system": "Eres AVA, agente inmobiliario IA de Terra Agents. Clasifica el mensaje del usuario en una de estas intenciones: BUSCAR_PROPIEDAD, PRECIO_AGENTE, AGENDAR_CITA, INFORMACION_GENERAL, FUERA_DE_TEMA. Responde siempre en JSON con este formato exacto: {\"intent\": \"INTENT_AQUI\", \"respuesta\": \"TU_RESPUESTA_AQUI\", \"datos_extraidos\": {\"tipo\": null, \"precio_max\": null, \"recamaras\": null, \"zona\": null}}. Respuesta máximo 160 caracteres. Tono: profesional y cálido.",
  "messages": [
    {
      "role": "user",
      "content": "{{1.Body}}"
    }
  ]
}
```

3. En **Parse response**: activa **"Yes"**.
4. Resultado disponible como: `{{2.data.content[].text}}` (el JSON de Claude).

---

### 2.3 Módulo 3 — Parsear respuesta de Claude (JSON Parser)

1. Añade módulo: **Tools → Parse JSON**.
2. Input: `{{2.data.content[1].text}}` (el string JSON que devuelve Claude).
3. Esto expone: `{{3.intent}}`, `{{3.respuesta}}`, `{{3.datos_extraidos.tipo}}`, etc.

---

### 2.4 Módulo 4 — Buscar propiedad en Sheets (condicional)

Solo ejecutar si `{{3.intent}} = BUSCAR_PROPIEDAD`:

1. Añade un **Router** antes de este módulo.
2. Rama A — condición: `{{3.intent}}` equal to `BUSCAR_PROPIEDAD`.
3. En Rama A, añade módulo: **Google Sheets → Search Rows**.
4. Configura:
   - Spreadsheet: selecciona tu Google Sheet (ver Paso 3).
   - Sheet: `Propiedades`.
   - Filter: columna `Status` = `Disponible`.
   - Limit: `3` (máximo 3 resultados para no saturar la respuesta).
5. Rama B (todo lo demás): pasa directamente al módulo de respuesta.

---

### 2.5 Módulo 5 — Formatear respuesta final

1. Añade módulo: **Tools → Set Variable** o usa directamente en el siguiente módulo.
2. Lógica:
   - Si intent = `BUSCAR_PROPIEDAD` y hay resultados en Sheets → combina `{{3.respuesta}}` + listado de propiedades encontradas.
   - En cualquier otro caso → usa `{{3.respuesta}}` directamente.

Ejemplo de texto compuesto para propiedades:
```
{{3.respuesta}}

🏠 Encontré estas opciones:
{{4.Tipo}} en {{4.Zona}} — ${{4.Precio}} MXN
📐 {{4.M2}}m² · {{4.Recamaras}} rec · {{4.Banos}} baños
Ver más: {{4.URL}}
```

---

### 2.6 Módulo 6 — Enviar respuesta por Twilio (HTTP)

1. Añade módulo: **HTTP → Make a request**.
2. Configura:

```
URL:    https://api.twilio.com/2010-04-01/Accounts/TU_ACCOUNT_SID/Messages.json
Method: POST
Auth:   Basic Auth
  Username: TU_ACCOUNT_SID
  Password:  TU_AUTH_TOKEN

Body (application/x-www-form-urlencoded):
  From: whatsapp:+14155238886   ← tu número Twilio sandbox
  To:   {{1.From}}              ← número del usuario (ya viene con "whatsapp:")
  Body: {{RESPUESTA_FINAL}}     ← del módulo 5
```

---

### 2.7 Módulo 7 — Log en Google Sheets

1. Añade módulo: **Google Sheets → Add a Row**.
2. Sheet: `Logs`.
3. Campos:

| Columna Sheet | Valor Make.com |
|---|---|
| Timestamp | `{{now}}` |
| Telefono | `{{1.From}}` |
| Nombre | `{{1.ProfileName}}` |
| Mensaje_Usuario | `{{1.Body}}` |
| Intent_Clasificado | `{{3.intent}}` |
| Respuesta_Enviada | `{{RESPUESTA_FINAL}}` |
| MessageSid | `{{1.MessageSid}}` |
| Ops_Usadas | `7` (constante para tracking manual) |

---

### 2.8 Control de operaciones (Free Tier)

El escenario consume **7 operaciones por mensaje** en el flujo completo (6 si no hay búsqueda de propiedad).

Con 1,000 ops/mes: **~142 conversaciones completas/mes**.

**Estrategia para maximizar:**
- Añade un filtro en el Webhook: si `{{1.Body}}` está vacío o es un mensaje de sistema de Twilio (como "Sent from your Twilio trial"), detén el escenario sin consumir ops.
- Desactiva el escenario fuera de horario laboral con **Make.com Scheduling** (solo activo lun-vie 9am-6pm CST).

---

## PASO 3 — Estructura Google Sheets

> Crea un Google Sheet llamado **"Terra Agents — CRM"** con 3 pestañas.

### Pestaña 1: `Propiedades`

| ID | Tipo | Zona | Precio | Recamaras | Banos | M2 | Status | URL | Descripcion | Agente_Contacto |
|---|---|---|---|---|---|---|---|---|---|---|
| P001 | Casa | Lomas de Poleo | 1800000 | 3 | 2 | 120 | Disponible | https://... | Casa nueva... | 6561234567 |

**Columnas obligatorias:** `ID`, `Tipo`, `Zona`, `Precio`, `Status`
**Status válidos:** `Disponible`, `Vendida`, `Apartada`, `Pausada`

---

### Pestaña 2: `Intenciones`

| Intent | Keywords_ES | Respuesta_Template | Escalar_Humano |
|---|---|---|---|
| BUSCAR_PROPIEDAD | casa, depa, renta, venta, busco, necesito | Déjame buscar opciones para ti... | FALSE |
| PRECIO_AGENTE | cuánto cuesta, precio, tarifa, cobran | Nuestro agente IA... | FALSE |
| AGENDAR_CITA | cita, visita, ver, agendar, cuando | Con gusto agendo... | TRUE |
| INFORMACION_GENERAL | qué hacen, servicios, quiénes son | Somos Terra Agents... | FALSE |
| FUERA_DE_TEMA | (cualquier otro) | Por el momento solo puedo... | FALSE |

> Esta pestaña es solo referencia para el prompt de Claude. No la lee Make.com directamente.

---

### Pestaña 3: `Logs`

| Timestamp | Telefono | Nombre | Mensaje_Usuario | Intent_Clasificado | Respuesta_Enviada | MessageSid | Escalado |
|---|---|---|---|---|---|---|---|
| (auto) | (auto) | (auto) | (auto) | (auto) | (auto) | (auto) | FALSE |

---

## PASO 4 — Sistema de Prompts Claude

### Prompt de sistema (actualiza en Módulo 2):

```
Eres AVA, agente inmobiliaria IA de Terra Agents en Ciudad Juárez, México.

INTENCIONES POSIBLES:
- BUSCAR_PROPIEDAD: usuario quiere comprar/rentar inmueble
- PRECIO_AGENTE: pregunta sobre el costo del servicio de agente IA
- AGENDAR_CITA: quiere visitar una propiedad o hablar con humano
- INFORMACION_GENERAL: preguntas sobre Terra Agents
- FUERA_DE_TEMA: mensaje irrelevante

REGLAS:
1. Responde SOLO con JSON válido, sin texto adicional
2. Campo "respuesta" máximo 160 caracteres
3. Tono: profesional, cálido, local (usa "ahorita", "oiga", "con gusto")
4. Si intent = AGENDAR_CITA, incluye en respuesta: "Te paso con un asesor humano"
5. No inventes propiedades; espera los datos del sistema

FORMATO DE RESPUESTA OBLIGATORIO:
{
  "intent": "INTENT_AQUI",
  "respuesta": "Texto de respuesta al usuario",
  "datos_extraidos": {
    "tipo": "Casa|Departamento|Local|Terreno|null",
    "precio_max": 0,
    "recamaras": 0,
    "zona": "nombre_zona|null"
  },
  "escalar": false
}
```

---

## PASO 5 — Testing

### Checklist antes de activar en producción:

- [ ] Enviar "hola" al sandbox → debe responder en <10 segundos
- [ ] Enviar "busco casa en lomas de poleo 3 recámaras" → debe consultar Sheets y devolver propiedades
- [ ] Enviar "cuánto cuesta el agente" → debe responder con pricing
- [ ] Enviar "quiero agendar visita" → debe responder con escalamiento
- [ ] Enviar texto en inglés → debe responder en español
- [ ] Verificar log en pestaña Logs del Sheet
- [ ] Verificar contador de ops en Make.com dashboard

---

## ALTERNATIVAS DE MIGRACIÓN FUTURA

### Si superas 1,000 ops/mes en Make.com:

| Opción | Costo | Complejidad | Ideal para |
|---|---|---|---|
| **Make.com Core** | $9 USD/mes · 10,000 ops | Baja | Primera escala |
| **n8n Cloud** | $20 USD/mes · ilimitado | Media | Control total del workflow |
| **n8n Self-hosted** | VPS ~$5 USD/mes (Railway/Render free tier) | Alta | Costo mínimo a largo plazo |
| **Python + FastAPI local** | $0 (corre en tu PC) | Alta | Desarrollo y pruebas |
| **Python + FastAPI en servidor** | VPS $5-10 USD/mes | Alta | Producción robusta |
| **Huginn** | VPS ~$5 USD/mes | Muy alta | Open-source puro |
| **Zapier** | $19.99 USD/mes · 750 tasks | Baja | Si ya usas Google Workspace |

### Migración recomendada (path de crecimiento):

```
Make.com Free (0-142 msgs/mes)
       ↓ [cuando superes límite]
Make.com Core $9/mes (0-1,400 msgs/mes)
       ↓ [cuando superes límite o quieras más control]
n8n Self-hosted en Railway/Render (ilimitado · $5-7/mes VPS)
       ↓ [cuando necesites lógica compleja]
Python FastAPI custom (servidor propio · control total)
```

### Script de migración a n8n (cuando llegue el momento):
El workflow de Make.com se puede replicar 1:1 en n8n con los mismos módulos:
- Webhook trigger → Twilio trigger node
- HTTP (Claude) → HTTP Request node
- Google Sheets → Google Sheets node
- La lógica es idéntica; solo cambia la UI de configuración.

---

## Resumen de operaciones por mes (Free Tier)

| Acción | Ops consumidas |
|---|---|
| Recibir mensaje (webhook) | 1 |
| Llamar Claude API | 1 |
| Parse JSON | 1 |
| Buscar en Sheets (si aplica) | 1 |
| Enviar respuesta Twilio | 1 |
| Log en Sheets | 1 |
| **Total por conversación** | **5-6** |
| **Conversaciones posibles/mes** | **~166** |

> Con 1,000 ops = ~166 conversaciones completas. Suficiente para fase de prueba y primeros 10-20 clientes de Terra Agents.
