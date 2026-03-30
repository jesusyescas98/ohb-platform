"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import styles from './Dashboard.module.css';
import { useAuth } from '../../context/AuthContext';
import RouteGuard from '../../components/RouteGuard';

const navSections = [
  {
    label: 'PRINCIPAL',
    items: [
      { href: '/dashboard', label: 'Inicio', sublabel: 'Analítica y resumen', icon: '📊', badge: null },
    ]
  },
  {
    label: 'GESTIÓN COMERCIAL',
    items: [
      { href: '/dashboard/leads', label: 'Pipeline CRM', sublabel: 'Embudo inmobiliario', icon: '🎯', badge: null },
      { href: '/dashboard/properties', label: 'Propiedades', sublabel: 'Inventario + imágenes', icon: '🏠', badge: null },
      { href: '/dashboard/contacts', label: 'Contactos', sublabel: 'Clientes y prospectos', icon: '👥', badge: null },
      { href: '/dashboard/calendar', label: 'Calendario', sublabel: 'Citas y agenda', icon: '📅', badge: null },
    ]
  },
  {
    label: 'CONTENIDO',
    items: [
      { href: '/dashboard/academy', label: 'Academia CMS', sublabel: 'Artículos, cursos, infografías', icon: '🎓', badge: null },
      { href: '/dashboard/about-editor', label: 'Editor Nosotros', sublabel: 'Misión, visión, equipo', icon: '✏️', badge: null },
    ]
  },
  {
    label: 'HERRAMIENTAS',
    items: [
      { href: '/dashboard/files', label: 'Archivos', sublabel: 'Documentos compartidos', icon: '📁', badge: null },
      { href: '/dashboard/reports', label: 'Reportes', sublabel: 'Semanal de actividades', icon: '📋', badge: null },
      { href: '/dashboard/keys', label: 'Control de Llaves', sublabel: 'Préstamos y devoluciones', icon: '🔑', badge: null },
      { href: '/dashboard/ai-chat', label: 'Asistente AVA', sublabel: 'IA Copilot para asesores', icon: '🧠', badge: null },
    ]
  },
  {
    label: 'EQUIPO',
    items: [
      { href: '/dashboard/asesores', label: 'Asesores', sublabel: 'Control de KPIs', icon: '👔', badge: null },
      { href: '/dashboard/usuarios', label: 'Usuarios', sublabel: 'Roles y permisos', icon: '👤', badge: null },
    ]
  }
];

