/* ===================================
   OHB HEADER - Navigation Component
   Sticky header, hamburger menu, dropdown services
   =================================== */

/**
 * Render header HTML
 * @returns {string} Header HTML
 */
function getHeaderHTML() {
  const user = OHB_STORAGE.getCurrentUser();
  
  return `
    <header>
      <div class="header-container">
        <a href="/" class="logo">
          <img src="/assets/images/logo-ohb.png" alt="OHB Logo">
          <span>OHB</span>
        </a>
        
        <nav class="nav-menu" id="nav-menu">
          <li><a href="/">Inicio</a></li>
          <li><a href="/propiedades.html">Propiedades</a></li>
          <li class="nav-dropdown">
            <a href="#">Servicios ▼</a>
            <ul class="dropdown-menu">
              <li><a href="/services/inmobiliaria.html">Asesoría Inmobiliaria</a></li>
              <li><a href="/services/inversiones.html">Inversiones</a></li>
            </ul>
          </li>
          <li><a href="/academy.html">Academia</a></li>
          <li><a href="/about.html">Sobre Nosotros</a></li>
          <li><a href="/contacto.html">Contacto</a></li>
          ${user ? `<li><a href="/dashboard.html">Dashboard</a></li>` : ''}
        </nav>
        
        <div class="header-actions">
          ${!user ? `<button class="btn btn-primary btn-sm" id="login-btn">Iniciar Sesión</button>` : ''}
          ${user ? `<span class="user-name">${user.name}</span>` : ''}
          <button class="hamburger" id="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  `;
}

/**
 * Initialize header
 */
function initHeader() {
  // Insert header HTML
  const headerElement = document.querySelector('header');
  if (!headerElement) {
    document.body.insertAdjacentHTML('afterbegin', getHeaderHTML());
  }
  
  // Handle sticky header on scroll
  handleStickyHeader();
  
  // Handle hamburger menu
  handleHamburgerMenu();
  
  // Handle login button
  handleLoginButton();
  
  // Handle responsive dropdown
  handleDropdownMenu();
}

/**
 * Handle sticky header on scroll
 */
function handleStickyHeader() {
  const header = document.querySelector('header');
  let lastScrollTop = 0;
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
      header.style.boxShadow = 'var(--shadow-md)';
      header.style.backdropFilter = 'blur(15px)';
    } else {
      header.style.boxShadow = 'none';
      header.style.backdropFilter = 'blur(10px)';
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  });
}

/**
 * Handle hamburger menu toggle
 */
function handleHamburgerMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking a link
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('header')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  }
}

/**
 * Handle login button
 */
function handleLoginButton() {
  const loginBtn = document.getElementById('login-btn');
  
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      showLoginModal();
    });
  }
}

/**
 * Handle dropdown menus
 */
function handleDropdownMenu() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  
  dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector('a');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    if (link && menu) {
      // Desktop hover behavior (handled by CSS)
      // Mobile click behavior
      if (window.innerWidth <= 768) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          menu.classList.toggle('active');
        });
      }
    }
  });
  
  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('active');
      });
    }
  });
}

/**
 * Show login modal
 */
function showLoginModal() {
  const modalHTML = `
    <div class="modal-backdrop active" id="login-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Iniciar Sesión</h3>
          <button class="modal-close" id="close-login">&times;</button>
        </div>
        <div class="modal-body">
          <form id="login-form">
            <div class="form-field">
              <label for="login-email">Email</label>
              <input type="email" id="login-email" name="email" required placeholder="tu@email.com">
            </div>
            <div class="form-field">
              <label for="login-password">Contraseña</label>
              <input type="password" id="login-password" name="password" required placeholder="••••••">
            </div>
            <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 1rem;">
              Demo: email: jyeskas1111@gmail.com | contraseña: admin123
            </p>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" id="cancel-login">Cancelar</button>
          <button class="btn btn-primary" id="submit-login">Iniciar Sesión</button>
        </div>
      </div>
    </div>
  `;
  
  // Remove existing modal if present
  const existingModal = document.getElementById('login-modal');
  if (existingModal) existingModal.remove();
  
  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Handle close
  document.getElementById('close-login').addEventListener('click', closeLoginModal);
  document.getElementById('cancel-login').addEventListener('click', closeLoginModal);
  
  // Handle submit
  document.getElementById('submit-login').addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    const auth = OHB_STORAGE.loginUser(email, password);
    if (auth) {
      alert('Inicio de sesión exitoso');
      closeLoginModal();
      window.location.href = '/dashboard.html';
    } else {
      alert('Email o contraseña incorrectos');
    }
  });
  
  // Handle form submission with Enter
  document.getElementById('login-form').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('submit-login').click();
    }
  });
}

/**
 * Close login modal
 */
function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.remove();
  }
}

/**
 * Update header for logged-in user
 */
function updateHeaderForUser() {
  const user = OHB_STORAGE.getCurrentUser();
  const header = document.querySelector('header');
  
  if (header) {
    const loginBtn = header.querySelector('#login-btn');
    if (loginBtn && user) {
      loginBtn.remove();
    }
    
    if (user && !header.querySelector('.user-name')) {
      const navMenu = header.querySelector('.nav-menu');
      if (navMenu) {
        const dashboardLi = document.createElement('li');
        dashboardLi.innerHTML = '<a href="/dashboard.html">Dashboard</a>';
        navMenu.appendChild(dashboardLi);
      }
    }
  }
}

/**
 * Logout current user
 */
function logoutCurrentUser() {
  OHB_STORAGE.logoutUser();
  alert('Sesión cerrada');
  window.location.href = '/';
}

// Initialize header when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeader);
} else {
  initHeader();
}
