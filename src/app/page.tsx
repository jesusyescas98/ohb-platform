'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import MortgageCalculator from "../components/MortgageCalculator";
import InvestmentCalculator from "../components/InvestmentCalculator";
import EducationSection from "../components/EducationSection";
import PropertyCard from "../components/properties/PropertyCard";
import Header from "../components/Header";
import { DEMO_PROPERTIES, DEMO_TESTIMONIALS, getWhatsAppLink } from "../lib/propertyData";
import { savePublicLead } from "../lib/leadBridge";
import styles from "./page.module.css";

function CtaNewsletter() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    savePublicLead({ email, source: 'newsletter' });
    setSent(true);
    setEmail('');
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <section className={styles.ctaSection}>
      <div className={styles.ctaInner}>
        <span className="section-label" style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}>🚀 Da el Primer Paso</span>
        <h2 className={styles.ctaTitle}>
          ¿Listo para Invertir?
        </h2>
        <p className={styles.ctaSub}>
          Agenda una asesoría gratuita con uno de nuestros expertos.
          Sin compromiso, sin costo.
        </p>
        <div className={styles.ctaActions}>
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
            style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}
          >
            💬 Agendar por WhatsApp
          </a>
          <Link
            href="/propiedades"
            className="btn btn-secondary"
            style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '30px', color: '#FFFFFF' }}
          >
            🏠 Ver Propiedades
          </Link>
        </div>
        {/* Newsletter inline */}
        {sent ? (
          <p className={styles.newsletterSuccess}>✅ ¡Suscrito! Recibirás las mejores ofertas.</p>
        ) : (
          <form onSubmit={handleNewsletterSubmit} className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="Tu email para recibir ofertas"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={styles.newsletterInput}
              required
            />
            <button type="submit" className={styles.newsletterBtn}>
              Suscribirse
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [count, setCount] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const numericTarget = parseInt(target.replace(/[^0-9]/g, ''));
    const prefix = target.replace(/[0-9,+]/g, '');
    const duration = 2000;
    const steps = 60;
    const increment = numericTarget / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), numericTarget);
      setCount(prefix + current.toLocaleString('es-MX'));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  return <div ref={ref}>{count}{suffix}</div>;
}