const allNavItems = navSections.flatMap(section => section.items);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout, email, role, fullName, isAdmin } = useAuth();
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const shortcuts: Record<string, string> = {
          'l': '/dashboard/leads', 'p': '/dashboard/properties',
          'k': '/dashboard/calendar', 'r': '/dashboard/reports',
        };
        if (shortcuts[e.key]) {
          e.preventDefault();
          window.location.href = shortcuts[e.key];
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const currentNavItem = allNavItems.find(item => item.href === pathname);
  const currentPageLabel = currentNavItem?.label || 'Panel';

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={styles.logo} style={{ justifyContent: isSidebarCollapsed && !isMobile ? 'center' : undefined }}>
        {isSidebarCollapsed && !isMobile ? (
          <span className="text-gradient-silver" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>O</span>
        ) : (
          <><span className="text-gradient-silver">OHB</span> CRM</>
        )}
      </div>
      
      {/* Collapse toggle (desktop only) */}
      {!isMobile && (
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={styles.collapseBtn}
          title={isSidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {isSidebarCollapsed ? '»' : '«'}
        </button>
      )}

      {/* AI Status */}
      <div className={styles.aiStatus}>
        <div className={styles.aiPulse}></div>
        {(!isSidebarCollapsed || isMobile) && <span>IA Predictiva: Activa</span>}
      </div>

      {/* User Info Card */}
      {(!isSidebarCollapsed || isMobile) && (
        <div className={styles.userCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className={styles.userAvatar}>
              {fullName ? fullName.charAt(0).toUpperCase() : '?'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div className={styles.userName}>{fullName || email || 'Usuario'}</div>
              <div className={styles.userRole}>
                {role === 'admin' ? '🛡️ Administrador' : '📋 Asesor'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={styles.nav}>
        {navSections.map((section, sectionIdx) => {
          // Filter admin-only items
          const filteredItems = section.items.filter(item => {
            if ((item.href === '/dashboard/about-editor' || item.href === '/dashboard/asesores' || item.href === '/dashboard/usuarios') && !isAdmin) return false;
            return true;
          });
          if (filteredItems.length === 0) return null;
          
          return (
            <div key={sectionIdx} className={styles.navSection}>
              {(!isSidebarCollapsed || isMobile) && (
                <div className={styles.navSectionLabel}>{section.label}</div>
              )}
              {filteredItems.map(item => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={pathname === item.href ? styles.active : ''}
                  title={item.label}
                  style={isSidebarCollapsed && !isMobile ? { justifyContent: 'center', padding: '0.7rem 0' } : {}}
                >
                  {isSidebarCollapsed && !isMobile ? (
                    <span className={styles.navIcon}>{item.icon}</span>
                  ) : (
                    <>
                      <span className={styles.navIcon}>{item.icon}</span>
                      <span className={styles.navLabel}>
                        <span className={styles.navLabelMain}>{item.label}</span>
                        <span className={styles.navLabelSub}>{item.sublabel}</span>
                      </span>
                      {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
                    </>
                  )}
                </Link>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Keyboard shortcuts hint */}
      {!isSidebarCollapsed && !isMobile && (
        <div className={styles.shortcutsHint}>
          ⌨️ Ctrl+L Leads • Ctrl+P Propiedades
        </div>
      )}

      {/* Bottom Actions */}
      <div className={styles.logoutWrapper}>
        <Link href="/" className={styles.bottomLink}>
          {isSidebarCollapsed && !isMobile ? '🏠' : <><span>🏠</span> Ir al Sitio Web</>}
        </Link>
        <button 
          onClick={() => setShowLogoutConfirm(true)} 
          className={styles.logoutBtn}
        >
          {isSidebarCollapsed && !isMobile ? '🚪' : <><span>🚪</span> Cerrar Sesión</>}
        </button>
      </div>
    </>
  );

  return (
    <RouteGuard allowedRoles={['admin', 'asesor']}>
      <div className={styles.dashboardContainer}>
        {/* Mobile hamburger */}
        {isMobile && (
          <button 
            className={styles.mobileHamburger}
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            aria-label="Toggle menu"
          >
            {isMobileSidebarOpen ? '✕' : '☰'}
          </button>
        )}

        {/* Mobile overlay */}
        {isMobile && isMobileSidebarOpen && (
          <div 
            className={styles.mobileOverlay} 
            onClick={() => setIsMobileSidebarOpen(false)} 
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`glass-panel ${styles.sidebar} ${isMobile && isMobileSidebarOpen ? styles.sidebarMobileOpen : ''} ${isMobile && !isMobileSidebarOpen ? styles.sidebarMobileHidden : ''}`}
          style={!isMobile ? { width: isSidebarCollapsed ? '72px' : undefined } : {}}
        >
          {sidebarContent}
        </aside>

        <main className={styles.mainContent}>
          {/* Breadcrumbs */}
          {pathname !== '/dashboard' && (
            <div className={styles.breadcrumbs}>
              <Link href="/dashboard">🏠 Panel</Link>
              <span className={styles.breadcrumbSep}>›</span>
              <span className={styles.breadcrumbCurrent}>{currentPageLabel}</span>
            </div>
          )}
          {children}
        </main>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className={styles.modalOverlay}>
            <div className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
              <h3 style={{ marginBottom: '0.5rem' }}>¿Cerrar sesión?</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Tu sesión se cerrará de forma segura.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className={styles.modalCancelBtn}
                >Cancelar</button>
                <button 
                  onClick={() => { setShowLogoutConfirm(false); logout(); }}
                  className={styles.modalConfirmBtn}
                >Sí, Cerrar Sesión</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
