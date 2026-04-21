/* ===================================
   OHB FOOTER - Footer Component
   Newsletter, social links, company info
   =================================== */

/**
 * Render footer HTML
 * @returns {string} Footer HTML
 */
function getFooterHTML() {
  const { WHATSAPP_BASE, EMAIL, PHONE, ADDRESS, COMPANY_NAME } = OHB_DATA.CONSTANTS;
  
  return `
    <footer>
      <div class="footer-content">
        <!-- Column 1: About -->
        <div class="footer-section">
          <h3>${COMPANY_NAME}</h3>
          <p>Somos especialistas en asesoría inmobiliaria, inversión y gestión de bienes raíces en Juárez.</p>
          <div class="footer-socials">
            <a href="https://www.facebook.com/ohbasesoriasyconsultorias" target="_blank" class="social-icon" title="Facebook">f</a>
            <a href="https://www.instagram.com/ohbas" target="_blank" class="social-icon" title="Instagram">📸</a>
            <a href="${WHATSAPP_BASE}" target="_blank" class="social-icon" title="WhatsApp">💬</a>
            <a href="mailto:${EMAIL}" class="social-icon" title="Email">✉️</a>
          </div>
        </div>
        
        <!-- Column 2: Quick Links -->
        <div class="footer-section">
          <h3>Navegación</h3>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/propiedades.html">Propiedades</a></li>
            <li><a href="/about.html">Sobre Nosotros</a></li>
            <li><a href="/academy.html">Academia</a></li>
            <li><a href="/services/inmobiliaria.html">Servicios</a></li>
            <li><a href="/contacto.html">Contacto</a></li>
          </ul>
        </div>
        
        <!-- Column 3: Legal -->
        <div class="footer-section">
          <h3>Legal</h3>
          <ul>
            <li><a href="/terms.html">Términos y Condiciones</a></li>
            <li><a href="/privacy.html">Aviso de Privacidad</a></li>
            <li><a href="#">Política de Cookies</a></li>
            <li><a href="#">Disclaimer</a></li>
            <li><a href="#">Política de Reembolso</a></li>
          </ul>
        </div>
        
        <!-- Column 4: Contact & Newsletter -->
        <div class="footer-section">
          <h3>Contacto</h3>
          <ul>
            <li><strong>Dirección:</strong><br>${ADDRESS}</li>
            <li><strong>Teléfono:</strong><br><a href="tel:${PHONE}">${PHONE}</a></li>
            <li><strong>Email:</strong><br><a href="mailto:${EMAIL}">${EMAIL}</a></li>
          </ul>
          <div class="footer-newsletter">
            <p><strong>Suscríbete a nuestro newsletter</strong></p>
            <form id="newsletter-form" class="flex gap-x">
              <input 
                type="email" 
                class="newsletter-input" 
                placeholder="tu@email.com"
                required
              >
              <button type="submit" class="btn btn-primary btn-sm">Suscribir</button>
            </form>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. Todos los derechos reservados.</p>
      </div>
    </footer>
  `;
}

/**
 * Initialize footer
 */
function initFooter() {
  // Insert footer if not already present
  const footer = document.querySelector('footer');
  if (!footer) {
    document.body.insertAdjacentHTML('beforeend', getFooterHTML());
  }
  
  // Handle newsletter subscription
  handleNewsletterForm();
}

/**
 * Handle newsletter form submission
 */
function handleNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput.value.trim();
      
      if (!OHB_UTILS.isValidEmail(email)) {
        alert('Por favor ingresa un email válido');
        return;
      }
      
      // Save lead for newsletter
      const lead = OHB_STORAGE.saveLead({
        email,
        source: 'newsletter',
        message: 'Suscripción a newsletter',
      });
      
      alert('¡Gracias por suscribirte! Pronto recibirás nuestras novedades.');
      emailInput.value = '';
    });
  }
}

/**
 * Render footer with custom options
 * @param {object} options - Custom options
 */
