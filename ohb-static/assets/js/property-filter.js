/**
 * property-filter.js
 * Enhanced filtering, view toggle, gallery rotation, and rendering logic
 * for the property listing page with grid/list view, multi-filters, and galleries
 */

/* ──────────────────────────────────────────────────────────────────
   VIEW STATE MANAGEMENT
   ────────────────────────────────────────────────────────────────── */

let currentViewMode = 'grid'; // 'grid' or 'list'
let galleryRotations = {}; // Track gallery rotation timers by property ID

/* ──────────────────────────────────────────────────────────────────
   FILTER ENGINE
   ────────────────────────────────────────────────────────────────── */

function getActiveFilters() {
  return {
    type: document.getElementById('filterType')?.value || '',
    location: document.getElementById('filterLocation')?.value || '',
    bedrooms: document.getElementById('filterBedrooms')?.value || '',
    bathrooms: document.getElementById('filterBathrooms')?.value || '',
    priceMin: parseInt(document.getElementById('filterPriceMin')?.value || 0),
    priceMax: parseInt(document.getElementById('filterPriceMax')?.value || 0),
    sizeMin: parseInt(document.getElementById('filterSizeMin')?.value || 0),
    sizeMax: parseInt(document.getElementById('filterSizeMax')?.value || 0)
  };
}

function applyFilters() {
  const properties = getStoredProperties();
  const filters = getActiveFilters();
  const filtered = filterProperties(properties, filters);
  renderCatalog(filtered);
  updateResultsCount(filtered.length, properties.length);
}

function filterProperties(props, filters) {
  return props.filter(prop => {
    // Type filter
    if (filters.type && prop.type !== filters.type) return false;

    // Location filter
    if (filters.location) {
      const propLocation = (prop.location || '').toLowerCase();
      if (filters.location === 'juarez' && !propLocation.includes('juárez') && !propLocation.includes('juarez')) return false;
      if (filters.location === 'alrededores' && (propLocation.includes('juárez') || propLocation.includes('juarez'))) return false;
    }

    // Bedrooms filter (minimum)
    if (filters.bedrooms !== '') {
      const minBeds = parseInt(filters.bedrooms);
      if (minBeds === 4) {
        if ((prop.bedrooms || 0) < 4) return false;
      } else {
        if ((prop.bedrooms || 0) < minBeds) return false;
      }
    }

    // Bathrooms filter (minimum)
    if (filters.bathrooms !== '') {
      const minBaths = parseInt(filters.bathrooms);
      if (minBaths === 3) {
        if ((prop.bathrooms || 0) < 3) return false;
      } else {
        if ((prop.bathrooms || 0) < minBaths) return false;
      }
    }

    // Price range filter
    const price = prop.price || 0;
    if (filters.priceMin > 0 && price < filters.priceMin) return false;
    if (filters.priceMax > 0 && price > filters.priceMax) return false;

    // Size range filter
    const size = prop.sqMeters || 0;
    if (filters.sizeMin > 0 && size < filters.sizeMin) return false;
    if (filters.sizeMax > 0 && size > filters.sizeMax) return false;

    return true;
  });
}

function clearAllFilters() {
  document.getElementById('filterType').value = '';
  document.getElementById('filterLocation').value = '';
  document.getElementById('filterBedrooms').value = '';
  document.getElementById('filterBathrooms').value = '';
  document.getElementById('filterPriceMin').value = '';
  document.getElementById('filterPriceMax').value = '';
  document.getElementById('filterSizeMin').value = '';
  document.getElementById('filterSizeMax').value = '';
  applyFilters();
}

/* ──────────────────────────────────────────────────────────────────
   VIEW TOGGLE
   ────────────────────────────────────────────────────────────────── */

function switchView(mode) {
  currentViewMode = mode;
  const gridBtn = document.getElementById('gridViewBtn');
  const listBtn = document.getElementById('listViewBtn');
  const container = document.getElementById('propertiesContainer');

  // Update button states
  if (gridBtn) gridBtn.classList.toggle('active', mode === 'grid');
  if (listBtn) listBtn.classList.toggle('active', mode === 'list');

  // Update container class
  if (container) {
    container.classList.toggle('list-view', mode === 'list');
    container.classList.remove('grid-view');
    if (mode === 'grid') {
      container.classList.add('grid-view');
    }
  }

  // Re-render with current filters
  applyFilters();
}

