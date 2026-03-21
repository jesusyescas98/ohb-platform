"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'ohb_cookie_consent';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  consentDate: string;
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user already gave consent
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        // Small delay for a smooth entrance
        const timer = setTimeout(() => {
          setIsVisible(true);
          setTimeout(() => setIsAnimating(true), 50);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // If localStorage is not available, don't show the banner
    }
  }, []);

  const saveConsent = (preferences: CookiePreferences) => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
    } catch {
      // Silent fail
    }
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  const acceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      consentDate: new Date().toISOString(),
    });
  };

  const acceptSelected = () => {
    saveConsent({
      essential: true,
      analytics: analyticsEnabled,
      consentDate: new Date().toISOString(),
    });
  };

  const rejectOptional = () => {
    saveConsent({
      essential: true,
      analytics: false,
      consentDate: new Date().toISOString(),
    });
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '0 1rem 1rem',
        transition: 'all 0.3s ease',
        transform: isAnimating ? 'translateY(0)' : 'translateY(100%)',
        opacity: isAnimating ? 1 : 0,
      }}
    >
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '1.5rem',
          borderRadius: '16px',
          background: 'rgba(11, 15, 25, 0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Main content */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>🍪</span>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem',
              fontFamily: 'var(--font-outfit)',
            }}>
              Tu Privacidad es Importante
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '0.8rem' }}>
              Utilizamos cookies esenciales para el funcionamiento de la plataforma y cookies analíticas
              opcionales para mejorar tu experiencia. No utilizamos cookies de publicidad ni compartimos
              tus datos con terceros.{' '}
              <Link href="/privacy" style={{ color: 'var(--accent-silver)', textDecoration: 'underline' }}>
                Aviso de Privacidad
              </Link>
            </p>

            {/* Details section */}
            {showDetails && (
              <div style={{
                padding: '1rem', borderRadius: '10px', marginBottom: '1rem',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                {/* Essential cookies */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                      🔒 Cookies Esenciales
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Sesión de usuario, preferencias, seguridad. Siempre activas.
                    </p>
                  </div>
                  <div style={{
                    padding: '0.2rem 0.6rem', borderRadius: '12px',
                    background: 'rgba(74, 222, 128, 0.15)', 
                    fontSize: '0.7rem', color: '#4ade80', fontWeight: 'bold',
                  }}>
                    Requeridas
                  </div>
                </div>

                {/* Analytics cookies */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                      📊 Cookies Analíticas
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Estadísticas de uso anonimizadas para mejorar la plataforma.
                    </p>
                  </div>
                  <label style={{
                    position: 'relative', display: 'inline-block',
                    width: '44px', height: '24px', cursor: 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={() => setAnalyticsEnabled(!analyticsEnabled)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: analyticsEnabled ? 'var(--accent-silver)' : 'rgba(255,255,255,0.15)',
                      borderRadius: '24px', transition: 'background 0.3s',
                    }}>
                      <span style={{
                        position: 'absolute', top: '3px',
                        left: analyticsEnabled ? '23px' : '3px',
                        width: '18px', height: '18px', borderRadius: '50%',
                        background: analyticsEnabled ? '#0B0F19' : '#888',
                        transition: 'left 0.3s',
                      }} />
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={acceptAll}
                style={{
                  padding: '0.6rem 1.2rem', borderRadius: '8px',
                  background: 'var(--accent-silver)', color: '#0B0F19',
                  border: 'none', cursor: 'pointer', fontWeight: 'bold',
                  fontSize: '0.85rem', transition: 'all 0.2s',
                }}
              >
                Aceptar Todas
              </button>

              {showDetails ? (
                <button
                  onClick={acceptSelected}
                  style={{
                    padding: '0.6rem 1.2rem', borderRadius: '8px',
                    background: 'transparent', color: 'var(--text-primary)',
                    border: '1px solid var(--glass-border)', cursor: 'pointer',
                    fontSize: '0.85rem', transition: 'all 0.2s',
                  }}
                >
                  Guardar Preferencias
                </button>
              ) : (
                <button
                  onClick={() => setShowDetails(true)}
                  style={{
                    padding: '0.6rem 1.2rem', borderRadius: '8px',
                    background: 'transparent', color: 'var(--text-primary)',
                    border: '1px solid var(--glass-border)', cursor: 'pointer',
                    fontSize: '0.85rem', transition: 'all 0.2s',
                  }}
                >
                  Personalizar
                </button>
              )}

              <button
                onClick={rejectOptional}
                style={{
                  padding: '0.6rem 1.2rem', borderRadius: '8px',
                  background: 'transparent', color: 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer',
                  fontSize: '0.8rem', textDecoration: 'underline',
                  transition: 'all 0.2s',
                }}
              >
                Solo Esenciales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
