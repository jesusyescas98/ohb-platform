/* ===================================
   OHB SELL FORM - Commission Calculator
   Calculate commission on property sale
   =================================== */

/**
 * Initialize sell form
 */
function initSellForm() {
  const form = document.getElementById('sell-form');
  if (!form) return;
  
  form.addEventListener('submit', handleSellForm);
  
  // Add commission calculator
  const priceInput = form.querySelector('[name="property-price"]');
  if (priceInput) {
    priceInput.addEventListener('input', calculateCommission);
  }
}

/**
 * Handle sell form submission
 * @param {event} e - Submit event
 */
function handleSellForm(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  
  const name = formData.get('name');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const propertyType = formData.get('property-type');
  const propertyPrice = parseFloat(formData.get('property-price'));
  const propertyDescription = formData.get('property-description');
  
  // Validate
  if (!name || !email || !phone || !propertyType || !propertyPrice) {
    alert('Por favor completa todos los campos obligatorios');
    return;
  }
  
  if (!OHB_UTILS.isValidEmail(email)) {
    alert('Por favor ingresa un email válido');
    return;
  }
  
  // Save lead
  const commission = calculatePropertyCommission(propertyPrice);
  const lead = OHB_STORAGE.saveLead({
    name,
    email,
    phone,
    message: `Tipo: ${propertyType}\nPrecio: ${OHB_UTILS.formatPrice(propertyPrice)}\nDescripción: ${propertyDescription}\nComisión estimada: ${OHB_UTILS.formatPrice(commission)}`,
    source: 'sell-form',
  });
  
  // Show success
  showSellFormSuccess(propertyPrice);
  form.reset();
}

/**
 * Calculate commission on sale price
 * @param {number} price - Sale price
 * @returns {number} Commission amount
 */
function calculatePropertyCommission(price) {
  // Commission rates: 5% up to 1M, 4% above 1M
  if (price <= 1000000) {
    return price * 0.05;
  } else {
    return (1000000 * 0.05) + ((price - 1000000) * 0.04);
  }
}

/**
 * Calculate and display commission
 */
function calculateCommission() {
  const priceInput = document.querySelector('[name="property-price"]');
  const commissionDisplay = document.getElementById('commission-display');
  
  if (!priceInput || !commissionDisplay) return;
  
  const price = parseFloat(priceInput.value);
  
  if (!price || price <= 0) {
    commissionDisplay.style.display = 'none';
    return;
  }
  
  const commission = calculatePropertyCommission(price);
  const percentRate = price <= 1000000 ? 5 : 4;
  
  commissionDisplay.style.display = 'block';
  commissionDisplay.innerHTML = `
    <div style="background: rgba(196, 149, 106, 0.1); padding: 1.5rem; border-radius: var(--radius-lg); margin-top: 1rem;">
      <p style="color: var(--color-text-muted); font-size: 0.875rem; margin-bottom: 0.5rem;">COMISIÓN ESTIMADA</p>
      <div style="font-size: 1.75rem; font-weight: 700; color: var(--color-secondary-light);">
        ${OHB_UTILS.formatPrice(commission)}
      </div>
      <p style="color: var(--color-text-muted); font-size: 0.875rem; margin-top: 0.5rem;">
        (${percentRate}% sobre el precio de venta)
      </p>
    </div>
  `;
}

/**
 * Show success message
 * @param {number} price - Property price
 */
function showSellFormSuccess(price) {
  const commission = calculatePropertyCommission(price);
  
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
      max-width: 500px;
    " id="sell-success">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
      <h3 style="margin-bottom: 1rem;">¡Solicitud Recibida!</h3>
      <p style="color: var(--color-text-secondary); margin-bottom: 1rem;">
        Tu propiedad valuada en ${OHB_UTILS.formatPrice(price)}
      </p>
      <p style="color: var(--color-secondary-light); font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem;">
        Comisión estimada: ${OHB_UTILS.formatPrice(commission)}
      </p>
      <p style="color: var(--color-text-secondary); margin-bottom: 1.5rem;">
        Nos pondremos en contacto pronto para evaluar tu propiedad.
      </p>
      <button class="btn btn-primary" onclick="this.parentElement.remove()">Entendido</button>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', successHTML);
  
  // Auto-close after 5 seconds
  setTimeout(() => {
    const msg = document.getElementById('sell-success');
    if (msg) msg.remove();
  }, 5000);
}

/**
 * Render sell form
 * @param {string} containerId - Container element ID
 */
function renderSellForm(containerId = 'sell-form-container') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const html = `
    <form id="sell-form" class="sell-form">
      <div style="margin-bottom: 2rem;">
        <h2>Vende tu Propiedad con OHB</h2>
        <p style="color: var(--color-text-secondary);">Completa el formulario y recibirás una valuación profesional de tu inmueble.</p>
      </div>
      
      <!-- Contact Section -->
      <h3 style="margin-bottom: 1rem;">Tus Datos</h3>
      
      <div class="form-field">
        <label for="sell-name">Nombre Completo *</label>
        <input type="text" id="sell-name" name="name" required>
      </div>
      
      <div class="form-field">
        <label for="sell-email">Email *</label>
        <input type="email" id="sell-email" name="email" required>
      </div>
      
      <div class="form-field">
        <label for="sell-phone">Teléfono *</label>
        <input type="tel" id="sell-phone" name="phone" required>
      </div>
      
      <!-- Property Section -->
      <h3 style="margin-bottom: 1rem; margin-top: 2rem;">Información de la Propiedad</h3>
      
      <div class="form-field">
        <label for="sell-type">Tipo de Propiedad *</label>
        <select id="sell-type" name="property-type" required>
          <option value="">Selecciona...</option>
          <option value="Casa">Casa</option>
          <option value="Departamento">Departamento</option>
          <option value="Terreno">Terreno</option>
          <option value="Comercial">Comercial</option>
          <option value="Otro">Otro</option>
        </select>
      </div>
      
      <div class="form-field">
        <label for="sell-price">Precio de Venta Estimado (MXN) *</label>
        <input type="number" id="sell-price" name="property-price" min="100000" placeholder="1500000" required>
      </div>
      
      <div id="commission-display"></div>
      
      <div class="form-field">
        <label for="sell-description">Descripción de la Propiedad</label>
        <textarea id="sell-description" name="property-description" placeholder="Cuéntanos sobre tu propiedad: ubicación, características, condiciones, etc."></textarea>
      </div>
      
      <div class="form-actions" style="margin-top: 2rem;">
        <button type="submit" class="btn btn-primary" style="flex: 1;">Enviar Solicitud</button>
      </div>
      
      <p style="color: var(--color-text-muted); font-size: 0.875rem; text-align: center; margin-top: 1rem;">
        Un asesor se pondrá en contacto contigo dentro de 24 horas.
      </p>
    </form>
  `;
  
  container.innerHTML = html;
  initSellForm();
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSellForm);
} else {
  initSellForm();
}

// Export functions
window.OHB_SELL = {
  initSellForm,
  handleSellForm,
  calculatePropertyCommission,
  calculateCommission,
  showSellFormSuccess,
  renderSellForm,
};
