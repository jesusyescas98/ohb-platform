/**
 * Terra Agents — Google Sheets Seed Script
 *
 * INSTRUCCIONES:
 * 1. Abre tu Google Sheet "Terra Agents — CRM"
 * 2. Ve a Extensiones → Apps Script
 * 3. Pega este código completo
 * 4. Ejecuta la función: setupTerraAgentsCRM()
 * 5. Autoriza los permisos cuando se pidan
 *
 * Crea automáticamente las 3 pestañas con headers, datos demo y formato.
 */

function setupTerraAgentsCRM() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  setupPropiedades(ss);
  setupIntenciones(ss);
  setupLogs(ss);

  SpreadsheetApp.getUi().alert('✅ Terra Agents CRM configurado correctamente.\n\nPestañas creadas:\n• Propiedades (12 registros demo)\n• Intenciones (5 intents)\n• Logs (vacío, listo para Make.com)');
}


// ══════════════════════════════════════════
// PESTAÑA 1: PROPIEDADES
// ══════════════════════════════════════════

function setupPropiedades(ss) {
  let sheet = ss.getSheetByName('Propiedades');
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet('Propiedades');

  const headers = [
    'ID', 'Tipo', 'Zona', 'Precio', 'Recamaras', 'Banos',
    'M2', 'Status', 'URL', 'Descripcion', 'Agente_Contacto', 'Fecha_Alta'
  ];

  const propiedades = [
    ['P001', 'Casa', 'Lomas de Poleo',       1800000, 3, 2, 120, 'Disponible', 'https://terrastudio.com.mx/props/p001', 'Casa nueva con jardín, cocina integral, 2 autos. Residencial cerrado.',    '6561234567', '2025-04-01'],
    ['P002', 'Casa', 'Lomas de Poleo',       2200000, 4, 3, 160, 'Disponible', 'https://terrastudio.com.mx/props/p002', 'Casa de lujo, sala de cine, alberca, cuarto de servicio.',                  '6561234567', '2025-04-01'],
    ['P003', 'Departamento', 'Centro',        850000, 2, 1,  75, 'Disponible', 'https://terrastudio.com.mx/props/p003', 'Depa remodelado, planta baja, estacionamiento incluido.',                   '6569876543', '2025-04-05'],
    ['P004', 'Departamento', 'Campestre',    1200000, 3, 2,  95, 'Disponible', 'https://terrastudio.com.mx/props/p004', 'Depa en torre con gym, asador, vigilancia 24/7.',                           '6569876543', '2025-04-05'],
    ['P005', 'Casa', 'Misión de los Lagos',  3500000, 4, 4, 220, 'Disponible', 'https://terrastudio.com.mx/props/p005', 'Residencia premium, estudio, roof garden, 3 autos, circuito cerrado.',     '6561234567', '2025-04-10'],
    ['P006', 'Casa', 'Haciendas del Valle',  1500000, 3, 2, 110, 'Disponible', 'https://terrastudio.com.mx/props/p006', 'Casa en coto, jardín amplio, nueva, 1 dueño.',                              '6562345678', '2025-04-10'],
    ['P007', 'Local', 'Blvd. Díaz Ordaz',    4800000, 0, 2, 180, 'Disponible', 'https://terrastudio.com.mx/props/p007', 'Local comercial en zona de alto tráfico, bodega, 3 cajones.',              '6563456789', '2025-04-12'],
    ['P008', 'Terreno', 'Zaragoza',           650000, 0, 0, 200, 'Disponible', 'https://terrastudio.com.mx/props/p008', 'Terreno plano, escrituras limpias, todos servicios, colonia consolidada.',  '6564567890', '2025-04-12'],
    ['P009', 'Casa', 'Satélite',             1100000, 3, 2,  95, 'Disponible', 'https://terrastudio.com.mx/props/p009', 'Casa bien ubicada, a 5 min de IMSS, escuelas cercanas.',                   '6565678901', '2025-04-15'],
    ['P010', 'Departamento', 'Pronaf',        780000, 1, 1,  60, 'Disponible', 'https://terrastudio.com.mx/props/p010', 'Estudio moderno, full amueblado opcional, zona turística.',                '6566789012', '2025-04-15'],
    ['P011', 'Casa', 'Los Nogales',          2800000, 4, 3, 180, 'Apartada',   'https://terrastudio.com.mx/props/p011', 'Casa esquina, ampliable, 2 niveles, alberca.',                             '6561234567', '2025-04-18'],
    ['P012', 'Casa', 'Valle Dorado',         1350000, 3, 2, 105, 'Vendida',    'https://terrastudio.com.mx/props/p012', 'Casa modelo, equipada, excelente ubicación.',                              '6562345678', '2025-04-20'],
  ];

  // Write headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#1A1A1A');
  headerRange.setFontColor('#CFA67A');

  // Write data
  sheet.getRange(2, 1, propiedades.length, headers.length).setValues(propiedades);

  // Color rows by status
  for (let i = 0; i < propiedades.length; i++) {
    const status = propiedades[i][7];
    const rowRange = sheet.getRange(i + 2, 1, 1, headers.length);
    if (status === 'Vendida')   rowRange.setBackground('#2d1f1f');
    if (status === 'Apartada')  rowRange.setBackground('#2d2a1f');
    if (status === 'Disponible') rowRange.setBackground('#1f2d1f');
  }

  // Format price column as currency
  sheet.getRange(2, 4, propiedades.length, 1).setNumberFormat('$#,##0');

  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);

  // Freeze header row
  sheet.setFrozenRows(1);

  // Add dropdown validation for Status column
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Disponible', 'Apartada', 'Vendida', 'Pausada'], true)
    .build();
  sheet.getRange(2, 8, 100, 1).setDataValidation(statusRule);

  Logger.log('✓ Pestaña Propiedades creada con ' + propiedades.length + ' registros.');
}


