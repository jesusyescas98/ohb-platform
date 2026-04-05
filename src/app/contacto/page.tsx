'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import { savePublicLead } from '../../lib/leadBridge';
import { OHB_WHATSAPP, OHB_WHATSAPP_DISPLAY, OHB_DOMAIN } from '../../lib/types';
import styles from './contacto.module.css';

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    interestType: 'compra' as 'compra' | 'venta' | 'renta' | 'inversion',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePublicLead({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      message: formData.message,
      source: 'formulario',
      interestType: formData.interestType,
    });
    setSubmitted(true);
    setFormData({ name: '', phone: '', email: '', message: '', interestType: 'compra' });
    setTimeout(() => setSubmitted(false), 10000);
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'OHB Asesorías y Consultorías',
    url: OHB_DOMAIN,
    telephone: `+${OHB_WHATSAPP}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Tomás Fernández #7818, local 19',
      addressLocality: 'Ciudad Juárez',
      addressRegion: 'Chihuahua',
      postalCode: '32460',
      addressCountry: 'MX',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 31.690363,
      longitude: -106.424547,
    },
    openingHours: ['Mo-Fr 09:00-18:00', 'Sa 09:00-14:00'],
  };

  return (
    <div className={styles.page}>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs}>
          <Link href="/">Inicio</Link>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>Contacto</span>
        </nav>

        <div className={styles.header}>
          <span className="section-label">📧 Contacto</span>
          <h1>Estamos para <span className="text-gradient">Ayudarte</span></h1>
          <p className={styles.headerSub}>
            ¿Tienes preguntas sobre compra, venta o inversión inmobiliaria?
            Nuestro equipo de asesores está listo para atenderte.
          </p>
        </div>

        <div className={styles.layout}>
          {/* Contact Form */}
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Envíanos un mensaje</h2>

            {submitted ? (
              <div className={styles.successMsg}>
                ✅ ¡Mensaje enviado! Un asesor se comunicará contigo pronto.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nombre completo *</label>
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Teléfono *</label>
                    <input
                      type="tel"
                      placeholder="Tu teléfono"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className={styles.input}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email *</label>
                    <input
                      type="email"
                      placeholder="Tu email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tipo de interés</label>
                    <select
                      value={formData.interestType}
                      onChange={e => setFormData({ ...formData, interestType: e.target.value as typeof formData.interestType })}
                      className={`${styles.input} ${styles.select}`}
                    >
                      <option value="compra">Compra de propiedad</option>
                      <option value="venta">Venta de propiedad</option>
                      <option value="renta">Renta</option>
                      <option value="inversion">Inversión inmobiliaria</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Mensaje</label>
                  <textarea
                    placeholder="Cuéntanos cómo podemos ayudarte..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className={styles.textarea}
                    rows={5}
                  />
                </div>

                <button type="submit" className={styles.submitBtn}>
                  📩 Enviar Mensaje
                </button>
              </form>
            )}
          </div>

          {/* Contact Info Sidebar */}
          <div className={styles.infoSidebar}>
            {/* Contact details */}
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Información de Contacto</h3>

              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📱</span>
                <div>
                  <strong>Teléfono / WhatsApp</strong>
                  <p>
                    <a href={`https://wa.me/${OHB_WHATSAPP}`} target="_blank" rel="noopener noreferrer">
                      {OHB_WHATSAPP_DISPLAY}
                    </a>
                  </p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📧</span>
                <div>
                  <strong>Email</strong>
                  <p>contacto@ohbasesoriasyconsultorias.com</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📍</span>
                <div>
                  <strong>Dirección</strong>
                  <p>Tomás Fernández #7818, local 19<br />Col. Buscari, 32460<br />Ciudad Juárez, Chihuahua</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🕐</span>
                <div>
                  <strong>Horario de Atención</strong>
                  <p>Lunes a Viernes: 9:00 - 18:00<br />Sábado: 9:00 - 14:00</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Síguenos</h3>
              <div className={styles.socialLinks}>
                <a
                  href="https://www.facebook.com/OHBinmobiliaria"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  <span>📘</span> Facebook
                </a>
                <a
                  href="https://www.instagram.com/ohb_inmobiliaria23/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  <span>📸</span> Instagram
                </a>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${OHB_WHATSAPP}?text=${encodeURIComponent('Hola, me interesa recibir asesoría inmobiliaria.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappCta}
            >
              💬 Escríbenos por WhatsApp
            </a>
          </div>
        </div>

        {/* Google Map */}
        <div className={styles.mapSection}>
          <h2 className={styles.mapTitle}>📍 Encuéntranos</h2>
          <div className={styles.mapWrapper}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3393!2d-106.424547!3d31.690363!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2smx"
              width="100%"
              height="400"
              style={{ border: 0, display: 'block' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
