"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import styles from '../app/page.module.css';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSessionInfo, setShowSessionInfo] = useState(false);
  const { isLoggedIn, role, fullName, email, logout } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, []);

  // Control body overflow cuando menú está abierto
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  const headerStyle = {
    ...(isScrolled ? {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--glass-border)',
      boxShadow: '0 2px 16px rgba(0,0,0,0.06)'
    } : {}),
    transition: 'all 0.3s ease'
  };

  return (
    <>
      <header className={styles.header} style={headerStyle}>
        <Link href="/" className={styles.logoContainer}>
          <Image src="/logo-ohb.png" alt="OHB Logo" width={40} height={40} className={styles.brandLogo} />
          <div className={styles.logoText}>
            <span className="text-gradient-silver">OHB</span> Asesorías
          </div>
        </Link>

        {/* Mobile Menu Toggle — visibility controlled by CSS */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className={styles.mobileToggle}
          aria-label={isMobileOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMobileOpen ? '✕' : '☰'}
        </button>

        <nav className={styles.nav} style={isMobileOpen ? { display: 'flex' } : {}}>
          <Link href="/" onClick={() => setIsMobileOpen(false)}>Inicio</Link>
          <div
            className={styles.dropdownContainer}
            onMouseEnter={() => setIsServicesOpen(true)}
            onMouseLeave={() => setIsServicesOpen(false)}
            style={{ position: 'relative', display: 'inline-block' }}
          >
            <span style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Servicios ▼</span>
            {isServicesOpen && (
              <div className="glass-panel" style={{ position: 'absolute', top: '100%', left: 0, padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '180px', zIndex: 100, background: 'var(--bg-surface)', boxShadow: 'var(--shadow-md)' }}>
                <Link href="/services/real-estate" onClick={() => setIsMobileOpen(false)}>🏡 Compra-Venta</Link>
                <Link href="/services/investments" onClick={() => setIsMobileOpen(false)}>💰 Inversiones</Link>
              </div>
            )}
          </div>
          <a href="/#calculadora" onClick={() => setIsMobileOpen(false)}>Herramientas</a>
          <Link href="/propiedades" onClick={() => setIsMobileOpen(false)}>Propiedades</Link>
          <Link href="/academy" onClick={() => setIsMobileOpen(false)}>Academia OHB</Link>
          <Link href="/about" onClick={() => setIsMobileOpen(false)}>Nosotros</Link>
          <Link href="/contacto" onClick={() => setIsMobileOpen(false)}>Contacto</Link>

          {isMounted && isLoggedIn ? (
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                  padding: '0.3rem 0.8rem', borderRadius: '20px', background: 'var(--accent-blue-subtle, rgba(27,58,107,0.06))',
                  border: '1px solid var(--glass-border)', position: 'relative'
                }}
                onClick={() => setShowSessionInfo(!showSessionInfo)}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-blue-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFFFFF', fontWeight: 'bold', fontSize: '0.7rem'
                }}>
                  {fullName ? fullName.charAt(0).toUpperCase() : email?.charAt(0).toUpperCase() || '?'}
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {fullName || email?.split('@')[0] || 'Usuario'}
                </span>

                {showSessionInfo && (
                  <div
                    className="glass-panel"
                    style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                      padding: '1rem', minWidth: '220px', zIndex: 200,
                      display: 'flex', flexDirection: 'column', gap: '0.5rem',
                      background: 'var(--bg-surface)', boxShadow: 'var(--shadow-lg)'
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      📧 {email}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      {role === 'admin' ? '🛡️ Admin' : role === 'asesor' ? '📋 Asesor' : '👤 Cliente'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      🔒 Sesión activa y segura
                    </div>
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.5rem', marginTop: '0.3rem' }}>
                      <button
                        onClick={() => logout()}
                        style={{
                          width: '100%', padding: '0.5rem', background: 'rgba(239,68,68,0.06)',
                          border: '1px solid rgba(239,68,68,0.15)', color: '#EF4444',
                          borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem'
                        }}
                      >
                        🚪 Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {(role === 'admin' || role === 'asesor') && (
                <Link href="/dashboard" className={styles.navCta} onClick={() => setIsMobileOpen(false)}>
                  📊 Panel de Control
                </Link>
              )}
            </div>
          ) : (
            isMounted && (
              <button onClick={() => { setIsLoginOpen(true); setIsMobileOpen(false); }} className={styles.navCta}>
                🔑 Ingresos / Registro
              </button>
            )
          )}
        </nav>
      </header>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {showSessionInfo && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}
          onClick={() => setShowSessionInfo(false)}
        />
      )}
    </>
  );
}
