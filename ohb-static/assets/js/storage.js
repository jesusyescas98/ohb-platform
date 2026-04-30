/* ===================================
   OHB STORAGE - localStorage Management
   Leads, Properties, Auth, Settings
   =================================== */

const STORAGE_KEYS = {
  LEADS: 'ohb_leads',
  PROPERTIES: 'ohb_properties',
  COOKIE_CONSENT: 'ohb_cookie_consent',
  AUTH: 'ohb_auth',
  USER: 'ohb_user',
  DASHBOARD_STATE: 'ohb_dashboard_state',
  SESSION: 'ohb_session',
  REMEMBER_ME: 'ohb_remember_me',
};

// ===== LEADS =====

/**
 * Save lead to localStorage
 * @param {object} lead - Lead data {name, email, phone, message, source, ...}
 * @returns {object} Saved lead with id and timestamp
 */
function saveLead(lead) {
  const leads = getLeads();
  const newLead = {
    id: generateId('lead'),
    ...lead,
    createdAt: new Date().toISOString(),
    status: 'nuevo',
  };
  leads.push(newLead);
  localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  return newLead;
}

/**
 * Get all leads from localStorage
 * @returns {array} Array of leads
 */
function getLeads() {
  const stored = localStorage.getItem(STORAGE_KEYS.LEADS);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get lead by ID
 * @param {string} id - Lead ID
 * @returns {object|null} Lead object or null
 */
function getLeadById(id) {
  const leads = getLeads();
  return leads.find(lead => lead.id === id) || null;
}

/**
 * Update lead status
 * @param {string} id - Lead ID
 * @param {string} status - New status (nuevo, contactado, convertido, perdido)
 * @returns {boolean} Success
 */
function updateLeadStatus(id, status) {
  const leads = getLeads();
  const lead = leads.find(l => l.id === id);
  if (lead) {
    lead.status = status;
    lead.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    return true;
  }
  return false;
}

/**
 * Update lead with additional data
 * @param {string} id - Lead ID
 * @param {object} updates - Updates to apply
 * @returns {boolean} Success
 */
function updateLead(id, updates) {
  const leads = getLeads();
  const lead = leads.find(l => l.id === id);
  if (lead) {
    Object.assign(lead, updates);
    lead.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    return true;
  }
  return false;
}

/**
 * Delete lead
 * @param {string} id - Lead ID
 * @returns {boolean} Success
 */
function deleteLead(id) {
  const leads = getLeads();
  const filtered = leads.filter(l => l.id !== id);
  if (filtered.length < leads.length) {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(filtered));
    return true;
  }
  return false;
}

/**
 * Get leads by status
 * @param {string} status - Status filter
 * @returns {array} Filtered leads
 */
function getLeadsByStatus(status) {
  return getLeads().filter(lead => lead.status === status);
}

/**
 * Search leads
 * @param {string} query - Search query (searches name, email, phone)
 * @returns {array} Matching leads
 */
function searchLeads(query) {
  const lowerQuery = query.toLowerCase();
  return getLeads().filter(lead =>
    lead.name?.toLowerCase().includes(lowerQuery) ||
    lead.email?.toLowerCase().includes(lowerQuery) ||
    lead.phone?.includes(query)
  );
}

/**
 * Export leads to CSV
 * @returns {string} CSV content
 */
function exportLeadsCSV() {
  const leads = getLeads();
  if (leads.length === 0) return '';
  
  const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Fuente', 'Estado', 'Fecha Creación', 'Mensaje'];
  const rows = leads.map(lead => [
    lead.id,
    lead.name || '',
    lead.email || '',
    lead.phone || '',
    lead.source || '',
    lead.status || '',
    lead.createdAt || '',
    lead.message || '',
  ]);
  
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  
  return csv;
}

// ===== PROPERTIES (for user uploads) =====

/**
 * Get stored user properties
 * @returns {array} User properties
 */
function getStoredProperties() {
  const stored = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save user property
 * @param {object} property - Property data
 * @returns {object} Saved property
 */
function saveProperty(property) {
  const properties = getStoredProperties();
  const newProperty = {
    id: generateId('prop'),
    ...property,
    createdAt: new Date().toISOString(),
  };
  properties.push(newProperty);
  localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
  return newProperty;
}

/**
 * Update user property
 * @param {string} id - Property ID
 * @param {object} updates - Updates
 * @returns {boolean} Success
 */
function updateProperty(id, updates) {
  const properties = getStoredProperties();
  const property = properties.find(p => p.id === id);
  if (property) {
    Object.assign(property, updates);
    property.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
    return true;
  }
  return false;
}

/**
 * Delete property
 * @param {string} id - Property ID
 * @returns {boolean} Success
 */
function deleteProperty(id) {
  const properties = getStoredProperties();
  const filtered = properties.filter(p => p.id !== id);
  if (filtered.length < properties.length) {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(filtered));
    return true;
  }
  return false;
}

// ===== AUTHENTICATION =====

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} rememberMe - Save credentials for next login
 * @returns {object|null} Auth token and user data, or null if failed
 */
function loginUser(email, password, rememberMe = false) {
  // Simple demo authentication - in production use proper backend auth
  if (email === OHB_DATA.CONSTANTS.EMAIL && password === 'admin123') {
    const auth = {
      token: generateId('token'),
      user: {
        email,
        name: 'Juan Yeskas',
        role: 'admin',
      },
      loginAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
    };

    // Save to sessionStorage (expires on browser close)
    sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(auth));

    // Save to localStorage as well for convenience
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(auth));

    // Save remember me preference
    if (rememberMe) {
      const remember = {
        email,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, JSON.stringify(remember));
    }

    return auth;
  }
  return null;
}

