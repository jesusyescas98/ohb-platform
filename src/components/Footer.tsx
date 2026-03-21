"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.logoText}>
            <span className="text-gradient-silver">OHB</span> Asesorías
          </div>
          <p className={styles.description}>
            Estrategias financieras e inmobiliarias para tu libertad patrimonial.
          </p>
          {/* Newsletter */}
          <div style={{ marginTop: '1rem' }}>
            <h5 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>📧 Boletín Informativo</h5>
            {subscribed ? (
              <div style={{ padding: '0.6rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '8px', border: '1px solid rgba(74, 222, 128, 0.2)', fontSize: '0.8rem', color: '#4ade80' }}>
                ✅ ¡Suscripción exitosa! Recibirás nuestro boletín.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="email" 
                  placeholder="tu-email@ejemplo.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ 
                    flex: 1, padding: '0.5rem 0.8rem', borderRadius: '6px', 
                    border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', 
                    color: '#fff', fontSize: '0.8rem', outline: 'none' 
                  }}
                />
                <button type="submit" style={{ 
                  padding: '0.5rem 1rem', background: 'var(--accent-silver)', color: '#0B0F19', 
                  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
                  fontSize: '0.8rem', transition: 'all 0.3s'
                }}>
                  Suscribir
                </button>
              </form>
            )}
          </div>
        </div>
        
        <div className={styles.contactInfo}>
          <h4>Contacto y Ubicación</h4>
          <p>📍 Tomás Fernández #7818 local 19,</p>
          <p>32460 Juárez, Chihuahua, Mexico</p>
          <p style={{ marginTop: '0.5rem' }}>📞 +52 656 123 4567</p>
          <p>✉️ contacto@ohb.com</p>
          <div style={{ marginTop: '0.8rem' }}>
            <h5 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>🕐 Horario de Atención</h5>
            <p style={{ fontSize: '0.8rem' }}>Lun - Vie: 9:00 AM - 7:00 PM</p>
            <p style={{ fontSize: '0.8rem' }}>Sáb: 10:00 AM - 2:00 PM</p>
          </div>
          <div className={styles.mapContainer}>
             <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3393.1818296366057!2d-106.4025176848243!3d31.73809228129758!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86e75d7b5f252cfb%3A0x6b405f6e811c7fa1!2sTom%C3%A1s%20Fern%C3%A1ndez%207818%2C%20Buscari%2C%2032460%20Ju%C3%A1rez%2C%20Chih.!5e0!3m2!1sen!2smx!4v1689264426543!5m2!1sen!2smx" 
                width="100%" 
                height="150" 
                style={{ border: 0, borderRadius: '8px', marginTop: '0.5rem' }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade">
             </iframe>
          </div>
        </div>
        
        <div className={styles.links}>
          <h4>Navegación</h4>
          <Link href="/">🏠 Inicio</Link>
          <Link href="/about">👥 Nosotros</Link>
          <Link href="/portfolio">🏢 Inventario</Link>
          <Link href="/academy">🎓 Academia OHB</Link>
          <Link href="/#calculadora">🧮 Calculadora</Link>
          <Link href="/services/real-estate">🏡 Compra-Venta</Link>
          <Link href="/services/investments">💰 Inversiones</Link>
        </div>

        {/* Additional Column - Security & Legal */}
        <div className={styles.links}>
          <h4>Seguridad</h4>
          <Link href="/terms">📋 Términos y Condiciones</Link>
          <Link href="/privacy">🔒 Aviso de Privacidad</Link>
          <div style={{ marginTop: '1rem', padding: '0.6rem', background: 'rgba(74, 222, 128, 0.05)', borderRadius: '6px', border: '1px solid rgba(74, 222, 128, 0.15)', fontSize: '0.7rem' }}>
            <div style={{ color: '#4ade80', fontWeight: 'bold', marginBottom: '0.3rem' }}>🛡️ Plataforma Segura</div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              • Datos encriptados<br />
              • Tokens de sesión<br />
              • Protección XSS<br />
              • Rate limiting activo
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.bottomBar}>
        <div className={styles.socialLogos}>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" title="Facebook" style={{ transition: 'transform 0.2s' }}>
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/>
             </svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" title="Instagram" style={{ transition: 'transform 0.2s' }}>
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.125A3.125 3.125 0 1 1 12 8.875a3.125 3.125 0 0 1 0 6.25zm5.802-8.327a1.24 1.24 0 1 1-2.48 0 1.24 1.24 0 0 1 2.48 0z"/>
             </svg>
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer" title="TikTok" style={{ transition: 'transform 0.2s' }}>
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12.53.02C13.84 0 15.14.01 15.44.02c.03 1.15.18 2.3.46 3.42.4.16 1.63.63 2.98.78.2.02.41.04.62.06v3.25c-.21-.01-.42-.01-.63-.03-1.39-.14-2.73-.62-3.83-1.38-.02.45-.03.9-.03 1.35 0 3.7-1.92 7.03-5.26 8.52-3.34 1.48-7.3 1.09-10.22-1.02-2.92-2.11-4.22-5.74-3.36-9.35.86-3.6 3.65-6.38 7.23-7.21v3.31c-1.89.5-3.35 2.01-3.77 3.9-.42 1.89.17 3.86 1.51 5.09 1.34 1.24 3.29 1.55 4.96.79 1.66-.75 2.76-2.43 2.76-4.28V0h3.69z"/>
             </svg>
          </a>
          <a href="https://wa.me/526561234567" target="_blank" rel="noreferrer" title="WhatsApp" style={{ transition: 'transform 0.2s' }}>
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
             </svg>
          </a>
        </div>
        <div className={styles.terms}>
           <Link href="/terms">Términos y Condiciones Generales</Link>
           <span>|</span>
           <Link href="/privacy">Aviso de Privacidad</Link>
           <span>|</span>
           <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>🔒 Sitio Seguro</span>
        </div>
        <p className={styles.copyright}>&copy; {currentYear} OHB Asesorías y Consultorías. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