/* ──────────────────────────────────────────────────────────────────
   GALLERY ROTATION
   ────────────────────────────────────────────────────────────────── */

function initGalleryRotation(propertyId, images) {
  if (!images || images.length < 2) return;

  const gallery = document.querySelector(`[data-gallery-id="${propertyId}"]`);
  if (!gallery) return;

  let currentIndex = 0;
  let isPaused = false;

  function showImage(index) {
    const allImages = gallery.querySelectorAll('.property-gallery-image');
    allImages.forEach((img, i) => {
      img.classList.toggle('active', i === index);
    });

    const counter = gallery.querySelector('.gallery-counter');
    if (counter) {
      counter.textContent = (index + 1) + '/' + images.length;
    }
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
  }

  // Set up nav buttons
  const nextBtn = gallery.querySelector('[data-gallery-next]');
  const prevBtn = gallery.querySelector('[data-gallery-prev]');

  if (nextBtn) nextBtn.addEventListener('click', nextImage);
  if (prevBtn) prevBtn.addEventListener('click', prevImage);

  // Auto-rotate every 3 seconds
  const startRotation = () => {
    if (galleryRotations[propertyId]) clearInterval(galleryRotations[propertyId]);
    galleryRotations[propertyId] = setInterval(() => {
      if (!isPaused) nextImage();
    }, 3000);
  };

  // Pause on hover, resume on mouse leave
  gallery.addEventListener('mouseenter', () => {
    isPaused = true;
    if (galleryRotations[propertyId]) clearInterval(galleryRotations[propertyId]);
  });

  gallery.addEventListener('mouseleave', () => {
    isPaused = false;
    startRotation();
  });

  // Initialize display
  showImage(0);
  startRotation();
}

/* ──────────────────────────────────────────────────────────────────
   RENDER CATALOG
   ────────────────────────────────────────────────────────────────── */

