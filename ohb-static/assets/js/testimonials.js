/* ===================================
   OHB TESTIMONIALS - Carousel Rotation
   Auto-rotate every 5 seconds
   =================================== */

let currentTestimonialIndex = 0;
let testimonialAutoplayInterval = null;

/**
 * Initialize testimonials carousel
 */
function initTestimonials() {
  const container = document.getElementById('testimonials-container');
  if (!container) return;
  
  renderTestimonialsCarousel();
  startTestimonialAutoplay();
}

/**
 * Render testimonials carousel
 */
function renderTestimonialsCarousel() {
  const container = document.getElementById('testimonials-container');
  if (!container) return;
  
  const { TESTIMONIALS } = OHB_DATA;
  
  let html = `
    <div class="testimonials-carousel">
      <div class="testimonial-card">
  `;
  
  if (TESTIMONIALS.length > 0) {
    const testimonial = TESTIMONIALS[0];
    html += `
      <div class="testimonial-text">"${testimonial.text}"</div>
      <div class="testimonial-author">
        <div class="testimonial-rating">${'⭐'.repeat(testimonial.rating)}</div>
        <div class="testimonial-name">${testimonial.name}</div>
        <div class="testimonial-title">${testimonial.title}</div>
      </div>
    `;
  }
  
  html += `
      </div>
      
      <div class="carousel-controls">
  `;
  
  TESTIMONIALS.forEach((_, index) => {
    html += `
      <button class="carousel-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></button>
    `;
  });
  
  html += `
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Add event listeners to dots
  document.querySelectorAll('.carousel-dot').forEach((dot) => {
    dot.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'));
      showTestimonial(index);
      resetTestimonialAutoplay();
    });
  });
}

/**
 * Show specific testimonial
 * @param {number} index - Testimonial index
 */
function showTestimonial(index) {
  const { TESTIMONIALS } = OHB_DATA;
  
  if (index < 0 || index >= TESTIMONIALS.length) return;
  
  currentTestimonialIndex = index;
  const testimonial = TESTIMONIALS[index];
  
  // Update card content with animation
  const card = document.querySelector('.testimonial-card');
  if (card) {
    card.style.animation = 'none';
    setTimeout(() => {
      card.style.animation = 'fadeIn var(--transition-base)';
      card.innerHTML = `
        <div class="testimonial-text">"${testimonial.text}"</div>
        <div class="testimonial-author">
          <div class="testimonial-rating">${'⭐'.repeat(testimonial.rating)}</div>
          <div class="testimonial-name">${testimonial.name}</div>
          <div class="testimonial-title">${testimonial.title}</div>
        </div>
      `;
    }, 10);
  }
  
  // Update active dot
  document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

/**
 * Next testimonial
 */
function nextTestimonial() {
  const { TESTIMONIALS } = OHB_DATA;
  const nextIndex = (currentTestimonialIndex + 1) % TESTIMONIALS.length;
  showTestimonial(nextIndex);
}

/**
 * Previous testimonial
 */
function prevTestimonial() {
  const { TESTIMONIALS } = OHB_DATA;
  const prevIndex = (currentTestimonialIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length;
  showTestimonial(prevIndex);
}

/**
 * Start autoplay
 * @param {number} interval - Interval in ms (default 5000)
 */
function startTestimonialAutoplay(interval = 5000) {
  stopTestimonialAutoplay();
  
  testimonialAutoplayInterval = setInterval(() => {
    nextTestimonial();
  }, interval);
}

/**
 * Stop autoplay
 */
function stopTestimonialAutoplay() {
  if (testimonialAutoplayInterval) {
    clearInterval(testimonialAutoplayInterval);
    testimonialAutoplayInterval = null;
  }
}

/**
 * Reset autoplay (called when user interacts)
 */
function resetTestimonialAutoplay() {
  startTestimonialAutoplay();
}

/**
 * Get testimonial count
 * @returns {number} Number of testimonials
 */
function getTestimonialCount() {
  return OHB_DATA.TESTIMONIALS.length;
}

/**
 * Get current testimonial index
 * @returns {number} Current index
 */
function getCurrentTestimonialIndex() {
  return currentTestimonialIndex;
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTestimonials);
} else {
  initTestimonials();
}

// Export functions
window.OHB_TESTIMONIALS = {
  initTestimonials,
  showTestimonial,
  nextTestimonial,
  prevTestimonial,
  startTestimonialAutoplay,
  stopTestimonialAutoplay,
  resetTestimonialAutoplay,
  getTestimonialCount,
  getCurrentTestimonialIndex,
};
