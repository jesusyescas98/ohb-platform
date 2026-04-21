/* ===================================
   OHB COUNTERS - Animated Counter Numbers
   IntersectionObserver for scroll animation
   =================================== */

/**
 * Initialize counter animations
 */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  
  if (counters.length === 0) return;
  
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px',
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const finalValue = parseInt(counter.getAttribute('data-counter'));
        const duration = parseInt(counter.getAttribute('data-duration')) || 2000;
        const suffix = counter.getAttribute('data-suffix') || '';
        const prefix = counter.getAttribute('data-prefix') || '';
        
        animateCounter(counter, finalValue, duration, prefix, suffix);
        observer.unobserve(counter);
      }
    });
  }, observerOptions);
  
  counters.forEach((counter) => observer.observe(counter));
}

/**
 * Animate counter from 0 to final value
 * @param {element} element - DOM element
 * @param {number} finalValue - Final value
 * @param {number} duration - Animation duration in ms
 * @param {string} prefix - Prefix (e.g., '$')
 * @param {string} suffix - Suffix (e.g., '+')
 */
function animateCounter(element, finalValue, duration, prefix = '', suffix = '') {
  const startValue = 0;
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (easeInOutQuad)
    const easedProgress = progress < 0.5
      ? 2 * progress * progress
      : -1 + (4 - 2 * progress) * progress;
    
    const currentValue = Math.floor(startValue + (finalValue - startValue) * easedProgress);
    
    element.textContent = `${prefix}${currentValue.toLocaleString('es-MX')}${suffix}`;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  animate();
}

/**
 * Create counter HTML element
 * @param {number} value - Counter value
 * @param {string} label - Counter label
 * @param {object} options - Options {prefix, suffix, duration}
 * @returns {string} HTML
 */
function createCounter(value, label, options = {}) {
  const { prefix = '', suffix = '', duration = 2000 } = options;
  
  return `
    <div class="stat-card">
      <div class="stat-number" data-counter="${value}" data-duration="${duration}" data-prefix="${prefix}" data-suffix="${suffix}">
        ${prefix}0${suffix}
      </div>
      <div class="stat-label">${label}</div>
    </div>
  `;
}

/**
 * Trigger counter animation on demand
 * @param {string|element} selector - Element selector or element
 */
function triggerCounterAnimation(selector) {
  const element = typeof selector === 'string' 
    ? document.querySelector(selector) 
    : selector;
  
  if (!element) return;
  
  const finalValue = parseInt(element.getAttribute('data-counter'));
  const duration = parseInt(element.getAttribute('data-duration')) || 2000;
  const suffix = element.getAttribute('data-suffix') || '';
  const prefix = element.getAttribute('data-prefix') || '';
  
  animateCounter(element, finalValue, duration, prefix, suffix);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCounters);
} else {
  initCounters();
}

// Export functions
window.OHB_COUNTERS = {
  initCounters,
  animateCounter,
  createCounter,
  triggerCounterAnimation,
};