function renderCatalog(properties) {
  const container = document.getElementById('propertiesContainer');
  if (!container) return;

  if (properties.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🏚️</div>
        <h3>No hay resultados</h3>
        <p>No se encontraron propiedades con los filtros seleccionados.</p>
        <button class="btn-reset-filters" onclick="clearAllFilters()">
          Limpiar Filtros
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = properties.map(prop =>
    currentViewMode === 'grid' ? renderGridCard(prop) : renderListCard(prop)
  ).join('');

  // Initialize galleries
  properties.forEach(prop => {
    if (prop.images && prop.images.length > 0) {
      initGalleryRotation(prop.id, prop.images);
    }
  });
}

function renderGridCard(prop) {
  const images = prop.images || [];
  const mainImage = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80';

  let statusBadge = '';
  if (prop.status === 'vendida') {
    statusBadge = '<span class="property-badge status-sold">Vendida</span>';
  } else if (prop.status === 'renta') {
    statusBadge = '<span class="property-badge status-rent">En Renta</span>';
  }

  const typeLabel = prop.type.charAt(0).toUpperCase() + prop.type.slice(1);

  let specsHtml = '';
  if (prop.bedrooms > 0) specsHtml += `<div class="property-spec"><span class="property-spec-icon">🛏️</span> ${prop.bedrooms} rec</div>`;
  if (prop.bathrooms > 0) specsHtml += `<div class="property-spec"><span class="property-spec-icon">🚿</span> ${prop.bathrooms} baños</div>`;
  if (prop.sqMeters) specsHtml += `<div class="property-spec"><span class="property-spec-icon">📐</span> ${prop.sqMeters} m²</div>`;
  if (prop.parking) specsHtml += `<div class="property-spec"><span class="property-spec-icon">🚗</span> ${prop.parking} cajón${prop.parking > 1 ? 'es' : ''}</div>`;

  const price = prop.price ? '$' + (prop.price / 1000000).toFixed(2) + 'M' : 'Consultar';

  return `
    <a href="propiedades/${prop.id}.html" class="property-card">
      <div class="property-gallery" data-gallery-id="${prop.id}">
        ${images.map((img, i) => `
          <img src="${img}" alt="${prop.title}" class="property-gallery-image ${i === 0 ? 'active' : ''}" loading="lazy">
        `).join('')}
        <div class="property-badges">
          <span class="property-badge">${typeLabel}</span>
          ${statusBadge}
        </div>
        <div class="property-gallery-controls">
          <button class="gallery-nav-btn" data-gallery-prev title="Anterior">&lt;</button>
          <span class="gallery-counter">${images.length > 0 ? '1/' + images.length : '0/0'}</span>
          <button class="gallery-nav-btn" data-gallery-next title="Siguiente">&gt;</button>
        </div>
      </div>
      <div class="property-content">
        <div class="property-location">📍 ${prop.location || 'Ciudad Juárez'}</div>
        <h3 class="property-title">${prop.title}</h3>
        <div class="property-price">${price}</div>
        <div class="property-specs">
          ${specsHtml}
        </div>
        <span class="property-cta">Ver Detalles →</span>
      </div>
    </a>
  `;
}

function renderListCard(prop) {
  const images = prop.images || [];
  const mainImage = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80';

  let statusBadge = '';
  if (prop.status === 'vendida') {
    statusBadge = '<span class="property-badge status-sold">Vendida</span>';
  } else if (prop.status === 'renta') {
    statusBadge = '<span class="property-badge status-rent">En Renta</span>';
  }

  const typeLabel = prop.type.charAt(0).toUpperCase() + prop.type.slice(1);
  const price = prop.price ? '$' + (prop.price / 1000000).toFixed(2) + 'M' : 'Consultar';

  return `
    <a href="propiedades/${prop.id}.html" class="property-list-item">
      <div class="property-list-gallery" data-gallery-id="${prop.id}">
        ${images.map((img, i) => `
          <img src="${img}" alt="${prop.title}" class="property-gallery-image ${i === 0 ? 'active' : ''}" loading="lazy">
        `).join('')}
        <div class="property-badges">
          <span class="property-badge">${typeLabel}</span>
          ${statusBadge}
        </div>
      </div>
      <div class="property-list-content">
        <div class="property-list-header">
          <div class="property-location">📍 ${prop.location || 'Ciudad Juárez'}</div>
          <h3 class="property-title">${prop.title}</h3>
        </div>
        <div class="property-list-specs">
          <div class="property-list-spec">
            <div class="property-list-spec-label">Recámaras</div>
            <div class="property-list-spec-value">${prop.bedrooms || 0}</div>
          </div>
          <div class="property-list-spec">
            <div class="property-list-spec-label">Baños</div>
            <div class="property-list-spec-value">${prop.bathrooms || 0}</div>
          </div>
          <div class="property-list-spec">
            <div class="property-list-spec-label">Tamaño</div>
            <div class="property-list-spec-value">${prop.sqMeters || 0}m²</div>
          </div>
          <div class="property-list-spec">
            <div class="property-list-spec-label">Cajones</div>
            <div class="property-list-spec-value">${prop.parking || 0}</div>
          </div>
        </div>
        <div class="property-list-footer">
          <div class="property-price">${price}</div>
          <span class="property-cta">Ver Detalles →</span>
        </div>
      </div>
    </a>
  `;
}

function updateResultsCount(filtered, total) {
  const counter = document.getElementById('resultsCount');
  if (counter) {
    counter.textContent = `Mostrando ${filtered} de ${total} propiedades`;
  }
}

/* ──────────────────────────────────────────────────────────────────
   INITIALIZATION
   ────────────────────────────────────────────────────────────────── */

function initPropertyCatalog() {
  // Set up event listeners
  const filterInputs = [
    'filterType',
    'filterLocation',
    'filterBedrooms',
    'filterBathrooms',
    'filterPriceMin',
    'filterPriceMax',
    'filterSizeMin',
    'filterSizeMax'
  ];

  filterInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', applyFilters);
      el.addEventListener('input', debounce(applyFilters, 300));
    }
  });

  // Set up view toggle buttons
  const gridBtn = document.getElementById('gridViewBtn');
  const listBtn = document.getElementById('listViewBtn');

  if (gridBtn) gridBtn.addEventListener('click', () => switchView('grid'));
  if (listBtn) listBtn.addEventListener('click', () => switchView('list'));

  // Set up clear filters button
  const clearBtn = document.getElementById('clearFiltersBtn');
  if (clearBtn) clearBtn.addEventListener('click', clearAllFilters);

  // Initial render
  const properties = getStoredProperties();
  renderCatalog(properties);
  updateResultsCount(properties.length, properties.length);
}

/* ──────────────────────────────────────────────────────────────────
   UTILITY FUNCTIONS
   ────────────────────────────────────────────────────────────────── */

function debounce(fn, delay) {
  let timer;
  return function () {
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(null, args), delay);
  };
}