/**
 * Logout user
 */
function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.AUTH);
  sessionStorage.removeItem(STORAGE_KEYS.SESSION);
}

/**
 * Get current auth state (checks sessionStorage first, then localStorage)
 * @returns {object|null} Auth object or null
 */
function getAuth() {
  // Check sessionStorage first
  let stored = sessionStorage.getItem(STORAGE_KEYS.SESSION);
  if (!stored) {
    stored = localStorage.getItem(STORAGE_KEYS.AUTH);
  }
  if (!stored) return null;

  const auth = JSON.parse(stored);
  const now = new Date();
  const expiry = new Date(auth.expiresAt);

  if (now > expiry) {
    logoutUser();
    return null;
  }

  return auth;
}

/**
 * Get remembered email for login form
 * @returns {string|null} Remembered email or null
 */
function getRememberedEmail() {
  const stored = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
  if (!stored) return null;

  const remember = JSON.parse(stored);
  return remember.email || null;
}

/**
 * Clear remembered email
 */
function clearRememberedEmail() {
  localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
}

/**
 * Get time until session expires (in minutes)
 * @returns {number|null} Minutes until expiry or null if no session
 */
function getSessionTimeRemaining() {
  const auth = getAuth();
  if (!auth) return null;

  const now = new Date();
  const expiry = new Date(auth.expiresAt);
  const diff = expiry.getTime() - now.getTime();

  return Math.floor(diff / 60000); // Convert to minutes
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
function isAuthenticated() {
  return getAuth() !== null;
}

/**
 * Get current user
 * @returns {object|null} User object or null
 */
function getCurrentUser() {
  const auth = getAuth();
  return auth ? auth.user : null;
}

// ===== COOKIE CONSENT =====

/**
 * Set cookie consent
 * @param {boolean} accepted - Consent accepted
 */
function setCookieConsent(accepted) {
  const consent = {
    accepted,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT, JSON.stringify(consent));
}

/**
 * Get cookie consent
 * @returns {object|null} Consent object or null
 */
function getCookieConsent() {
  const stored = localStorage.getItem(STORAGE_KEYS.COOKIE_CONSENT);
  return stored ? JSON.parse(stored) : null;
}

/**
 * Has user accepted cookies
 * @returns {boolean} True if accepted
 */
function hasCookieConsent() {
  const consent = getCookieConsent();
  return consent ? consent.accepted : false;
}

// ===== DASHBOARD STATE =====

/**
 * Save dashboard view state
 * @param {object} state - State object
 */
function saveDashboardState(state) {
  const current = getDashboardState();
  const merged = { ...current, ...state, timestamp: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEYS.DASHBOARD_STATE, JSON.stringify(merged));
}

/**
 * Get dashboard view state
 * @returns {object} State object
 */
function getDashboardState() {
  const stored = localStorage.getItem(STORAGE_KEYS.DASHBOARD_STATE);
  return stored ? JSON.parse(stored) : {};
}

// ===== UTILITIES =====

/**
 * Generate unique ID
 * @param {string} prefix - ID prefix (optional)
 * @returns {string} Unique ID
 */
function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clear all storage (careful!)
 * @param {boolean} confirm - Require confirmation
 * @returns {boolean} Success
 */
function clearAllStorage(confirm = true) {
  if (confirm && !window.confirm('¿Estás seguro? Esta acción no puede deshacerse.')) {
    return false;
  }
  
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  
  return true;
}

/**
 * Export all storage to JSON file
 * @returns {string} JSON data
 */
function exportAllStorage() {
  const data = {
    leads: getLeads(),
    properties: getStoredProperties(),
    cookieConsent: getCookieConsent(),
    dashboardState: getDashboardState(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Import storage from JSON
 * @param {string} jsonData - JSON data
 * @returns {boolean} Success
 */
function importStorage(jsonData) {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.leads) {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(data.leads));
    }
    if (data.properties) {
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(data.properties));
    }
    if (data.cookieConsent) {
      localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT, JSON.stringify(data.cookieConsent));
    }
    if (data.dashboardState) {
      localStorage.setItem(STORAGE_KEYS.DASHBOARD_STATE, JSON.stringify(data.dashboardState));
    }
    
    return true;
  } catch (error) {
    console.error('Error importing storage:', error);
    return false;
  }
}

// Export all storage functions
window.OHB_STORAGE = {
  STORAGE_KEYS,
  saveLead,
  getLeads,
  getLeadById,
  updateLeadStatus,
  updateLead,
  deleteLead,
  getLeadsByStatus,
  searchLeads,
  exportLeadsCSV,
  getStoredProperties,
  saveProperty,
  updateProperty,
  deleteProperty,
  loginUser,
  logoutUser,
  getAuth,
  isAuthenticated,
  getCurrentUser,
  getRememberedEmail,
  clearRememberedEmail,
  getSessionTimeRemaining,
  setCookieConsent,
  getCookieConsent,
  hasCookieConsent,
  saveDashboardState,
  getDashboardState,
  generateId,
  clearAllStorage,
  exportAllStorage,
  importStorage,
};
