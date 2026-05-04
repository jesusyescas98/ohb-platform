# Guía de Despliegue en Hostinger - OHB Asesorías y Consultorías

Para desplegar esta plataforma en tu dominio `https://ohbasesoriasyconsultorias.com/` en Hostinger, sigue estos pasos:

## 1. Requisitos Previos en Hostinger
- Asegúrate de tener un plan de **Node.js Hosting** o un **VPS**.
- En el Panel de Hostinger (hPanel), ve a la sección de **Node.js** y crea una nueva aplicación.

## 2. Preparación del Código
1. En esta terminal, ejecuta el comando de construcción:
   ```bash
   npm run build
   ```
2. Esto generará una carpeta llamada `.output/` que contiene tanto el servidor como los archivos estáticos optimizados.

## 3. Configuración de Variables de Entorno
Debes configurar las siguientes variables en el panel de Hostinger:
- `VITE_CONVEX_URL`: Tu URL de producción de Convex.
- `OPENROUTER_API_KEY`: Tu llave de OpenRouter para la IA.

## 4. Archivo de Inicio
Hostinger te pedirá un "Entry Point". Configúralo como:
`.output/server/index.mjs`

## 5. Base de Datos Convex
La base de datos ya está configurada para ser "Real-time". No necesitas configurar MySQL o PostgreSQL en Hostinger, ya que todo el backend corre en el cloud de Convex, asegurando velocidad y persistencia.

## 6. SSL
Hostinger instala SSL automáticamente. Asegúrate de que el sitio cargue con `https://`.
