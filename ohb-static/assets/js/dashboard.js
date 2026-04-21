/* ===================================
   OHB DASHBOARD - Admin Panel
   Auth, routing, CRUD operations
   =================================== */

let currentView = 'overview';
let authCheckInterval = null;

/**
 * Initialize dashboard
 */
function initDashboard() {
  // Check authentication
  if (!OHB_STORAGE.isAuthenticated()) {
    showLoginScreen();
    return;
  }
  
  // Setup dashboard
  setupDashboardLayout();
  renderView('overview');
  setupAuthCheck();
  setupEventListeners();
}

/**
 * Show login screen
 */
function showLoginScreen() {
  document.body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    ">
      <div style="background: var(--color-surface); padding: 2rem; border-radius: var(--radius-xl); max-width: 400px; width: 90%;">
        <h2 style="text-align: center; margin-bottom: 2rem;">Dashboard OHB</h2>
        
        <form id="dashboard-login">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Email</label>
            <input type="email" name="email" required placeholder="admin@ohb.com" style="width: 100%; padding: 0.75rem; background: var(--color-bg-dark); border: 1px solid var(--color-surface-light); border-radius: var(--radius-md); color: var(--color-text-primary);">
          </div>
          
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Contraseña</label>
            <input type="password" name="password" required placeholder="••••••" style="width: 100%; padding: 0.75rem; background: var(--color-bg-dark); border: 1px solid var(--color-surface-light); border-radius: var(--radius-md); color: var(--color-text-primary);">
          </div>
          
          <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 1rem;">
            Demo: email: jyeskas1111@gmail.com | password: admin123
          </p>
          
          <button type="submit" class="btn btn-primary" style="width: 100%;">Iniciar Sesión</button>
        </form>
      </div>
    </div>
  `;
  
  document.getElementById('dashboard-login').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    const auth = OHB_STORAGE.loginUser(email, password);
    if (auth) {
      location.reload();
    } else {
      alert('Email o contraseña incorrectos');
    }
  });
}

/**
 * Setup dashboard layout
 */
function setupDashboardLayout() {
  const user = OHB_STORAGE.getCurrentUser();
  
  document.body.innerHTML = `
    <div class="dashboard-container">
      <!-- Sidebar -->
      <aside class="dashboard-sidebar">
        <div class="sidebar-logo">
          <span>OHB</span>
        </div>
        
        <nav class="sidebar-menu">
          <li class="sidebar-item">
            <a href="#" onclick="renderView('overview')" class="sidebar-link active" data-view="overview">
              <span class="sidebar-icon">📊</span>
              <span>Overview</span>
            </a>
          </li>
          <li class="sidebar-item">
            <a href="#" onclick="renderView('leads')" class="sidebar-link" data-view="leads">
              <span class="sidebar-icon">👥</span>
              <span>Leads</span>
            </a>
          </li>
          <li class="sidebar-item">
            <a href="#" onclick="renderView('properties')" class="sidebar-link" data-view="properties">
              <span class="sidebar-icon">🏠</span>
              <span>Propiedades</span>
            </a>
          </li>
          <li class="sidebar-item">
            <a href="#" onclick="renderView('reports')" class="sidebar-link" data-view="reports">
              <span class="sidebar-icon">📈</span>
              <span>Reportes</span>
            </a>
          </li>
          <li class="sidebar-item">
            <a href="#" onclick="renderView('settings')" class="sidebar-link" data-view="settings">
              <span class="sidebar-icon">⚙️</span>
              <span>Configuración</span>
            </a>
          </li>
        </nav>
        
        <div class="sidebar-profile">
          <div class="profile-info">
            <div class="profile-avatar">${user.name.charAt(0)}</div>
            <div class="profile-details">
              <div class="profile-name">${user.name}</div>
              <div class="profile-role">${user.role}</div>
            </div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="logoutDashboard()" style="width: 100%;">Cerrar Sesión</button>
        </div>
      </aside>
      
      <!-- Main Content -->
      <main class="dashboard-main">
        <div class="dashboard-header">
          <div>
            <h1 class="dashboard-title">Dashboard</h1>
          </div>
        </div>
        
        <div id="dashboard-content"></div>
      </main>
    </div>
  `;
}

/**
 * Render specific view
 * @param {string} view - View name
 */
function renderView(view) {
  currentView = view;
  const content = document.getElementById('dashboard-content');
  
  // Update active link
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-view') === view) {
      link.classList.add('active');
    }
  });
  
  switch(view) {
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
}

/**
 * Render overview/dashboard view
 */
function renderOverviewView(container) {
  const leads = OHB_STORAGE.getLeads();
  const leadsByStatus = {
    nuevo: leads.filter(l => l.status === 'nuevo').length,
    contactado: leads.filter(l => l.status === 'contactado').length,
    convertido: leads.filter(l => l.status === 'convertido').length,
  };
  
  const html = `
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
        <div class="metric-label">Convertidos</div>
        <div class="metric-value">${leadsByStatus.convertido}</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon">🏠</div>
        <div class="metric-label">Propiedades</div>
        <div class="metric-value">${OHB_DATA.PROPERTIES.length}</div>
      </div>
    </div>
    
    <div class="table-container" style="margin-top: 2rem;">
      <div class="table-header">
        <div class="table-title">Últimos Leads</div>
      </div>
      
      <table>
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
          ${leads.slice(-5).reverse().map(lead => `
            <tr>
              <td>${lead.name || '-'}</td>
              <td>${lead.email || '-'}</td>
              <td>${lead.phone || '-'}</td>
              <td>${lead.source || '-'}</td>
              <td><span class="table-status status-${lead.status}">${lead.status}</span></td>
              <td>${OHB_UTILS.formatDate(lead.createdAt)}</td>
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
    <div class="table-container">
      <div class="table-header">
        <div class="table-title">Gestión de Leads (${leads.length})</div>
        <div class="table-controls">
          <button class="btn btn-secondary btn-sm" onclick="exportLeadsData()">📥 Exportar CSV</button>
        </div>
      </div>
      
      <table>
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
          ${leads.map(lead => `
            <tr>
              <td>${lead.name || '-'}</td>
              <td>${lead.email || '-'}</td>
              <td>${lead.phone || '-'}</td>
              <td>${lead.source || '-'}</td>
              <td>
                <select onchange="updateLeadStatus('${lead.id}', this.value)" style="background: var(--color-bg-dark); border: 1px solid var(--color-surface-light); border-radius: var(--radius-md); padding: 0.25rem; color: var(--color-text-primary);">
                  <option value="nuevo" ${lead.status === 'nuevo' ? 'selected' : ''}>Nuevo</option>
                  <option value="contactado" ${lead.status === 'contactado' ? 'selected' : ''}>Contactado</option>
                  <option value="convertido" ${lead.status === 'convertido' ? 'selected' : ''}>Convertido</option>
                </select>
              </td>
              <td>${OHB_UTILS.formatDate(lead.createdAt)}</td>
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
    <div class="table-container">
      <div class="table-header">
        <div class="table-title">Propiedades (${properties.length})</div>
      </div>
      
      <table>
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
              <td>${prop.name}</td>
              <td>${prop.type}</td>
              <td>${OHB_UTILS.formatPrice(prop.price)}</td>
              <td>${prop.location}</td>
              <td>${prop.bedrooms}</td>
              <td>${prop.area} m²</td>
              <td><span class="table-status status-${prop.status}">${prop.status}</span></td>
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
  
  const html = `
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
        <div class="metric-label">Promedio por Día</div>
        <div class="metric-value">${(leads.length / 7).toFixed(1)}</div>
      </div>
    </div>
    
    <div class="table-container" style="margin-top: 2rem;">
      <div class="table-header">
        <div class="table-title">Estadísticas por Fuente</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Fuente</th>
            <th>Total</th>
            <th>Convertidos</th>
            <th>Tasa %</th>
          </tr>
        </thead>
        <tbody>
          ${Array.from(new Set(leads.map(l => l.source))).map(source => {
            const sourceLeads = leads.filter(l => l.source === source);
            const converted = sourceLeads.filter(l => l.status === 'convertido').length;
            const rate = sourceLeads.length > 0 ? ((converted / sourceLeads.length) * 100).toFixed(1) : 0;
            return `
              <tr>
                <td>${source}</td>
                <td>${sourceLeads.length}</td>
                <td>${converted}</td>
                <td>${rate}%</td>
              </tr>
            `;
          }).join('')}
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
  const html = `
    <div style="max-width: 600px;">
      <h2 style="margin-bottom: 2rem;">Configuración</h2>
      
      <div style="background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 2rem;">
        <h3 style="margin-bottom: 1rem;">Administración de Datos</h3>
        
        <button class="btn btn-secondary" onclick="exportDashboardData()" style="display: block; width: 100%; margin-bottom: 1rem;">
          📥 Exportar Todos los Datos (JSON)
        </button>
        
        <button class="btn btn-ghost" onclick="clearDashboardData()" style="display: block; width: 100%; border-color: var(--color-error); color: var(--color-error);">
          ⚠️ Limpiar Todos los Datos
        </button>
      </div>
      
      <div style="background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-lg);">
        <h3 style="margin-bottom: 1rem;">Información de la Cuenta</h3>
        <p style="margin-bottom: 0.5rem;"><strong>Email:</strong> ${OHB_STORAGE.getCurrentUser().email}</p>
        <p style="margin-bottom: 0.5rem;"><strong>Rol:</strong> ${OHB_STORAGE.getCurrentUser().role}</p>
        <p><strong>Sesión activa desde:</strong> ${OHB_UTILS.formatDateTime(OHB_STORAGE.getAuth().loginAt)}</p>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

/**
 * Update lead status
 * @param {string} leadId - Lead ID
 * @param {string} status - New status
 */
function updateLeadStatus(leadId, status) {
  OHB_STORAGE.updateLeadStatus(leadId, status);
}

/**
 * Delete lead
 * @param {string} leadId - Lead ID
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
  downloadFile(csv, 'leads.csv', 'text/csv');
}

/**
 * Export all dashboard data
 */
function exportDashboardData() {
  const data = OHB_STORAGE.exportAllStorage();
  downloadFile(data, 'dashboard-export.json', 'application/json');
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
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} type - MIME type
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

/**
 * Setup authentication check
 */
function setupAuthCheck() {
  authCheckInterval = setInterval(() => {
    if (!OHB_STORAGE.isAuthenticated()) {
      alert('Tu sesión ha expirado');
      location.reload();
    }
  }, 60000); // Check every minute
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Add any additional event listeners here
}

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

// Initialize dashboard on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}

// Export functions
window.OHB_DASHBOARD = {
  initDashboard,
  renderView,
  updateLeadStatus,
  deleteLead,
  exportLeadsData,
  exportDashboardData,
  clearDashboardData,
  logoutDashboard,
};
