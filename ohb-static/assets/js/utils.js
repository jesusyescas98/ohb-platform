/* ===================================
   OHB UTILS - Helper Functions
   =================================== */

/**
 * Format price to MXN currency
 * @param {number} price - Price in MXN
 * @returns {string} Formatted price string
 */
function formatPrice(price) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Get WhatsApp link with pre-filled message
 * @param {string} message - Message to send
 * @returns {string} WhatsApp URL
 */
function getWALink(message = '') {
  const encodedMsg = encodeURIComponent(message);
  return `${OHB_DATA.CONSTANTS.WHATSAPP_BASE}?text=${encodedMsg}`;
}

/**
 * Get property type label and emoji
 * @param {string} type - Property type (Casa, Departamento, etc.)
 * @returns {object} {label, emoji}
 */
function getPropertyTypeLabel(type) {
  const types = {
    'Casa': { emoji: '🏠', label: 'Casa' },
    'Departamento': { emoji: '🏢', label: 'Departamento' },
    'Terreno': { emoji: '🌍', label: 'Terreno' },
    'Comercial': { emoji: '🏬', label: 'Comercial' },
    'Oficina': { emoji: '💼', label: 'Oficina' },
  };
  return types[type] || { emoji: '🏘️', label: type };
}

/**
 * Get property type icon
 * @param {string} type - Property type
 * @returns {string} Emoji icon
 */
function getPropertyTypeIcon(type) {
  return getPropertyTypeLabel(type).emoji;
}

/**
 * Get status label with color
 * @param {string} status - Status (disponible, vendido, etc.)
 * @returns {object} {label, class}
 */
function getStatusLabel(status) {
  const statuses = {
    'disponible': { label: 'Disponible', class: 'status-active' },
    'vendido': { label: 'Vendido', class: 'status-inactive' },
    'rentado': { label: 'Rentado', class: 'status-inactive' },
    'pendiente': { label: 'Pendiente', class: 'status-pending' },
  };
  return statuses[status] || { label: 'Desconocido', class: 'status-inactive' };
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date (DD/MM/YYYY)
 */
function formatDate(date) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format date with time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time
 */
function formatDateTime(date) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  const dateStr = formatDate(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${dateStr} ${hours}:${minutes}`;
}

/**
 * Format area (m²)
 * @param {number} area - Area in m²
 * @returns {string} Formatted area
 */
function formatArea(area) {
  return `${area.toLocaleString('es-MX')} m²`;
}

/**
 * Get property by ID
 * @param {string} id - Property ID
 * @returns {object|null} Property object or null
 */
function getPropertyById(id) {
  return OHB_DATA.PROPERTIES.find(p => p.id === id) || null;
}

/**
 * Search properties by criteria
 * @param {object} filters - Filter object {type, location, minPrice, maxPrice, bedrooms}
 * @returns {array} Filtered properties
 */
function searchProperties(filters = {}) {
  return OHB_DATA.PROPERTIES.filter(prop => {
    if (filters.type && prop.type !== filters.type) return false;
    if (filters.location && !prop.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.minPrice && prop.price < filters.minPrice) return false;
    if (filters.maxPrice && prop.price > filters.maxPrice) return false;
    if (filters.bedrooms && prop.bedrooms < filters.bedrooms) return false;
    return true;
  });
}

/**
 * Get unique property types
 * @returns {array} Array of property types
 */
function getPropertyTypes() {
  return [...new Set(OHB_DATA.PROPERTIES.map(p => p.type))];
}

/**
 * Get unique locations
 * @returns {array} Array of locations
 */
function getPropertyLocations() {
  return [...new Set(OHB_DATA.PROPERTIES.map(p => p.location))];
}

/**
 * Calculate mortgage payment (PMT formula)
 * @param {number} principal - Loan amount in MXN
 * @param {number} annualRate - Annual interest rate (%)
 * @param {number} years - Loan term in years
 * @returns {number} Monthly payment
 */
function calculateMortgagePayment(principal, annualRate, years) {
  if (principal <= 0 || years <= 0) return 0;
  
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  
  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }
  
  const monthlyPayment = 
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  return monthlyPayment;
}

/**
 * Calculate investment ROI
 * @param {number} initialInvestment - Initial investment
 * @param {number} monthlyIncome - Monthly income/rent
 * @param {number} monthlyExpenses - Monthly expenses/maintenance
 * @param {number} years - Investment period
 * @returns {object} ROI data
 */
function calculateROI(initialInvestment, monthlyIncome, monthlyExpenses, years) {
  const netMonthly = monthlyIncome - monthlyExpenses;
  const totalMonths = years * 12;
  const totalIncome = netMonthly * totalMonths;
  const roi = ((totalIncome / initialInvestment) * 100).toFixed(2);
  const annualROI = (roi / years).toFixed(2);
  
  return {
    initialInvestment,
    monthlyNetIncome: netMonthly,
    totalIncome,
    totalMonths,
    totalROI: roi,
    annualROI,
    monthlyROI: (roi / totalMonths).toFixed(2),
  };
}

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate phone number
 * @param {string} phone - Phone to validate
 * @returns {boolean} True if valid
 */
function isValidPhone(phone) {
  const re = /^(\+?56)?[6-9]\d{8}$/; // Mexican phone format
  return re.test(phone.replace(/\D/g, ''));
}

/**
 * Slugify string for URLs
 * @param {string} str - String to slugify
 * @returns {string} Slugified string
 */
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Deep clone object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Delay function (promise-based)
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Resolved after delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get query parameter from URL
 * @param {string} name - Parameter name
 * @returns {string|null} Parameter value or null
 */
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * Set query parameter in URL
 * @param {string} key - Parameter key
 * @param {string} value - Parameter value
 */
function setQueryParam(key, value) {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set(key, value);
  window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
}

/**
 * Remove query parameter from URL
 * @param {string} key - Parameter key
 */
function removeQueryParam(key) {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.delete(key);
  window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
}

/**
 * Scroll to element smoothly
 * @param {string|element} target - Element selector or element
 */
function scrollToElement(target) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// Export all functions
window.OHB_UTILS = {
  formatPrice,
  getWALink,
  getPropertyTypeLabel,
  getPropertyTypeIcon,
  getStatusLabel,
  formatDate,
  formatDateTime,
  formatArea,
  getPropertyById,
  searchProperties,
  getPropertyTypes,
  getPropertyLocations,
  calculateMortgagePayment,
  calculateROI,
  isValidEmail,
  isValidPhone,
  slugify,
  capitalize,
  deepClone,
  delay,
  getQueryParam,
  setQueryParam,
  removeQueryParam,
  scrollToElement,
};
