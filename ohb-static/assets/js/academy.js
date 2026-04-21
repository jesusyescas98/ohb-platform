/* ===================================
   OHB ACADEMY - Courses & Learning
   Course filters, FAQ accordion
   =================================== */

let currentCategoryFilter = 'todos';

/**
 * Initialize academy section
 */
function initAcademy() {
  renderCourseFilters();
  renderCourseGrid();
  initFAQAccordion();
}

/**
 * Render course category filters
 */
function renderCourseFilters() {
  const container = document.getElementById('course-filters');
  if (!container) return;
  
  const categories = ['todos', 'inversión', 'análisis', 'negociación', 'marketing', 'legal'];
  
  let html = '';
  categories.forEach(cat => {
    const label = cat.charAt(0).toUpperCase() + cat.slice(1);
    html += `
      <button 
        class="filter-btn ${cat === 'todos' ? 'active' : ''}" 
        onclick="filterCourses('${cat}')"
      >
        ${label}
      </button>
    `;
  });
  
  container.innerHTML = html;
}

/**
 * Filter courses by category
 * @param {string} category - Category name
 */
function filterCourses(category) {
  currentCategoryFilter = category;
  
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.toLowerCase() === category) {
      btn.classList.add('active');
    }
  });
  
  renderCourseGrid();
}

/**
 * Render course grid
 */
function renderCourseGrid() {
  const container = document.getElementById('courses-grid');
  if (!container) return;
  
  const { COURSES } = OHB_DATA;
  
  let filtered = COURSES;
  if (currentCategoryFilter !== 'todos') {
    filtered = COURSES.filter(c => c.category === currentCategoryFilter);
  }
  
  if (filtered.length === 0) {
    container.innerHTML = '<p>No hay cursos en esta categoría</p>';
    return;
  }
  
  container.innerHTML = '';
  
  filtered.forEach(course => {
    const card = createCourseCard(course);
    container.innerHTML += card;
  });
}

/**
 * Create course card HTML
 * @param {object} course - Course data
 * @returns {string} HTML
 */
function createCourseCard(course) {
  const {
    id, title, description, level, duration, price, isPremium, modules, image
  } = course;
  
  return `
    <div class="course-card">
      <div class="course-image" style="background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);"></div>
      
      <div class="course-content">
        <div class="course-badge">
          ${isPremium ? '💎 Premium' : '🎁 Gratuito'}
        </div>
        
        <h3 class="course-title">${title}</h3>
        
        <p class="course-description">${description}</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem; font-size: 0.875rem; color: var(--color-text-muted);">
          <div>📚 ${modules} módulos</div>
          <div>⏱️ ${duration}</div>
          <div>📊 ${level}</div>
          <div>${isPremium ? `💰 ${OHB_UTILS.formatPrice(price)}` : 'Gratis'}</div>
        </div>
        
        <div class="course-meta">
          <button class="btn btn-primary btn-sm" onclick="enrollCourse('${id}')">
            ${isPremium ? 'Comprar Ahora' : 'Ir al Curso'}
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Enroll in course
 * @param {string} courseId - Course ID
 */
function enrollCourse(courseId) {
  const course = OHB_DATA.COURSES.find(c => c.id === courseId);
  if (!course) return;
  
  if (course.isPremium) {
    alert(`Para comprar "${course.title}" contacta con nuestro equipo.\n\nWhatsApp: +526561327685`);
  } else {
    alert(`¡Bienvenido al curso "${course.title}"! Contenido disponible pronto.`);
  }
}

/**
 * Initialize FAQ accordion
 */
function initFAQAccordion() {
  const items = document.querySelectorAll('.accordion-item');
  
  items.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');
    
    if (header && content) {
      header.addEventListener('click', () => {
        // Close other items
        items.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.querySelector('.accordion-header').classList.remove('active');
            otherItem.querySelector('.accordion-content').classList.remove('active');
          }
        });
        
        // Toggle current item
        header.classList.toggle('active');
        content.classList.toggle('active');
      });
    }
  });
}

/**
 * Render FAQ section
 * @param {string} containerId - Container element ID
 */
function renderFAQ(containerId = 'faq-container') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const faqs = [
    {
      question: '¿Cuáles son los requisitos para invertir en inmuebles?',
      answer: 'Los requisitos varían según el tipo de inversión y el financiamiento. Generalmente necesitas identificación válida, comprobante de ingresos y capacidad de pago. Nuestro equipo te asesorará según tu situación particular.'
    },
    {
      question: '¿Cómo se calcula la comisión de OHB?',
      answer: 'Nuestra comisión es del 5% sobre propiedades hasta $1,000,000 y del 4% sobre el monto excedente. Esto es competitivo en la industria y ya está incluido en muchos casos.'
    },
    {
      question: '¿Qué servicios ofrece OHB además de venta?',
      answer: 'Ofrecemos asesoría de inversión, gestión de propiedades, valuaciones, análisis de mercado y cursos educativos. Nuestro objetivo es ser tu socio integral en bienes raíces.'
    },
    {
      question: '¿Cuánto tiempo tarda el proceso de compra?',
      answer: 'El tiempo promedio es de 30-45 días desde que se formaliza el acuerdo hasta la entrega de documentos. Este tiempo incluye trámites notariales y registro de propiedad.'
    },
    {
      question: '¿Asesoría para hipotecas?',
      answer: 'Sí, asesoramos en el proceso de obtención de hipotecas. Tenemos contactos con principales instituciones financieras y te ayudamos a obtener las mejores tasas.'
    },
  ];
  
  let html = '<div class="faq-container">';
  
  faqs.forEach((faq, index) => {
    html += `
      <div class="accordion-item">
        <button class="accordion-header ${index === 0 ? 'active' : ''}">
          ${faq.question}
        </button>
        <div class="accordion-content ${index === 0 ? 'active' : ''}">
          <p class="accordion-text">${faq.answer}</p>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  container.innerHTML = html;
  initFAQAccordion();
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAcademy);
} else {
  initAcademy();
}

// Export functions
window.OHB_ACADEMY = {
  initAcademy,
  renderCourseFilters,
  filterCourses,
  renderCourseGrid,
  createCourseCard,
  enrollCourse,
  initFAQAccordion,
  renderFAQ,
};