export default function Home() {
  const featuredProperties = DEMO_PROPERTIES.filter(p => p.featured && p.status === 'activa').slice(0, 6);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % DEMO_TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.container} itemScope itemType="https://schema.org/WebPage">
      <Header />

      <main className={styles.main} role="main">
        {/* ===== HERO ===== */}
        <section className={styles.hero} aria-label="Presentación principal">
          <div className={styles.heroContent}>
            <span className="section-label">🏆 #1 Consultora Inmobiliaria en Cd. Juárez</span>
            <h1 className={styles.heroTitle}>
              Tu Próxima <span className="text-gradient">Inversión</span><br />
              Comienza <span className="text-gradient-gold">Aquí</span>.
            </h1>
            <p className={styles.heroSubtitle}>
              Somos OHB Asesorías y Consultorías — tu aliado estratégico en bienes raíces, 
              inversiones y desarrollo patrimonial en Ciudad Juárez.
            </p>
            <div className={styles.heroActions}>
              <Link href="/propiedades" className={`${styles.btn} ${styles.btnPrimary}`}>
                🏢 Explorar Propiedades
              </Link>
              <a href="/#calculadora" className={`${styles.btn} ${styles.btnSecondary}`}>
                🧮 Calculadoras
              </a>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.btn} ${styles.btnWhatsapp}`}
              >
                💬 WhatsApp
              </a>
            </div>
            <div className={styles.trustBadges}>
              <span>🔒 Plataforma Segura</span>
              <span>🤖 Potenciado por IA</span>
              <span>📊 Análisis Predictivo</span>
              <span>⭐ 4.9/5 Valoración</span>
            </div>
          </div>

          <div className={styles.heroStats}>
            <div className={`glass-panel ${styles.statCard}`}>
              <h3><AnimatedCounter target="15" suffix="+" /></h3>
              <p>Años de Experiencia</p>
            </div>
            <div className={`glass-panel ${styles.statCard}`}>
              <h3><AnimatedCounter target="$500M" suffix="+" /></h3>
              <p>Inversiones Gestionadas</p>
            </div>
            <div className={`glass-panel ${styles.statCard}`}>
              <h3><AnimatedCounter target="2000" suffix="+" /></h3>
              <p>Clientes Satisfechos</p>
            </div>
          </div>
        </section>

        {/* ===== FEATURED PROPERTIES ===== */}
        <section className={styles.section} aria-label="Propiedades destacadas">
          <div className={styles.sectionHeader}>
            <span className="section-label">🏠 Propiedades Destacadas</span>
            <h2>Nuestro Portafolio <span className="text-gradient">Exclusivo</span></h2>
            <p className={styles.sectionSub}>
              Descubre las mejores oportunidades inmobiliarias en Ciudad Juárez, 
              seleccionadas por nuestro equipo de expertos.
            </p>
          </div>
          <div className={styles.propertyGrid}>
            {featuredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          <div className={styles.sectionCta}>
            <Link href="/propiedades" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '0.8rem 2rem', borderRadius: '30px', border: '1px solid var(--glass-border)', fontSize: '0.95rem', fontWeight: 600 }}>
              Ver todas las propiedades →
            </Link>
          </div>
        </section>

        {/* ===== WHY OHB ===== */}
        <section className={styles.section} aria-label="¿Por qué OHB?">
          <div className={styles.sectionHeader}>
            <span className="section-label">💎 ¿Por qué OHB?</span>
            <h2>Tu <span className="text-gradient">Aliado</span> Estratégico</h2>
          </div>
          <div className={styles.whyGrid}>
            {[
              { icon: '🏆', title: 'Experiencia', desc: 'Más de 15 años en el mercado inmobiliario de Ciudad Juárez con un historial probado de resultados.' },
              { icon: '🤝', title: 'Transparencia', desc: 'Proceso claro y documentado en cada transacción. Sin sorpresas, sin letras pequeñas.' },
              { icon: '📈', title: 'Resultados', desc: 'Más de 2,000 clientes satisfechos y $500M+ en inversiones gestionadas exitosamente.' },
              { icon: '🤖', title: 'Innovación', desc: 'Plataforma potenciada con IA: calculadoras predictivas, análisis de mercado y chatbot 24/7.' },
            ].map((item, i) => (
              <div key={i} className={`glass-panel ${styles.whyCard}`}>
                <span className={styles.whyIcon}>{item.icon}</span>
                <h3 className={styles.whyTitle}>{item.title}</h3>
                <p className={styles.whyDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section className={styles.section} aria-label="Testimonios">
          <div className={styles.sectionHeader}>
            <span className="section-label">⭐ Testimonios</span>
            <h2>Lo que dicen nuestros <span className="text-gradient">Clientes</span></h2>
          </div>
          <div className={styles.testimonialCarousel}>
            <div className={`glass-panel ${styles.testimonialCard}`}>
              <div className={styles.testimonialStars}>
                {'⭐'.repeat(DEMO_TESTIMONIALS[activeTestimonial].rating)}
              </div>
              <p className={styles.testimonialText}>
                &ldquo;{DEMO_TESTIMONIALS[activeTestimonial].text}&rdquo;
              </p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.testimonialAvatar}>
                  {DEMO_TESTIMONIALS[activeTestimonial].name.charAt(0)}
                </div>
                <div>
                  <div className={styles.testimonialName}>
                    {DEMO_TESTIMONIALS[activeTestimonial].name}
                  </div>
                  <div className={styles.testimonialRole}>
                    {DEMO_TESTIMONIALS[activeTestimonial].role}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.testimonialDots}>
              {DEMO_TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === activeTestimonial ? styles.dotActive : ''}`}
                  onClick={() => setActiveTestimonial(i)}
                  aria-label={`Testimonio ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ===== ACADEMY PREVIEW ===== */}
        <EducationSection />

        {/* ===== CALCULATORS ===== */}
        <section className={styles.section} id="calculadora" aria-label="Herramientas financieras">
          <div className={styles.sectionHeader}>
            <span className="section-label">🧮 Herramientas IA</span>
            <h2>Planifica tu <span className="text-gradient">Inversión</span> Hoy</h2>
            <p className={styles.sectionSub}>
              Descubre cuánto necesitas y proyecta el mejor escenario con nuestras 
              herramientas financieras basadas en Inteligencia Artificial.
            </p>
          </div>
          <div className={styles.calculatorWrapper}>
            <div className={styles.calculatorItem}>
              <MortgageCalculator />
            </div>
            <div className={styles.calculatorItem}>
              <InvestmentCalculator />
            </div>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <CtaNewsletter />


        {/* WhatsApp Float Button */}
        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          className={styles.whatsappFloat}
          title="Contactar por WhatsApp"
        >
          💬
        </a>
      </main>
    </div>
  );
}
