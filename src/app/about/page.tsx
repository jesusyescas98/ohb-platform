"use client";

import Header from '@/components/Header';
import styles from './AboutPage.module.css';
import { useState, useEffect } from 'react';
import { AboutDB, type AboutContent } from '../../lib/database';

export default function AboutPage() {
  const [about, setAbout] = useState<AboutContent | null>(null);

  useEffect(() => {
    setAbout(AboutDB.get());
  }, []);

  if (!about) return null;

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Nuestra <span className="text-gradient">Identidad</span></h1>
            <p className={styles.subtitle}>En OHB no solo vendemos propiedades, diseñamos estrategias financieras para tu libertad patrimonial.</p>
          </div>
        </section>

        <section className={styles.missionVision}>
          <div className={`glass-panel ${styles.mvCard}`}>
            <h3>Nuestra Misión</h3>
            <p>{about.mission}</p>
          </div>
          <div className={`glass-panel ${styles.mvCard}`}>
            <h3>Nuestra Visión</h3>
            <p>{about.vision}</p>
          </div>
          <div className={`glass-panel ${styles.mvCard}`}>
            <h3>Nuestros Valores</h3>
            <ul style={{ listStyleType: 'none', padding: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {about.values.map((val, idx) => (
                <li key={idx}><strong>{val.title}:</strong> {val.description}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.teamSection}>
          <h2 className={styles.sectionTitle}>Conoce a tus <span className="text-gradient-silver">Consejeros</span></h2>
          <p className={styles.sectionSub}>Expertos certificados con una única meta: tu éxito financiero.</p>
          
          <div className={styles.teamGrid}>
            {about.team.map(member => (
              <div key={member.id} className={`glass-panel ${styles.teamCard}`}>
                <div className={styles.teamImageWrapper}>
                  <div className={styles.avatarPlaceholder}>
                     {member.name.charAt(0)}
                  </div>
                </div>
                <div className={styles.teamInfo}>
                  <h4>{member.name}</h4>
                  <span className={styles.role}>{member.role}</span>
                  <p className={styles.strength}><strong>Fortaleza:</strong> {member.strength}</p>
                  <button className={styles.contactBtn} onClick={() => alert(`Iniciando agendamiento con ${member.name}...`)}>
                    Agendar Cita Privada
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.sellYourHouseSection} style={{ marginTop: '4rem', padding: '3rem', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '1rem' }}>Pon tu casa en <span className="text-gradient-silver">Venta</span> con Nosotros</h2>
          <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-secondary)' }}>Añade tu propiedad a nuestro inventario premium. Tratamiento directo por la plataforma OHB.</p>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px', margin: '0 auto' }} onSubmit={(e) => { e.preventDefault(); alert("Propiedad registrada en el inventario como origen: Plataforma"); }}>
            <input type="text" placeholder="Nombre Completo" required style={{ padding: '0.8rem', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            <input type="email" placeholder="Correo Electrónico" required style={{ padding: '0.8rem', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            <input type="tel" placeholder="Teléfono" required style={{ padding: '0.8rem', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            <textarea placeholder="Descripción y detalles de la propiedad (Metros, ubicación, precio esperado)" required rows={4} style={{ padding: '0.8rem', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.05)', color: 'white', resize: 'vertical' }}></textarea>
            <input type="hidden" name="source" value="platform_direct" />
            <button type="submit" className={styles.contactBtn} style={{ marginTop: '1rem', width: '100%', border: 'none', cursor: 'pointer' }}>Registrar Propiedad</button>
          </form>
        </section>

        <section className={styles.bottomBanner} style={{ marginTop: '4rem', padding: '4rem 2rem', background: 'linear-gradient(rgba(11, 15, 25, 0.4), rgba(42, 75, 130, 0.2))', borderTop: '2px solid var(--accent-silver)', textAlign: 'center', borderRadius: '0 0 16px 16px' }}>
           <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontFamily: 'var(--font-outfit)' }}>
             <span className="text-gradient-silver">OHB</span> Asesorías
           </h2>
           <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto 2rem' }}>
             Profesionalismo, experiencia y resultados inigualables en cada negociación. Tu futuro patrimonio, en las mejores manos.
           </p>
           <button style={{ padding: '1rem 2.5rem', borderRadius: '30px', background: 'var(--accent-silver)', color: '#0B0F19', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.3s' }}>
             Contáctanos Ahora
           </button>
        </section>
      </main>
    </>
  );
}
