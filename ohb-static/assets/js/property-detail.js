/* ===================================
   OHB PROPERTY DETAIL - Single Property Page
   Gallery, lead form, similar properties
   =================================== */

/**
 * Initialize property detail page
 */
function initPropertyDetail() {
  const propId = document.body.getAttribute('data-prop-id');
  if (!propId) return;
  
  const property = OHB_UTILS.getPropertyById(propId);
  if (!property) {
    document.body.innerHTML = '<p>Propiedad no encontrada</p>';
    return;
  }
  
  renderPropertyDetail(property);
  setupLeadForm(property);
  renderSimilarProperties(property);
}

/**
 * Render full property detail
 * @param {object} property - Property data
 */
function renderPropertyDetail(property) {
  const {
    name, type, price, location, address, bedrooms, bathrooms, area,
    description, features, images, lat, lng, agent
  } = property;
  
  const typeLabel = OHB_UTILS.getPropertyTypeLabel(type);
  const mainImage = images ? images[0] : '';
  
  const html = `
    <div style="max-width: 1200px; margin: 0 auto; padding: 0 var(--spacing-lg);">
      <!-- Gallery -->
      <div id="property-gallery" style="margin-bottom: 2rem;">
        <div style="position: relative; height: 500px; border-radius: var(--radius-xl); overflow: hidden; margin-bottom: 1rem;">
          <img id="main-image" src="${mainImage}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">
          ${images ? images.map((img, i) => `
            <img 
              src="${img}" 
              alt="Foto ${i + 1}" 
              style="width: 100%; height: 150px; object-fit: cover; border-radius: var(--radius-lg); cursor: pointer; border: 2px solid ${i === 0 ? 'var(--color-secondary-light)' : 'transparent'};"
              onclick="changeImage('${img}', this)"
            >
          `).join('') : ''}
        </div>
      </div>
      
      <!-- Detail Grid -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-bottom: 2rem;">
        <!-- Main Content -->
        <div>
          <!-- Header -->
          <div style="margin-bottom: 2rem;">
            <div class="property-type">${typeLabel.emoji} ${type}</div>
            <h1 style="margin: 1rem 0;">${name}</h1>
            <p style="color: var(--color-text-secondary); font-size: 1.1rem;">📍 ${address}</p>
          </div>
          
          <!-- Price -->
          <div style="background: rgba(196, 149, 106, 0.1); padding: 2rem; border-radius: var(--radius-xl); margin-bottom: 2rem;">
            <div style="color: var(--color-text-muted); font-size: 0.875rem; margin-bottom: 0.5rem;">PRECIO</div>
            <div style="font-size: 2.5rem; font-weight: 700; color: var(--color-secondary-light);">${OHB_UTILS.formatPrice(price)}</div>
          </div>
          
          <!-- Features -->
          <div style="margin-bottom: 2rem;">
            <h2 style="margin-bottom: 1.5rem;">Características</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
              ${bedrooms > 0 ? `
                <div style="background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-lg); text-align: center;">
                  <div style="font-size: 2rem; font-weight: 700; color: var(--color-secondary-light);">${bedrooms}</div>
                  <div style="color: var(--color-text-muted); font-size: 0.875rem;">Recámaras</div>
                </div>
              ` : ''}
              ${bathrooms > 0 ? `
                <div style="background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-lg); text-align: center;">
                  <div style="font-size: 2rem; font-weight: 700; color: var(--color-secondary-light);">${bathrooms}</div>
                  <div style="color: var(--color-text-muted); font-size: 0.875rem;">Baños</div>
                </div>
              ` : ''}
              <div style="background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-lg); text-align: center;">
                <div style="font-size: 2rem; font-weight: 700; color: var(--color-secondary-light);">${area}</div>
                <div style="color: var(--color-text-muted); font-size: 0.875rem;">m²</div>
              </div>
            </div>
          </div>
          
          <!-- Description -->
          <div style="margin-bottom: 2rem;">
            <h2 style="margin-bottom: 1rem;">Descripción</h2>
            <p style="line-height: 1.8;">${description}</p>
          </div>
          
          <!-- Amenities -->
          ${features && features.length > 0 ? `
            <div style="margin-bottom: 2rem;">
              <h2 style="margin-bottom: 1rem;">Amenidades</h2>
              <ul style="list-style: none; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                ${features.map(f => `<li style="padding: 0.5rem 0; color: var(--color-text-secondary);">✓ ${f}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <!-- Map -->
          ${lat && lng ? `
            <div style="margin-bottom: 2rem;">
              <h2 style="margin-bottom: 1rem;">Ubicación</h2>
              <div style="width: 100%; height: 400px; border-radius: var(--radius-xl); overflow: hidden; background: var(--color-surface);">
                <iframe 
                  width="100%" 
                  height="100%" 
                  style="border: none;"
                  src="https://www.google.com/maps/embed/v1/place?key=AIzaSyDYtCkoRrW61XT2FeGJ5vCCJkGMxjcN3fQ&q=${lat},${lng}"
                ></iframe>
              </div>
            </div>
          ` : ''}
        </div>
        
        <!-- Sidebar -->
        <div>
          <!-- Lead Form -->
          <div style="background: var(--color-surface); padding: 2rem; border-radius: var(--radius-xl); margin-bottom: 2rem; position: sticky; top: 100px;">
            <h3 style="margin-bottom: 1.5rem;">Contactar sobre esta propiedad</h3>
            
            <form id="property-lead-form">
              <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 600;">Nombre</label>
                <input type="text" name="name" required style="width: 100%; padding: 0.75rem; background: var(--color-bg-dark); border: 1px solid var(--color-surface-light); border-radius: var(--radius-md); color: var(--color-text-primary);">
              </div>
              
              <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 600;">Email</label>
                <input type="email" name="email" required style="width: 100%; padding: 0.75rem; background: var(--color-bg-dark); border: 1px solid var(--color-surface-light); border-radius: var(--radius-md); color: var(--color-text-primary);">
              </div>
              
              <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 600;">Teléfono</label>
                <input type="tel" name="phone" required style="width: 100%; padding: 0.75rem; background: var(--color-bg-dark); border: 1px solid var(--color-surface-light); border-radius: var(--radius-md); color: var(--color-text-primary);">
              </div>
              
              <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 600;">Mensaje</label>
                <textarea name="message" style="width: 100%; padding: 0.75rem; background: var(--color-bg-dark); border: 1px solid var(--color-surface-light); border-radius: var(--radius-md); color: var(--color-text-primary); resize: vertical; min-height: 100px;"></textarea>
              </div>
              
              <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 0.5rem;">Enviar Mensaje</button>
            </form>
            
            <!-- Contact Info -->
            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--color-surface-light);">
              <p style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 1rem;">O contacta directamente:</p>
              <a href="${OHB_UTILS.getWALink('Hola, me interesa ' + name)}" target="_blank" class="btn btn-primary" style="width: 100%; text-align: center; display: block;">
                💬 WhatsApp
              </a>
            </div>
            
            <!-- Agent Info -->
            ${agent ? `
              <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(196, 149, 106, 0.1); border-radius: var(--radius-lg);">
                <div style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 0.25rem;">AGENTE</div>
                <div style="font-weight: 600; color: var(--color-secondary-light);">${agent}</div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
  
  const container = document.getElementById('property-detail-container');
  if (container) {
    container.innerHTML = html;
  }
}

/**
 * Change main image
 * @param {string} src - Image source
 * @param {element} thumbnail - Thumbnail element
 */
function changeImage(src, thumbnail) {
  const mainImage = document.getElementById('main-image');
  if (mainImage) {
    mainImage.src = src;
  }
  
  // Update thumbnail borders
  document.querySelectorAll('#property-gallery img').forEach(img => {
    img.style.borderColor = 'transparent';
  });
  if (thumbnail) {
    thumbnail.style.borderColor = 'var(--color-secondary-light)';
  }
}

/**
 * Setup lead form submission
 * @param {object} property - Property data
 */
function setupLeadForm(property) {
  const form = document.getElementById('property-lead-form');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const lead = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      source: 'property-detail',
      propertyId: property.id,
      propertyName: property.name,
      propertyPrice: property.price,
    };
    
    OHB_STORAGE.saveLead(lead);
    alert('¡Gracias! Nos pondremos en contacto pronto.');
    form.reset();
  });
}

/**
 * Render similar properties
 * @param {object} property - Current property
 */
function renderSimilarProperties(property) {
  const container = document.getElementById('similar-properties-container');
  if (!container) return;
  
  const similar = OHB_DATA.PROPERTIES.filter(p =>
    p.id !== property.id &&
    (p.type === property.type || 
     p.location === property.location ||
     Math.abs(p.price - property.price) < property.price * 0.3)
  ).slice(0, 3);
  
  if (similar.length === 0) {
    container.innerHTML = '<p>No hay propiedades similares</p>';
    return;
  }
  
  container.innerHTML = '<h2 style="margin-bottom: 2rem;">Propiedades Similares</h2>';
  
  const grid = document.createElement('div');
  grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem;';
  
  similar.forEach(prop => {
    grid.innerHTML += OHB_PROPERTIES.createPropertyCard(prop);
  });
  
  container.appendChild(grid);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPropertyDetail);
} else {
  initPropertyDetail();
}

// Export functions
window.OHB_DETAIL = {
  initPropertyDetail,
  renderPropertyDetail,
  changeImage,
  setupLeadForm,
  renderSimilarProperties,
};
