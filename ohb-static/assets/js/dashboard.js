/* ===================================
   OHB DASHBOARD - Admin Panel
   Auth, routing, CRUD operations
   =================================== */

// ===== STATE =====
let currentView = 'overview';
let authCheckInterval = null;
let sessionWarningShown = false;

// ===== INITIALIZATION =====

/**
 * Initialize dashboard
 */
function initDashboard() {
  // Check if user is authenticated
  if (!OHB_STORAGE.isAuthenticated()) {
    showLoginScreen();
    return;
  }

  // Setup dashboard layout
  setupDashboardLayout();

  // Render default view
  renderView('overview');

  // Setup auth validation
  setupAuthCheck();
  setupEventListeners();
}

// ===== AUTHENTICATION & LOGIN =====

/**
 * Show login screen
 */
function showLoginScreen() {
  const rememberedEmail = OHB_STORAGE.getRememberedEmail();

  document.body.innerHTML = `
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <div class="login-logo">OHB</div>
          <h1 class="login-title">Dashboard OHB</h1>
          <p class="login-subtitle">Asesorías y Consultorías</p>
        </div>

        <form id="dashboard-login" class="login-form">
          <div class="form-group">
            <label for="login-email" class="form-label">Email</label>
            <input
              type="email"
              id="login-email"
              name="email"
              required
              placeholder="correo@ohb.com"
              value="${rememberedEmail || ''}"
              class="form-input"
              autocomplete="email"
            >
            <span class="form-error" id="email-error"></span>
          </div>

          <div class="form-group">
            <label for="login-password" class="form-label">Contraseña</label>
            <input
              type="password"
              id="login-password"
              name="password"
              required
              placeholder="••••••••"
              class="form-input"
              autocomplete="current-password"
            >
            <span class="form-error" id="password-error"></span>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                name="remember-me"
                id="remember-me"
                class="checkbox-input"
                ${rememberedEmail ? 'checked' : ''}
              >
              <span class="checkbox-text">Recordarme en este dispositivo</span>
            </label>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
            Iniciar Sesión
          </button>
        </form>

        <div class="login-footer">
          <p class="login-hint">Demo: ${OHB_DATA.CONSTANTS.EMAIL} | Contraseña: admin123</p>
        </div>
      </div>
    </div>
  `;

  // Add inline styles for login
  const style = document.createElement('style');
  style.textContent = `
    body { margin: 0; padding: 0; background: var(--color-bg-dark); min-height: 100vh; }
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1rem;
    }
    .login-box {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: 2rem;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .login-header { text-align: center; margin-bottom: 2rem; }
    .login-logo {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--color-primary);
      margin-bottom: 0.5rem;
    }
    .login-title {
      margin: 0 0 0.5rem;
      color: var(--color-text-primary);
      font-size: 1.5rem;
    }
    .login-subtitle {
      margin: 0;
      color: var(--color-text-muted);
      font-size: 0.875rem;
    }
    .login-form { margin: 0; }
    .form-group { margin-bottom: 1.25rem; }
    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--color-text-primary);
      font-size: 0.875rem;
    }
    .form-input {
      width: 100%;
      padding: 0.75rem;
      background: var(--color-bg-dark);
      border: 1px solid var(--color-surface-light);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-size: 1rem;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }
    .form-input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(212, 168, 67, 0.1);
    }
    .form-input::placeholder { color: var(--color-text-muted); }
    .form-error {
      display: block;
      color: var(--color-error);
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }
    .checkbox-input {
      margin-right: 0.5rem;
      cursor: pointer;
    }
    .checkbox-text {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }
    .login-footer {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--color-surface-light);
    }
    .login-hint {
      margin: 0;
      font-size: 0.75rem;
      color: var(--color-text-muted);
      text-align: center;
      font-family: monospace;
    }
  `;
  document.head.appendChild(style);

  // Attach event listeners
  const form = document.getElementById('dashboard-login');
  form.addEventListener('submit', handleLoginSubmit);
}

/**
 * Handle login form submission
 */
