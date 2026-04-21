/* ===================================
   OHB CONTACT FORM
   Save leads to localStorage
   =================================== */

/**
 * Initialize contact form
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  
  form.addEventListener('submit', handleContactForm);
}

/**
 * Handle contact form submission
 * @param {event} e - Submit event
 */
function handleContactForm(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  
  const name = formData.get('name');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const subject = formData.get('subject') || '';
  const message = formData.get('message');
  
  // Validate
  if (!name || !email || !phone || !message) {
    alert('Por favor completa todos los campos');
    return;
  }
  
  if (!OHB_UTILS.isValidEmail(email)) {
    alert('Por favor ingresa un email válido');
    return;
  }
  
  // Save lead
  const lead = OHB_STORAGE.saveLead({
    name,
    email,
    phone,
    message: `${subject}\n\n${message}`,
    source: 'contacto',
  });
  
  // Show success message
  showContactFormSuccess();
  
  // Reset form
  form.reset();
  
  // Optional: Send to email service
  sendContactEmailNotification({
    name,
    email,
    phone,
    subject,
    message,
  });
}

/**
 * Show success message
 */
function showContactFormSuccess() {
  const successHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--color-surface);
      padding: 2rem;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-2xl);
      text-align: center;
      z-index: var(--z-modal);
      animation: slideUp var(--transition-base);
    " id="success-message">
      <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
      <h3 style="margin-bottom: 0.5rem;">¡Mensaje Enviado!</h3>
      <p style="color: var(--color-text-secondary); margin-bottom: 1.5rem;">
        Nos pondremos en contacto contigo pronto.
      </p>
      <button class="btn btn-primary" onclick="this.parentElement.remove()">Cerrar</button>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', successHTML);
  
  // Auto-close after 5 seconds
  setTimeout(() => {
    const msg = document.getElementById('success-message');
    if (msg) msg.remove();
  }, 5000);
}

/**
 * Send email notification (placeholder for backend integration)
 * @param {object} data - Contact form data
 */
function sendContactEmailNotification(data) {
  // This would typically call a backend API
  console.log('Sending email notification:', data);
  
  // Example API call (commented out):
  // fetch('/api/send-contact-email', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data)
  // });
}

/**
 * Render contact form
 * @param {string} containerId - Container element ID
 */
function renderContactForm(containerId = 'contact-form-container') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const html = `
    <form id="contact-form" class="contact-form">
      <div class="form-field">
        <label for="contact-name">Nombre Completo *</label>
        <input type="text" id="contact-name" name="name" required placeholder="Tu nombre">
      </div>
      
      <div class="form-field">
        <label for="contact-email">Email *</label>
        <input type="email" id="contact-email" name="email" required placeholder="tu@email.com">
      </div>
      
      <div class="form-field">
        <label for="contact-phone">Teléfono *</label>
        <input type="tel" id="contact-phone" name="phone" required placeholder="656-132-7685">
      </div>
      
      <div class="form-field">
        <label for="contact-subject">Asunto</label>
        <input type="text" id="contact-subject" name="subject" placeholder="¿Cuál es tu consulta?">
      </div>
      
      <div class="form-field">
        <label for="contact-message">Mensaje *</label>
        <textarea id="contact-message" name="message" required placeholder="Cuéntanos cómo podemos ayudarte..."></textarea>
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" style="flex: 1;">Enviar Mensaje</button>
      </div>
    </form>
  `;
  
  container.innerHTML = html;
  initContactForm();
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContactForm);
} else {
  initContactForm();
}

// Export functions
window.OHB_CONTACT = {
  initContactForm,
  handleContactForm,
  showContactFormSuccess,
  sendContactEmailNotification,
  renderContactForm,
};