// ══════════════════════════════════════════
// PESTAÑA 2: INTENCIONES
// ══════════════════════════════════════════

function setupIntenciones(ss) {
  let sheet = ss.getSheetByName('Intenciones');
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet('Intenciones');

  const headers = [
    'Intent_ID', 'Keywords_Trigger_ES', 'Respuesta_Template', 'Escalar_Humano', 'Prioridad', 'Notas'
  ];

  const intenciones = [
    [
      'BUSCAR_PROPIEDAD',
      'busco, quiero, necesito, buscando, tienes, hay, casa, depa, departamento, renta, venta, comprar, local, terreno, recámaras, cuartos, precio, zona, colonia',
      'Con gusto te ayudo a encontrar tu propiedad ideal 🏠 ¿Me puedes decir el tipo (casa/depa), zona aproximada y tu presupuesto?',
      'FALSE',
      1,
      'Intent principal — activa búsqueda en pestaña Propiedades'
    ],
    [
      'PRECIO_AGENTE',
      'cuánto cobran, costo del agente, precio del servicio, tarifa, cuánto cuesta contratar, qué incluye',
      'Nuestro agente IA trabaja 24/7 calificando leads y respondiendo WhatsApp. Desde $2,500 MXN/mes. ¿Te mando detalles?',
      'FALSE',
      2,
      'Pitch del producto Terra Agents — no busca en Propiedades'
    ],
    [
      'AGENDAR_CITA',
      'quiero ver, visita, agendar, cuando puedo, horarios, cita, me gustaría conocer, ir a ver',
      'Con gusto agendo tu visita 📅 Déjame contactarte con un asesor humano ahora mismo.',
      'TRUE',
      3,
      'Escala a humano — campo Escalado = TRUE en log'
    ],
    [
      'INFORMACION_GENERAL',
      'qué hacen, quiénes son, cómo funciona, de dónde son, ciudad juárez, información, cuéntame',
      'Somos Terra Agents 🤖 Desarrollamos agentes IA para inmobiliarias en Juárez. ¿Buscas propiedad o quieres el agente para tu negocio?',
      'FALSE',
      4,
      'Respuesta general — redirige a BUSCAR o PRECIO_AGENTE'
    ],
    [
      'FUERA_DE_TEMA',
      '(cualquier mensaje no clasificado en los anteriores)',
      'Hola, soy AVA de Terra Agents 👋 Puedo ayudarte a buscar propiedades en Juárez o informarte sobre nuestros agentes IA. ¿Qué necesitas?',
      'FALSE',
      5,
      'Fallback — siempre responde con opciones claras'
    ],
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#1A1A1A');
  headerRange.setFontColor('#CFA67A');

  sheet.getRange(2, 1, intenciones.length, headers.length).setValues(intenciones);

  // Color rows by priority
  const colors = ['#1f2d1f', '#1f261f', '#2d2a1f', '#1f1f2d', '#2a1f1f'];
  for (let i = 0; i < intenciones.length; i++) {
    sheet.getRange(i + 2, 1, 1, headers.length).setBackground(colors[i] || '#222');
  }

  sheet.autoResizeColumns(1, headers.length);
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(2, 300); // Keywords column wider
  sheet.setColumnWidth(3, 350); // Template column wider

  Logger.log('✓ Pestaña Intenciones creada con ' + intenciones.length + ' intents.');
}


// ══════════════════════════════════════════
// PESTAÑA 3: LOGS
// ══════════════════════════════════════════

function setupLogs(ss) {
  let sheet = ss.getSheetByName('Logs');
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet('Logs');

  const headers = [
    'Timestamp', 'Telefono', 'Nombre_WhatsApp',
    'Mensaje_Usuario', 'Intent_Clasificado', 'Respuesta_Enviada',
    'MessageSid', 'Escalado', 'Ops_Usadas', 'Semana_ISO'
  ];

  // Seed row de ejemplo (para que Make.com detecte el schema)
  const seedRow = [
    new Date().toISOString(),
    'whatsapp:+526561234567',
    'Cliente Demo',
    'hola busco casa en lomas de poleo 3 recámaras máximo 2 millones',
    'BUSCAR_PROPIEDAD',
    '🏠 Encontré 2 opciones en Lomas de Poleo dentro de tu presupuesto. ¿Te las muestro?',
    'SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'FALSE',
    6,
    getISOWeek(new Date())
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#1A1A1A');
  headerRange.setFontColor('#CFA67A');

  sheet.getRange(2, 1, 1, headers.length).setValues([seedRow]);
  sheet.getRange(2, 1, 1, headers.length).setBackground('#2a2a1a').setFontColor('#888888').setFontStyle('italic');

  // Format timestamp column
  sheet.getRange(2, 1, 1000, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');

  // Add boolean dropdown for Escalado
  const escaladoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['TRUE', 'FALSE'], true)
    .build();
  sheet.getRange(2, 8, 1000, 1).setDataValidation(escaladoRule);

  sheet.autoResizeColumns(1, headers.length);
  sheet.setFrozenRows(1);

  // Comment on seed row
  sheet.getRange(2, 1).setNote('⚠ Fila de ejemplo. Puedes eliminarla cuando tengas logs reales de Make.com.');

  Logger.log('✓ Pestaña Logs creada lista para Make.com.');
}


// ══════════════════════════════════════════
// FUNCIONES DE UTILIDAD
// ══════════════════════════════════════════

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}


// ══════════════════════════════════════════
// FUNCIÓN EXTRA: Reporte semanal de ops
// Corre esto manualmente o programa con trigger
// ══════════════════════════════════════════

function reporteOpsSemanales() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logs = ss.getSheetByName('Logs');

  if (!logs) {
    Logger.log('❌ No existe pestaña Logs');
    return;
  }

  const data = logs.getDataRange().getValues();
  const semanaActual = getISOWeek(new Date());

  let totalOps = 0;
  let totalMensajes = 0;
  const intentCount = {};

  for (let i = 1; i < data.length; i++) {
    const semana = data[i][9]; // columna Semana_ISO
    if (semana == semanaActual) {
      totalMensajes++;
      totalOps += Number(data[i][8]) || 6; // columna Ops_Usadas
      const intent = data[i][4] || 'DESCONOCIDO';
      intentCount[intent] = (intentCount[intent] || 0) + 1;
    }
  }

  const opsRestantes = 1000 - totalOps;
  const pct = Math.round((totalOps / 1000) * 100);

  let msg = `📊 REPORTE SEMANA ${semanaActual}\n\n`;
  msg += `Mensajes atendidos: ${totalMensajes}\n`;
  msg += `Ops consumidas: ${totalOps} / 1,000 (${pct}%)\n`;
  msg += `Ops restantes del mes: ${opsRestantes}\n\n`;
  msg += `INTENCIONES:\n`;
  for (const [intent, count] of Object.entries(intentCount)) {
    msg += `  ${intent}: ${count}\n`;
  }

  Logger.log(msg);
  SpreadsheetApp.getUi().alert(msg);
}


// ══════════════════════════════════════════
// FUNCIÓN: Buscar propiedad manualmente
// (Para testing sin Make.com)
// ══════════════════════════════════════════

function buscarPropiedadDemo(zona, precioMax, recamaras) {
  zona = zona || 'Lomas de Poleo';
  precioMax = precioMax || 2000000;
  recamaras = recamaras || 3;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Propiedades');
  const data = sheet.getDataRange().getValues();

  const resultados = [];
  for (let i = 1; i < data.length; i++) {
    const [id, tipo, zonaRow, precio, recsRow, banos, m2, status] = data[i];
    if (
      status === 'Disponible' &&
      precio <= precioMax &&
      recsRow >= recamaras &&
      zonaRow.toLowerCase().includes(zona.toLowerCase())
    ) {
      resultados.push({ id, tipo, zonaRow, precio, recsRow, banos, m2 });
    }
  }

  Logger.log(`Búsqueda: zona="${zona}", precio≤${precioMax}, rec≥${recamaras}`);
  Logger.log(`Resultados: ${resultados.length}`);
  resultados.forEach(r => Logger.log(JSON.stringify(r)));

  return resultados;
}
