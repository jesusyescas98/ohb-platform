"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './Dashboard.module.css';
import { useAuth } from '../../context/AuthContext';
import RouteGuard from '../../components/RouteGuard';

const navSections = [
  {
    label: 'PRINCIPAL',
    items: [
      { 
        href: '/dashboard', 
        label: 'Inicio', 
        sublabel: 'Analítica y resumen', 
        icon: '📊',
        badge: null
      },
    ]
  },
  {
    label: 'GESTIÓN COMERCIAL',
    items: [
      { 
        href: '/dashboard/leads', 
        label: 'Pipeline de Leads', 
        sublabel: 'Embudo de ventas', 
        icon: '🎯',
        badge: '3'
      },
      { 
        href: '/dashboard/properties', 
        label: 'Propiedades', 
        sublabel: 'Inventario inmobiliario', 
        icon: '🏠',
        badge: null
      },
      { 
        href: '/dashboard/contacts', 
        label: 'Contactos', 
        sublabel: 'Clientes y prospectos', 
        icon: '👥',
        badge: null
      },
    ]
  },
  {
    label: 'HERRAMIENTAS',
    items: [
      { 
        href: '/dashboard/keys', 
        label: 'Control de Llaves', 
        sublabel: 'Préstamos y devoluciones', 
        icon: '🔑',
        badge: '3'
      },
      { 
        href: '/dashboard/ai-chat', 
        label: 'Asistente AVA', 
        sublabel: 'IA Copilot para asesores', 
        icon: '🧠',
        badge: null
      },
    ]
  }
];

// Flatten all items for simple iteration when needed
const allNavItems = navSections.flatMap(section => section.items);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, email, role, fullName } = useAuth();
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  // Get the current page label for breadcrumbs
  const currentNavItem = allNavItems.find(item => item.href === pathname);
  const currentPageLabel = currentNavItem?.label || 'Panel';

  return (
    <RouteGuard allowedRoles={['admin', 'asesor']}>
      <div className={styles.dashboardContainer}>
        <aside 
          className={`glass-panel ${styles.sidebar}`} 
          style={{ 
            width: isSidebarCollapsed ? '72px' : undefined,
          }}
        >
          {/* Logo */}
          <div className={styles.logo} style={{ justifyContent: isSidebarCollapsed ? 'center' : undefined }}>
            {isSidebarCollapsed ? (
              <span className="text-gradient-silver" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>O</span>
            ) : (
              <><span className="text-gradient-silver">OHB</span> CRM</>
            )}
          </div>
          
          {/* Collapse toggle */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{ 
              background: 'rgba(255,255,255,0.04)', 
              border: '1px solid var(--glass-border)', 
              color: 'var(--text-secondary)', 
              cursor: 'pointer', 
              padding: '0.45rem', 
              fontSize: '0.85rem', 
              width: '100%',
              textAlign: 'center', 
              marginBottom: '0.8rem',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            title={isSidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {isSidebarCollapsed ? '»' : '«'}
          </button>

          {/* AI Status */}
          <div className={styles.aiStatus}>
            <div className={styles.aiPulse}></div>
            {!isSidebarCollapsed && <span>IA Predictiva: Activa</span>}
          </div>

          {/* User Info Card */}
          {!isSidebarCollapsed && (
            <div style={{ 
              padding: '0.8rem', 
              margin: '0 0 0.8rem 0', 
              background: 'linear-gradient(135deg, rgba(42, 75, 130, 0.15) 0%, rgba(192, 198, 204, 0.05) 100%)', 
              borderRadius: '10px', 
              border: '1px solid var(--glass-border)',
              fontSize: '0.8rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ 
                  width: '34px', height: '34px', borderRadius: '10px', 
                  background: 'linear-gradient(135deg, var(--accent-silver) 0%, rgba(255,255,255,0.4) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#0B0F19', fontWeight: 'bold', fontSize: '0.75rem',
                  flexShrink: 0
                }}>
                  {fullName ? fullName.charAt(0).toUpperCase() : '?'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.82rem' }}>
                    {fullName || email || 'Usuario'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {role === 'admin' ? '🛡️ Administrador' : '📋 Asesor'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Sections */}
          <nav className={styles.nav}>
            {navSections.map((section, sectionIdx) => (
              <div key={sectionIdx} className={styles.navSection}>
                {!isSidebarCollapsed && (
                  <div className={styles.navSectionLabel}>{section.label}</div>
                )}
                {section.items.map(item => (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className={pathname === item.href ? styles.active : ''}
                    title={item.label}
                    style={isSidebarCollapsed ? { justifyContent: 'center', padding: '0.7rem 0' } : {}}
                  >
                    {isSidebarCollapsed ? (
                      <div style={{ position: 'relative' }}>
                        <span className={styles.navIcon}>{item.icon}</span>
                        {item.badge && (
                          <span style={{
                            position: 'absolute', top: '-4px', right: '-6px',
                            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                            color: '#fff', fontSize: '0.55rem', fontWeight: '700',
                            padding: '0.1rem 0.3rem', borderRadius: '6px', minWidth: '14px', textAlign: 'center'
                          }}>{item.badge}</span>
                        )}
                      </div>
                    ) : (
                      <>
                        <span className={styles.navIcon}>{item.icon}</span>
                        <span className={styles.navLabel}>
                          <span className={styles.navLabelMain}>{item.label}</span>
                          <span className={styles.navLabelSub}>{item.sublabel}</span>
                        </span>
                        {item.badge && (
                          <span className={styles.navBadge}>{item.badge}</span>
                        )}
                      </>
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          {/* Security indicator */}
          {!isSidebarCollapsed && (
            <div style={{ 
              margin: '0.5rem 0', 
              padding: '0.5rem 0.8rem', 
              fontSize: '0.68rem', 
              color: '#4ade80', 
              borderTop: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              🔒 Sesión encriptada
            </div>
          )}
          
          {/* Bottom Actions */}
          <div className={styles.logoutWrapper}>
            <Link href="/" style={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              gap: '0.5rem',
              padding: '0.55rem 0.8rem', 
              color: 'var(--text-secondary)', 
              fontSize: '0.82rem',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              background: 'rgba(255,255,255,0.02)'
            }}>
              {isSidebarCollapsed ? '🏠' : <><span>🏠</span> Ir al Sitio Web</>}
            </Link>
            <button 
              onClick={handleLogout} 
              className={styles.logoutBtn} 
              style={{ 
                background: 'rgba(239, 68, 68, 0.08)', 
                border: '1px solid rgba(239, 68, 68, 0.15)', 
                cursor: 'pointer', 
                color: '#f87171', 
                textDecoration: 'none',
                borderRadius: '8px',
                padding: '0.55rem 0.8rem',
                width: '100%',
                transition: 'all 0.2s ease',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                gap: '0.5rem'
              }}
            >
              {isSidebarCollapsed ? '🚪' : <><span>🚪</span> Cerrar Sesión</>}
            </button>
          </div>
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
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            zIndex: 10000 
          }}>
            <div className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
              <h3 style={{ marginBottom: '0.5rem' }}>¿Cerrar sesión?</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Tu sesión se cerrará de forma segura. Los tokens de acceso serán eliminados.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmLogout}
                  style={{ flex: 1, padding: '0.8rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Sí, Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