function renderFooter(options = {}) {
  const defaultOptions = {
    showNewsletter: true,
    showSocial: true,
    showContact: true,
    ...options,
  };
  
  let footerHTML = `<footer><div class="footer-content">`;
  
  // About section
  footerHTML += `
    <div class="footer-section">
      <h3>${OHB_DATA.CONSTANTS.COMPANY_NAME}</h3>
      <p>Asesoría inmobiliaria profesional en Juárez, Chihuahua.</p>
  `;
  
  if (defaultOptions.showSocial) {
    const { WHATSAPP_BASE } = OHB_DATA.CONSTANTS;
    footerHTML += `
      <div class="footer-socials">
        <a href="https://www.facebook.com/ohbasesoriasyconsultorias" target="_blank" class="social-icon">f</a>
        <a href="https://www.instagram.com/ohbas" target="_blank" class="social-icon">📸</a>
        <a href="${WHATSAPP_BASE}" target="_blank" class="social-icon">💬</a>
      </div>
    `;
  }
  
  footerHTML += `</div>`;
  
  // Contact section
  if (defaultOptions.showContact) {
    const { EMAIL, PHONE, ADDRESS } = OHB_DATA.CONSTANTS;
    footerHTML += `
      <div class="footer-section">
        <h3>Contacto</h3>
        <ul>
          <li>📍 ${ADDRESS}</li>
          <li>📞 <a href="tel:${PHONE}">${PHONE}</a></li>
          <li>📧 <a href="mailto:${EMAIL}">${EMAIL}</a></li>
        </ul>
      </div>
    `;
  }
  
  // Newsletter section
  if (defaultOptions.showNewsletter) {
    footerHTML += `
      <div class="footer-section">
        <h3>Newsletter</h3>
        <form id="newsletter-form" class="footer-newsletter">
          <input type="email" class="newsletter-input" placeholder="tu@email.com" required>
          <button type="submit" class="btn btn-primary btn-sm">Suscribir</button>
        </form>
      </div>
    `;
  }
  
  footerHTML += `
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${OHB_DATA.CONSTANTS.COMPANY_NAME}. Todos los derechos reservados.</p>
      </div>
    </footer>
  `;
  
  return footerHTML;
}

/**
 * Get social media links
 * @returns {object} Social links
 */
function getSocialLinks() {
  return {
    facebook: 'https://www.facebook.com/ohbasesoriasyconsultorias',
    instagram: 'https://www.instagram.com/ohbas',
    whatsapp: OHB_DATA.CONSTANTS.WHATSAPP_BASE,
    email: `mailto:${OHB_DATA.CONSTANTS.EMAIL}`,
  };
}

/**
 * Share on social media
 * @param {string} platform - Platform name
 * @param {string} message - Message to share
 * @param {string} url - URL to share
 */
function shareOnSocial(platform, message = '', url = '') {
  url = url || window.location.href;
  const encodedUrl = encodeURIComponent(url);
  const encodedMsg = encodeURIComponent(message);
  
  const shares = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedMsg}&url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedMsg}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };
  
  if (shares[platform]) {
    window.open(shares[platform], '_blank', 'width=600,height=400');
  }
}

/**
 * Open contact modal from footer
 */
function openContactFromFooter() {
  const { WHATSAPP_BASE, PHONE, EMAIL } = OHB_DATA.CONSTANTS;
  
  const contactHTML = `
    <div class="modal-backdrop active" id="contact-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Contáctanos</h3>
          <button class="modal-close" id="close-contact">&times;</button>
        </div>
        <div class="modal-body">
          <div style="text-align: center; margin-bottom: 2rem;">
            <p style="margin-bottom: 1rem;"><strong>Elige tu forma de contacto:</strong></p>
            <a href="${WHATSAPP_BASE}?text=Hola, me interesa conocer más sobre vuestros servicios" target="_blank" class="btn btn-primary" style="display: inline-block; margin-bottom: 1rem;">
              💬 WhatsApp
            </a>
            <a href="tel:${PHONE}" class="btn btn-secondary" style="display: inline-block; margin-bottom: 1rem;">
              📞 Llamar
            </a>
            <a href="mailto:${EMAIL}" class="btn btn-secondary" style="display: inline-block;">
              📧 Email
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
  
  const existingModal = document.getElementById('contact-modal');
  if (existingModal) existingModal.remove();
  
  document.body.insertAdjacentHTML('beforeend', contactHTML);
  
  document.getElementById('close-contact').addEventListener('click', () => {
    document.getElementById('contact-modal').remove();
  });
}

// Initialize footer when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFooter);
} else {
  initFooter();
}

// Export footer functions
window.OHB_FOOTER = {
  getFooterHTML,
  initFooter,
  renderFooter,
  getSocialLinks,
  shareOnSocial,
  openContactFromFooter,
};
