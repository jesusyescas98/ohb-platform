/* ===================================
   OHB COOKIE BANNER - Cookie Consent
   =================================== */

/**
 * Initialize cookie banner
 */
function initCookieBanner() {
  // Check if user has already consented
  if (OHB_STORAGE.getCookieConsent()) {
    return;
  }
  
  // Create banner HTML
  const bannerHTML = `
    <div id="cookie-banner" class="cookie-banner">
      <div class="cookie-content">
        <div class="cookie-text">
          <h3>🍪 Aviso de Cookies</h3>
          <p>Utilizamos cookies para mejorar tu experiencia en nuestro sitio. Al continuar navegando, aceptas nuestro uso de cookies.</p>
        </div>
        <div class="cookie-actions">
          <button id="cookie-reject" class="btn btn-ghost">Rechazar</button>
          <button id="cookie-accept" class="btn btn-primary">Aceptar</button>
        </div>
      </div>
    </div>
  `;
  
  // Add CSS for banner
  const styleHTML = `
    <style>
      .cookie-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--color-surface);
        border-top: 2px solid var(--color-secondary-light);
        padding: var(--spacing-lg);
        z-index: var(--z-notification);
        animation: slideUp var(--transition-base);
        backdrop-filter: blur(20px);
      }
      
      .cookie-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--spacing-lg);
      }
      
      .cookie-text {
        flex: 1;
      }
      
      .cookie-text h3 {
        margin-bottom: var(--spacing-sm);
        font-size: var(--font-size-lg);
      }
      
      .cookie-text p {
        font-size: var(--font-size-sm);
        margin: 0;
      }
      
      .cookie-actions {
        display: flex;
        gap: var(--spacing-md);
        flex-wrap: wrap;
      }
      
      .cookie-banner .btn {
        padding: var(--spacing-sm) var(--spacing-lg);
        font-size: var(--font-size-sm);
      }
      
      @media (max-width: 768px) {
        .cookie-content {
          flex-direction: column;
          align-items: flex-start;
        }
        
        .cookie-actions {
          width: 100%;
        }
        
        .cookie-actions button {
          flex: 1;
        }
      }
    </style>
  `;
  
  // Insert styles and banner
  if (!document.getElementById('cookie-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'cookie-styles';
    styleEl.innerHTML = styleHTML.replace(/<style>|<\/style>/g, '');
    document.head.appendChild(styleEl);
  }
  
  document.body.insertAdjacentHTML('beforeend', bannerHTML);
  
  // Handle accept
  document.getElementById('cookie-accept').addEventListener('click', () => {
    OHB_STORAGE.setCookieConsent(true);
    const banner = document.getElementById('cookie-banner');
    banner.style.animation = 'slideDown var(--transition-base)';
    setTimeout(() => banner.remove(), 300);
    
    // Enable analytics, etc.
    enableAnalytics();
  });
  
  // Handle reject
  document.getElementById('cookie-reject').addEventListener('click', () => {
    OHB_STORAGE.setCookieConsent(false);
    const banner = document.getElementById('cookie-banner');
    banner.style.animation = 'slideDown var(--transition-base)';
    setTimeout(() => banner.remove(), 300);
  });
}

/**
 * Enable analytics (placeholder)
 */
function enableAnalytics() {
  // Initialize Google Analytics, Hotjar, etc.
  console.log('Analytics enabled');
}

/**
 * Check cookie consent
 * @returns {boolean} True if cookies accepted
 */
function checkCookieConsent() {
  return OHB_STORAGE.hasCookieConsent();
}

/**
 * Show cookie preference modal
 */
function showCookiePreferences() {
  const modalHTML = `
    <div class="modal-backdrop active" id="cookie-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Preferencias de Cookies</h3>
          <button class="modal-close" id="close-cookie">&times;</button>
        </div>
        <div class="modal-body">
          <div style="margin-bottom: 2rem;">
            <h4 style="margin-bottom: 1rem;">Tipos de Cookies</h4>
            
            <div style="margin-bottom: 1.5rem;">
              <label style="display: flex; align-items: center; gap: 1rem; cursor: pointer;">
                <input type="checkbox" id="essential-cookies" checked disabled>
                <span>
                  <strong>Cookies Esenciales</strong>
                  <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: var(--color-text-muted);">
                    Necesarias para el funcionamiento del sitio.
                  </p>
                </span>
              </label>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
              <label style="display: flex; align-items: center; gap: 1rem; cursor: pointer;">
                <input type="checkbox" id="analytics-cookies">
                <span>
                  <strong>Cookies de Análisis</strong>
                  <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: var(--color-text-muted);">
                    Nos ayudan a entender cómo usas nuestro sitio.
                  </p>
                </span>
              </label>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
              <label style="display: flex; align-items: center; gap: 1rem; cursor: pointer;">
                <input type="checkbox" id="marketing-cookies">
                <span>
                  <strong>Cookies de Marketing</strong>
                  <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: var(--color-text-muted);">
                    Para personalizar anuncios y contenido.
                  </p>
                </span>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="save-preferences">Guardar Preferencias</button>
          <button class="btn btn-primary" id="accept-all-cookies">Aceptar Todo</button>
        </div>
      </div>
    </div>
  `;
  
  const existingModal = document.getElementById('cookie-modal');
  if (existingModal) existingModal.remove();
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Handle close
  document.getElementById('close-cookie').addEventListener('click', () => {
    document.getElementById('cookie-modal').remove();
  });
  
  // Handle save preferences
  document.getElementById('save-preferences').addEventListener('click', () => {
    const preferences = {
      essential: true,
      analytics: document.getElementById('analytics-cookies').checked,
      marketing: document.getElementById('marketing-cookies').checked,
    };
    
    localStorage.setItem('ohb_cookie_preferences', JSON.stringify(preferences));
    alert('Preferencias guardadas');
    document.getElementById('cookie-modal').remove();
  });
  
  // Handle accept all
  document.getElementById('accept-all-cookies').addEventListener('click', () => {
    const preferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    
    OHB_STORAGE.setCookieConsent(true);
    localStorage.setItem('ohb_cookie_preferences', JSON.stringify(preferences));
    alert('Todas las cookies aceptadas');
    document.getElementById('cookie-modal').remove();
  });
}

/**
 * Get cookie preferences
 * @returns {object} Cookie preferences
 */
function getCookiePreferences() {
  const stored = localStorage.getItem('ohb_cookie_preferences');
  return stored ? JSON.parse(stored) : {
    essential: true,
    analytics: false,
    marketing: false,
  };
}

// Initialize banner on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCookieBanner);
} else {
  initCookieBanner();
}

// Export functions
window.OHB_COOKIES = {
  initCookieBanner,
  checkCookieConsent,
  showCookiePreferences,
  getCookiePreferences,
};