function handleLoginSubmit(e) {
  e.preventDefault();

  const email = e.target.email.value.trim();
  const password = e.target.password.value;
  const rememberMe = e.target['remember-me'].checked;

  // Clear previous errors
  document.getElementById('email-error').textContent = '';
  document.getElementById('password-error').textContent = '';

  // Validate input
  if (!email) {
    document.getElementById('email-error').textContent = 'El email es requerido';
    return;
  }
  if (!password) {
    document.getElementById('password-error').textContent = 'La contraseña es requerida';
    return;
  }

  // Attempt login
  const auth = OHB_STORAGE.loginUser(email, password, rememberMe);

  if (auth) {
    // Success - reload to initialize dashboard
    location.reload();
  } else {
    // Error
    if (email !== OHB_DATA.CONSTANTS.EMAIL) {
      document.getElementById('email-error').textContent = 'Email no registrado';
    } else {
      document.getElementById('password-error').textContent = 'Contraseña incorrecta';
    }
  }
}

// ===== DASHBOARD LAYOUT =====

/**
 * Setup dashboard layout
 */
function setupDashboardLayout() {
  const user = OHB_STORAGE.getCurrentUser();
  const auth = OHB_STORAGE.getAuth();

  document.body.innerHTML = `
    <div class="dashboard-container">
      <!-- Sidebar -->
      <aside class="dashboard-sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">OHB</div>
          <div class="sidebar-brand">Dashboard</div>
        </div>

        <nav class="sidebar-menu">
          <a href="#" onclick="renderView('overview')" class="sidebar-link active" data-view="overview">
            <span class="sidebar-icon">📊</span>
            <span class="sidebar-text">Overview</span>
          </a>
          <a href="#" onclick="renderView('leads')" class="sidebar-link" data-view="leads">
            <span class="sidebar-icon">👥</span>
            <span class="sidebar-text">Leads</span>
          </a>
          <a href="#" onclick="renderView('properties')" class="sidebar-link" data-view="properties">
            <span class="sidebar-icon">🏠</span>
            <span class="sidebar-text">Propiedades</span>
          </a>
          <a href="#" onclick="renderView('reports')" class="sidebar-link" data-view="reports">
            <span class="sidebar-icon">📈</span>
            <span class="sidebar-text">Reportes</span>
          </a>
          <a href="#" onclick="renderView('settings')" class="sidebar-link" data-view="settings">
            <span class="sidebar-icon">⚙️</span>
            <span class="sidebar-text">Configuración</span>
          </a>
          <hr class="sidebar-divider">
          <a href="#" onclick="logoutDashboard()" class="sidebar-link">
            <span class="sidebar-icon">🚪</span>
            <span class="sidebar-text">Cerrar Sesión</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-profile">
            <div class="profile-avatar">${user.name.charAt(0).toUpperCase()}</div>
            <div class="profile-info">
              <div class="profile-name">${user.name}</div>
              <div class="profile-role">${user.role.toUpperCase()}</div>
            </div>
          </div>
          <div class="sidebar-version">v1.0</div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="dashboard-main">
        <!-- Header -->
        <div class="dashboard-header">
          <div class="header-left">
            <h1 class="dashboard-title">Dashboard</h1>
          </div>
          <div class="header-right">
            <div class="header-info">
              <span class="header-time" id="current-time"></span>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="dashboard-content" id="dashboard-content"></div>

        <!-- Footer -->
        <div class="dashboard-footer">
          <div class="footer-left">
            <span class="footer-version">OHB Dashboard v1.0</span>
          </div>
          <div class="footer-right">
            <span class="footer-updated" id="last-update">Última actualización: ahora</span>
          </div>
        </div>
      </main>

      <!-- Session Warning Modal -->
      <div id="session-warning" class="modal" style="display: none;">
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h2>Advertencia: Sesión por Expirar</h2>
          </div>
          <div class="modal-body">
            <p>Tu sesión expirará en <strong><span id="warning-time">5</span> minutos</strong>.</p>
            <p>¿Deseas continuar con la sesión?</p>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" onclick="closeSessionWarning()">Más tarde</button>
            <button class="btn btn-primary" onclick="renewSession()">Continuar sesión</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Update current time
  updateCurrentTime();
  setInterval(updateCurrentTime, 30000); // Update every 30s
}

/**
 * Update current time in header
 */
function updateCurrentTime() {
  const timeEl = document.getElementById('current-time');
  if (timeEl) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeEl.textContent = `${hours}:${minutes}`;
  }
}

/**
 * Renew session (restart 8h timer)
 */
function renewSession() {
  const user = OHB_STORAGE.getCurrentUser();
  if (user) {
    const auth = {
      token: OHB_STORAGE.generateId('token'),
      user,
      loginAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    };
    sessionStorage.setItem(OHB_STORAGE.STORAGE_KEYS.SESSION, JSON.stringify(auth));
    localStorage.setItem(OHB_STORAGE.STORAGE_KEYS.AUTH, JSON.stringify(auth));
    closeSessionWarning();
  }
}

/**
 * Close session warning modal
 */
function closeSessionWarning() {
  const modal = document.getElementById('session-warning');
  if (modal) {
    modal.style.display = 'none';
  }
  sessionWarningShown = false;
}

// ===== VIEW RENDERING =====

/**
 * Render specific view
 * @param {string} view - View name
 */
function renderView(view) {
  currentView = view;
  const content = document.getElementById('dashboard-content');

  if (!content) return; // Dashboard not loaded

  // Update active sidebar link
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-view') === view) {
      link.classList.add('active');
    }
  });

  // Render appropriate view
  switch (view) {
    case 'overview':
      renderOverviewView(content);
      break;
    case 'leads':
      renderLeadsView(content);
      break;
    case 'properties':
      renderPropertiesView(content);
      break;
    case 'reports':
      renderReportsView(content);
      break;
    case 'settings':
      renderSettingsView(content);
      break;
    default:
      content.innerHTML = '<p>Vista no encontrada</p>';
  }

  // Update last update time
  const updateEl = document.getElementById('last-update');
  if (updateEl) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    updateEl.textContent = `Última actualización: ${hours}:${minutes}`;
  }
}

/**
 * Render overview/dashboard view
 */
function renderOverviewView(container) {
  const leads = OHB_STORAGE.getLeads();
  const properties = OHB_DATA.PROPERTIES;

  const leadsByStatus = {
    nuevo: leads.filter(l => l.status === 'nuevo').length,
    contactado: leads.filter(l => l.status === 'contactado').length,
    convertido: leads.filter(l => l.status === 'convertido').length,
  };

  const conversionRate = leads.length > 0
    ? ((leadsByStatus.convertido / leads.length) * 100).toFixed(1)
    : 0;

  const html = `
    <div class="section-title">KPIs Principales</div>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon">👥</div>
        <div class="metric-label">Leads Totales</div>
        <div class="metric-value">${leads.length}</div>
        <div class="metric-change">+${leadsByStatus.nuevo} nuevos</div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">🎯</div>
        <div class="metric-label">Contactados</div>
        <div class="metric-value">${leadsByStatus.contactado}</div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">✅</div>
        <div class="metric-label">Tasa de Conversión</div>
        <div class="metric-value">${conversionRate}%</div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">🏠</div>
        <div class="metric-label">Propiedades</div>
        <div class="metric-value">${properties.length}</div>
      </div>
    </div>

    <div class="section-title" style="margin-top: 2rem;">Últimos Leads</div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Fuente</th>
            <th>Estado</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          ${leads.length === 0 ? '<tr><td colspan="6" class="empty-row">No hay leads aún</td></tr>'
            : leads.slice(-5).reverse().map(lead => `
            <tr>
              <td>${lead.name || '-'}</td>
              <td>${lead.email || '-'}</td>
              <td>${lead.phone || '-'}</td>
              <td>${lead.source || '-'}</td>
              <td><span class="status-badge status-${lead.status}">${lead.status}</span></td>
              <td>${formatDateShort(lead.createdAt)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Render leads view
 */
function renderLeadsView(container) {
  const leads = OHB_STORAGE.getLeads();

  const html = `
    <div class="section-header">
      <div>
        <h2 class="section-title">Gestión de Leads (${leads.length})</h2>
      </div>
      <div class="section-actions">
        <button class="btn btn-secondary btn-sm" onclick="exportLeadsData()">📥 Exportar CSV</button>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Fuente</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${leads.length === 0 ? '<tr><td colspan="7" class="empty-row">No hay leads registrados</td></tr>'
            : leads.map(lead => `
            <tr>
              <td>${lead.name || '-'}</td>
              <td>${lead.email || '-'}</td>
              <td>${lead.phone || '-'}</td>
              <td>${lead.source || '-'}</td>
              <td>
                <select class="status-select" onchange="updateLeadStatus('${lead.id}', this.value)">
                  <option value="nuevo" ${lead.status === 'nuevo' ? 'selected' : ''}>Nuevo</option>
                  <option value="contactado" ${lead.status === 'contactado' ? 'selected' : ''}>Contactado</option>
                  <option value="convertido" ${lead.status === 'convertido' ? 'selected' : ''}>Convertido</option>
                </select>
              </td>
              <td>${formatDateShort(lead.createdAt)}</td>
              <td>
                <button class="action-btn" onclick="deleteLead('${lead.id}')" title="Eliminar">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Render properties view
 */
function renderPropertiesView(container) {
  const properties = OHB_DATA.PROPERTIES;

  const html = `
    <div class="section-header">
      <h2 class="section-title">Propiedades (${properties.length})</h2>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Precio</th>
            <th>Ubicación</th>
            <th>Recámaras</th>
            <th>Área</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${properties.map(prop => `
            <tr>
              <td><strong>${prop.name}</strong></td>
              <td>${prop.type}</td>
              <td>${formatPrice(prop.price)} ${prop.currency}</td>
              <td>${prop.location}</td>
              <td>${prop.bedrooms}</td>
              <td>${prop.area} ${prop.areaUnit}</td>
              <td><span class="status-badge status-${prop.status}">${prop.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Render reports view
 */
function renderReportsView(container) {
  const leads = OHB_STORAGE.getLeads();
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const leadsThisWeek = leads.filter(l => new Date(l.createdAt) > weekAgo).length;
  const conversionRate = leads.length > 0
    ? ((leads.filter(l => l.status === 'convertido').length / leads.length) * 100).toFixed(1)
    : 0;

  // Group leads by source
  const sourceStats = Array.from(new Set(leads.map(l => l.source))).map(source => {
    const sourceLeads = leads.filter(l => l.source === source);
    const converted = sourceLeads.filter(l => l.status === 'convertido').length;
    const rate = sourceLeads.length > 0 ? ((converted / sourceLeads.length) * 100).toFixed(1) : 0;
    return { source, total: sourceLeads.length, converted, rate };
  });

  const html = `
    <div class="section-title">Reportes Semanales</div>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon">📅</div>
        <div class="metric-label">Esta Semana</div>
        <div class="metric-value">${leadsThisWeek}</div>
        <div class="metric-change">nuevos leads</div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">🎯</div>
        <div class="metric-label">Tasa de Conversión</div>
        <div class="metric-value">${conversionRate}%</div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">📊</div>
        <div class="metric-label">Promedio Diario</div>
        <div class="metric-value">${(leads.length / 7).toFixed(1)}</div>
      </div>
    </div>

    <div class="section-title" style="margin-top: 2rem;">Estadísticas por Fuente</div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Fuente</th>
            <th>Total</th>
            <th>Convertidos</th>
            <th>Tasa %</th>
          </tr>
        </thead>
        <tbody>
          ${sourceStats.length === 0 ? '<tr><td colspan="4" class="empty-row">Sin datos</td></tr>'
            : sourceStats.map(s => `
            <tr>
              <td>${s.source || '-'}</td>
              <td>${s.total}</td>
              <td>${s.converted}</td>
              <td>${s.rate}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Render settings view
 */
function renderSettingsView(container) {
  const auth = OHB_STORAGE.getAuth();
  const user = OHB_STORAGE.getCurrentUser();

  const html = `
    <h2 class="section-title">Configuración</h2>

    <div class="settings-section">
      <h3>Cuenta</h3>
      <div class="settings-group">
        <div class="setting-row">
          <label>Email</label>
          <span>${user.email}</span>
        </div>
        <div class="setting-row">
          <label>Rol</label>
          <span>${user.role.toUpperCase()}</span>
        </div>
        <div class="setting-row">
          <label>Sesión iniciada</label>
          <span>${formatDateTime(auth.loginAt)}</span>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h3>Administración de Datos</h3>
      <button class="btn btn-secondary btn-block" onclick="exportDashboardData()">
        📥 Exportar Todos los Datos (JSON)
      </button>
      <button class="btn btn-danger btn-block" style="margin-top: 0.5rem;" onclick="clearDashboardData()">
        ⚠️ Limpiar Todos los Datos
      </button>
    </div>
  `;

  container.innerHTML = html;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Format price
 */
function formatPrice(price) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Format date short (MM/DD HH:MM)
 */
function formatDateShort(date) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}

/**
 * Format date time
 */
function formatDateTime(date) {
  const d = new Date(date);
  return d.toLocaleDateString('es-MX') + ' ' + d.toLocaleTimeString('es-MX');
}

// ===== LEAD OPERATIONS =====

/**
 * Update lead status
 */
function updateLeadStatus(leadId, status) {
  OHB_STORAGE.updateLeadStatus(leadId, status);
  renderView('leads');
}

/**
 * Delete lead
 */
function deleteLead(leadId) {
  if (confirm('¿Estás seguro de que quieres eliminar este lead?')) {
    OHB_STORAGE.deleteLead(leadId);
    renderView('leads');
  }
}

/**
 * Export leads to CSV
 */
function exportLeadsData() {
  const csv = OHB_STORAGE.exportLeadsCSV();
  downloadFile(csv, 'ohb-leads-' + new Date().toISOString().slice(0, 10) + '.csv', 'text/csv');
}

/**
 * Export all dashboard data
 */
function exportDashboardData() {
  const data = OHB_STORAGE.exportAllStorage();
  downloadFile(data, 'ohb-dashboard-' + new Date().toISOString().slice(0, 10) + '.json', 'application/json');
}

/**
 * Clear all dashboard data
 */
function clearDashboardData() {
  if (confirm('¿Estás completamente seguro? Esta acción no puede deshacerse.')) {
    if (confirm('¡ADVERTENCIA! Se eliminarán TODOS los datos. ¿Deseas continuar?')) {
      OHB_STORAGE.clearAllStorage(false);
      alert('Datos eliminados');
      location.reload();
    }
  }
}

/**
 * Download file
 */
function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ===== SESSION & AUTH CHECK =====

/**
 * Setup authentication check every minute
 */
function setupAuthCheck() {
  authCheckInterval = setInterval(() => {
    // Check if still authenticated
    if (!OHB_STORAGE.isAuthenticated()) {
      alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      OHB_STORAGE.logoutUser();
      location.reload();
      return;
    }

    // Check if time remaining is 5 minutes or less
    const timeRemaining = OHB_STORAGE.getSessionTimeRemaining();
    if (timeRemaining !== null && timeRemaining <= 5 && !sessionWarningShown) {
      showSessionWarning(timeRemaining);
      sessionWarningShown = true;
    }
  }, 60000); // Check every minute
}

/**
 * Show session warning modal
 */
function showSessionWarning(minutes) {
  const modal = document.getElementById('session-warning');
  if (modal) {
    document.getElementById('warning-time').textContent = minutes;
    modal.style.display = 'flex';
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Add any additional event listeners here
}

// ===== LOGOUT =====

/**
 * Logout from dashboard
 */
function logoutDashboard() {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    OHB_STORAGE.logoutUser();
    if (authCheckInterval) {
      clearInterval(authCheckInterval);
    }
    location.href = '/';
  }
}

// ===== RENDERS LEADS VIEW =====

function renderLeadsView(content) {
  const mainContent = content || document.getElementById('dashboard-content');
  const leads = OHB_STORAGE.getLeads();

  let html = `
    <div class="view-header">
      <div>
        <h1>CRM de Leads</h1>
        <p>Gestiona y da seguimiento a todos los prospectos</p>
      </div>
      <div class="header-actions">
        <input type="text" id="lead-search" placeholder="Buscar por nombre, email, teléfono..." class="search-input">
        <select id="lead-status-filter" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="Nuevo">Nuevo</option>
          <option value="Contactado">Contactado</option>
          <option value="Interesado">Interesado</option>
          <option value="No interesado">No interesado</option>
          <option value="Convertido">Convertido</option>
        </select>
        <button onclick="window.OHB_DASHBOARD.exportLeadsCSV()" class="btn btn-primary">📥 Exportar CSV</button>
      </div>
    </div>

    <div class="leads-stats">
      <div class="stat-card">
        <div class="stat-number">${leads.length}</div>
        <div class="stat-label">Total de Leads</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${leads.filter(l => l.status === 'Nuevo').length}</div>
        <div class="stat-label">Nuevos</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${leads.filter(l => l.status === 'Convertido').length}</div>
        <div class="stat-label">Convertidos</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${((leads.filter(l => l.status === 'Convertido').length / leads.length * 100) || 0).toFixed(1)}%</div>
        <div class="stat-label">Tasa Conversión</div>
      </div>
    </div>

    <div class="table-container">
      <table class="dashboard-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Propiedad</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="leads-tbody">
  `;

  leads.forEach(lead => {
    const date = new Date(lead.date).toLocaleDateString('es-MX');
    const statusColor = {
      'Nuevo': '#FFB800',
      'Contactado': '#1B3A6B',
      'Interesado': '#25D366',
      'No interesado': '#FF6B6B',
      'Convertido': '#00D084'
    }[lead.status] || '#666';

    html += `
      <tr class="lead-row" data-lead-id="${lead.id}">
        <td>#${lead.id.slice(-4)}</td>
        <td contenteditable="true" class="editable-cell" data-field="name">${lead.name}</td>
        <td contenteditable="true" class="editable-cell" data-field="email">${lead.email}</td>
        <td contenteditable="true" class="editable-cell" data-field="phone">${lead.phone}</td>
        <td>${lead.property || '—'}</td>
        <td>
          <select class="status-select" data-lead-id="${lead.id}" style="border-color: ${statusColor}">
            <option value="Nuevo" ${lead.status === 'Nuevo' ? 'selected' : ''}>Nuevo</option>
            <option value="Contactado" ${lead.status === 'Contactado' ? 'selected' : ''}>Contactado</option>
            <option value="Interesado" ${lead.status === 'Interesado' ? 'selected' : ''}>Interesado</option>
            <option value="No interesado" ${lead.status === 'No interesado' ? 'selected' : ''}>No interesado</option>
            <option value="Convertido" ${lead.status === 'Convertido' ? 'selected' : ''}>Convertido</option>
          </select>
        </td>
        <td>${date}</td>
        <td class="actions-cell">
          <button onclick="window.OHB_DASHBOARD.contactLeadWA('${lead.id}')" title="WhatsApp" class="btn-icon">💬</button>
          <button onclick="window.OHB_DASHBOARD.showLeadNotes('${lead.id}')" title="Notas" class="btn-icon">📝</button>
          <button onclick="window.OHB_DASHBOARD.deleteLead('${lead.id}')" title="Eliminar" class="btn-icon btn-danger">🗑️</button>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  mainContent.innerHTML = html;

  // Event listeners for filtering
  document.getElementById('lead-search').addEventListener('input', filterLeads);
  document.getElementById('lead-status-filter').addEventListener('change', filterLeads);

  // Event listeners for status changes
  document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', function(e) {
      const leadId = this.dataset.leadId;
      const newStatus = this.value;
      window.OHB_DASHBOARD.updateLeadStatus(leadId, newStatus);
    });
  });

  // Event listeners for inline editing
  document.querySelectorAll('.editable-cell').forEach(cell => {
    cell.addEventListener('blur', function() {
      const leadId = this.closest('tr').dataset.leadId;
      const field = this.dataset.field;
      const value = this.textContent;
      window.OHB_DASHBOARD.updateLeadField(leadId, field, value);
    });
  });
}

function filterLeads() {
  const searchTerm = document.getElementById('lead-search').value.toLowerCase();
  const statusFilter = document.getElementById('lead-status-filter').value;

  document.querySelectorAll('.lead-row').forEach(row => {
    const text = row.textContent.toLowerCase();
    const status = row.querySelector('.status-select').value;
    const matchesSearch = text.includes(searchTerm);
    const matchesStatus = !statusFilter || status === statusFilter;
    row.style.display = (matchesSearch && matchesStatus) ? '' : 'none';
  });
}

// ===== RENDERS REPORTS VIEW =====

function renderReportsView(content) {
  const mainContent = content || document.getElementById('dashboard-content');
  const leads = OHB_STORAGE.getLeads();
  const props = OHB_STORAGE.getStoredProperties();

  const converted = leads.filter(l => l.status === 'Convertido').length;
  const conversionRate = ((converted / leads.length * 100) || 0).toFixed(1);
  const estimatedRevenue = (converted * 150000).toLocaleString('es-MX');

  let html = `
    <div class="view-header">
      <h1>Reportes y Análisis</h1>
      <p>Métricas de desempeño y tendencias</p>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-number">${leads.length}</div>
        <div class="kpi-label">Total Leads</div>
        <div class="kpi-trend">↑ Últimos 30 días</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-number">${conversionRate}%</div>
        <div class="kpi-label">Tasa Conversión</div>
        <div class="kpi-trend">Meta: 15%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-number">$${estimatedRevenue}</div>
        <div class="kpi-label">Ingreso Est.</div>
        <div class="kpi-trend">MXN</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-number">${props.filter(p => p.status === 'Disponible').length}/${props.length}</div>
        <div class="kpi-label">Props. Disponibles</div>
        <div class="kpi-trend">Activas</div>
      </div>
    </div>

    <div class="reports-section">
      <div class="report-box">
        <h3>Lead por Estado</h3>
        <div class="chart-bars">
          ${['Nuevo', 'Contactado', 'Interesado', 'No interesado', 'Convertido'].map(status => {
            const count = leads.filter(l => l.status === status).length;
            const percent = ((count / leads.length * 100) || 0).toFixed(0);
            return `
              <div class="bar-item">
                <div class="bar-label">${status}</div>
                <div class="bar-container">
                  <div class="bar-fill" style="width: ${percent}%"></div>
                </div>
                <div class="bar-value">${count} (${percent}%)</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="report-box">
        <h3>Top 5 Propiedades (Interés)</h3>
        <table class="mini-table">
          <tr>
            <th>Propiedad</th>
            <th>Leads</th>
            <th>Tasa Conv.</th>
          </tr>
          ${props.slice(0, 5).map(prop => {
            const propLeads = leads.filter(l => l.property === prop.name).length;
            const propConverted = leads.filter(l => l.property === prop.name && l.status === 'Convertido').length;
            const rate = ((propConverted / (propLeads || 1) * 100) || 0).toFixed(0);
            return `
              <tr>
                <td>${prop.name}</td>
                <td>${propLeads}</td>
                <td>${rate}%</td>
              </tr>
            `;
          }).join('')}
        </table>
      </div>
    </div>
  `;

  mainContent.innerHTML = html;
}

// ===== RENDERS SETTINGS VIEW =====

function renderSettingsView(content) {
  const mainContent = content || document.getElementById('dashboard-content');

  const settings = JSON.parse(sessionStorage.getItem('ohb_settings') || '{}');
  const defaultSettings = {
    companyName: 'OHB Asesorías y Consultorías',
    whatsapp: '526561327685',
    email: 'jyeskas1111@gmail.com',
    commission1: 5,
    commission2: 6,
    commission3: 7,
    theme: 'dark'
  };

  const current = { ...defaultSettings, ...settings };

  let html = `
    <div class="view-header">
      <h1>Configuración</h1>
      <p>Administra los ajustes de la plataforma</p>
    </div>

    <div class="settings-container">
      <div class="settings-group">
        <h3>📊 Información de la Empresa</h3>
        <div class="form-group">
          <label>Nombre de la Empresa</label>
          <input type="text" id="setting-company" value="${current.companyName}" class="setting-input">
        </div>
        <div class="form-group">
          <label>WhatsApp (solo números)</label>
          <input type="text" id="setting-whatsapp" value="${current.whatsapp}" class="setting-input">
        </div>
        <div class="form-group">
          <label>Email de Contacto</label>
          <input type="email" id="setting-email" value="${current.email}" class="setting-input">
        </div>
      </div>

      <div class="settings-group">
        <h3>💰 Comisiones</h3>
        <div class="commission-grid">
          <div class="form-group">
            <label>Comisión 1 (%)</label>
            <input type="number" id="setting-comm1" value="${current.commission1}" min="0" max="15" class="setting-input">
          </div>
          <div class="form-group">
            <label>Comisión 2 (%)</label>
            <input type="number" id="setting-comm2" value="${current.commission2}" min="0" max="15" class="setting-input">
          </div>
          <div class="form-group">
            <label>Comisión 3 (%)</label>
            <input type="number" id="setting-comm3" value="${current.commission3}" min="0" max="15" class="setting-input">
          </div>
        </div>
      </div>

      <div class="settings-group">
        <h3>🎨 Apariencia</h3>
        <div class="form-group">
          <label>Tema</label>
          <select id="setting-theme" class="setting-input">
            <option value="dark" ${current.theme === 'dark' ? 'selected' : ''}>Oscuro (por defecto)</option>
            <option value="light" ${current.theme === 'light' ? 'selected' : ''}>Claro</option>
          </select>
        </div>
      </div>

      <div class="settings-group">
        <h3>⚙️ Datos y Seguridad</h3>
        <div class="settings-actions">
          <button onclick="window.OHB_DASHBOARD.exportAllData()" class="btn btn-primary">📥 Exportar Todos los Datos</button>
          <button onclick="window.OHB_DASHBOARD.clearAllData()" class="btn btn-danger">🗑️ Limpiar Base de Datos</button>
        </div>
      </div>

      <div class="settings-actions">
        <button onclick="window.OHB_DASHBOARD.saveSettings()" class="btn btn-success">✅ Guardar Cambios</button>
      </div>
    </div>
  `;

  mainContent.innerHTML = html;
}

// ===== NEW HELPER FUNCTIONS =====

function contactLeadWA(leadId) {
  const leads = OHB_STORAGE.getLeads();
  const lead = leads.find(l => l.id === leadId);
  if (lead && lead.phone) {
    const waLink = `https://wa.me/526561327685?text=Hola ${lead.name}, te contactamos sobre tu solicitud en OHB`;
    window.open(waLink, '_blank');
  }
}

function showLeadNotes(leadId) {
  const leads = OHB_STORAGE.getLeads();
  const lead = leads.find(l => l.id === leadId);
  const notes = lead?.notes || '';

  const newNotes = prompt('Notas del cliente:', notes);
  if (newNotes !== null) {
    lead.notes = newNotes;
    OHB_STORAGE.saveLead(lead);
    renderLeadsView();
  }
}

function updateLeadField(leadId, field, value) {
  const leads = OHB_STORAGE.getLeads();
  const lead = leads.find(l => l.id === leadId);
  if (lead) {
    lead[field] = value;
    OHB_STORAGE.saveLead(lead);
  }
}

function exportLeadsCSV() {
  const leads = OHB_STORAGE.getLeads();
  let csv = 'ID,Nombre,Email,Teléfono,Propiedad,Estado,Fecha\n';
  leads.forEach(lead => {
    csv += `"${lead.id}","${lead.name}","${lead.email}","${lead.phone}","${lead.property || ''}","${lead.status}","${lead.date}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

function saveSettings() {
  const settings = {
    companyName: document.getElementById('setting-company').value,
    whatsapp: document.getElementById('setting-whatsapp').value,
    email: document.getElementById('setting-email').value,
    commission1: parseInt(document.getElementById('setting-comm1').value),
    commission2: parseInt(document.getElementById('setting-comm2').value),
    commission3: parseInt(document.getElementById('setting-comm3').value),
    theme: document.getElementById('setting-theme').value
  };

  sessionStorage.setItem('ohb_settings', JSON.stringify(settings));
  alert('✅ Configuración guardada correctamente');
}

function exportAllData() {
  const data = {
    leads: OHB_STORAGE.getLeads(),
    properties: OHB_STORAGE.getStoredProperties(),
    settings: JSON.parse(sessionStorage.getItem('ohb_settings') || '{}')
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `ohb_backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
}

function clearAllData() {
  if (confirm('⚠️ ¿Estás seguro? Esta acción no se puede deshacer.')) {
    localStorage.removeItem('ohb_leads');
    localStorage.removeItem('ohb_properties');
    sessionStorage.removeItem('ohb_settings');
    alert('✅ Base de datos limpiada');
    renderSettingsView();
  }
}

// ===== INITIALIZATION =====

// Initialize dashboard when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}

// Export functions globally
window.OHB_DASHBOARD = {
  initDashboard,
  renderView,
  updateLeadStatus,
  deleteLead,
  contactLeadWA,
  showLeadNotes,
  updateLeadField,
  exportLeadsCSV,
  saveSettings,
  exportAllData,
  clearAllData,
  logoutDashboard,
  renewSession,
  closeSessionWarning,
  showSessionWarning,
  filterLeads,
};
