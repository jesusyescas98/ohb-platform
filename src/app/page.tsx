import MortgageCalculator from "../components/MortgageCalculator";
import InvestmentCalculator from "../components/InvestmentCalculator";
import Portfolio from "../components/Portfolio";
import EducationSection from "../components/EducationSection";
import styles from "./page.module.css";

import Header from "../components/Header";

export default function Home() {
  return (
    <div className={styles.container} itemScope itemType="https://schema.org/WebPage">
      <Header />

      <main className={styles.main} role="main">
        <section className={styles.hero} aria-label="Presentación principal" itemScope itemType="https://schema.org/WPHeader">
          <div className={styles.heroContent}>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 1rem', borderRadius: '20px', marginBottom: '1.5rem',
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
              fontSize: '0.8rem', color: 'var(--accent-silver)'
            }}>
              🏆 #1 Consultora Inmobiliaria en Cd. Juárez
            </div>
            <h1 className={styles.heroTitle}>
              Eleva tu <span className="text-gradient-silver">Patrimonio</span> y<br />
              Asegura tu <span className="text-gradient">Futuro</span>.
            </h1>
            <p className={styles.heroSubtitle}>
              Soluciones integrales de bienes raíces, finanzas e inversiones. 
              Asesoría premium para personas con visión y resultados reales.
            </p>
            <div className={styles.heroActions}>
              <a href="/portfolio" className={`${styles.btn} ${styles.btnPrimary}`}>🏢 Ver Portafolio</a>
              <a href="/#calculadora" className={`${styles.btn} ${styles.btnSecondary}`}>🧮 Calculadoras</a>
              <a href="/academy" className={`${styles.btn} ${styles.btnSecondary}`}>🎓 Academia</a>
            </div>
            {/* Trust indicators */}
            <div style={{ 
              display: 'flex', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap',
              fontSize: '0.75rem', color: 'var(--text-secondary)'
            }}>
              <span>🔒 Plataforma Segura</span>
              <span>🤖 Potenciado por IA</span>
              <span>📊 Análisis Predictivo</span>
              <span>⭐ 4.9/5 Valoración</span>
            </div>
          </div>
          
          <div className={styles.heroStats}>
            <div className={`glass-panel ${styles.statCard}`}>
              <h3>15+</h3>
              <p>Años de Experiencia</p>
            </div>
            <div className={`glass-panel ${styles.statCard}`}>
              <h3>$500M+</h3>
              <p>Inversiones Gestionadas</p>
            </div>
            <div className={`glass-panel ${styles.statCard}`}>
              <h3>2,000+</h3>
              <p>Clientes Satisfechos</p>
            </div>
          </div>
        </section>

        <Portfolio />
        
        <EducationSection />

        <section className={styles.toolsSection} id="calculadora" aria-label="Herramientas financieras y calculadoras">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 1rem', borderRadius: '20px', marginBottom: '1rem',
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
              fontSize: '0.8rem', color: 'var(--accent-silver)'
            }}>
              🧮 Herramientas IA
            </div>
            <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '2.5rem', marginBottom: '1rem' }}>
              Planifica tu <span className="text-gradient-silver">Inversión</span> Hoy
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
              Descubre cuánto necesitas y proyecta el mejor escenario con nuestras herramientas financieras basadas en Inteligencia Artificial.
            </p>
          </div>
          <div className={styles.calculatorWrapper} style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start', justifyContent: 'center' }}>
            <div style={{ flex: '1', minWidth: '320px', maxWidth: '500px' }}>
              <MortgageCalculator />
            </div>
            <div style={{ flex: '1', minWidth: '320px', maxWidth: '500px' }}>
              <InvestmentCalculator />
            </div>
          </div>
        </section>

        {/* WhatsApp Float Button */}
        <a 
          href="https://wa.me/526561234567?text=Hola%20OHB%2C%20me%20interesa%20una%20consulta" 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          style={{
            position: 'fixed', bottom: '100px', right: '30px', zIndex: 999,
            width: '56px', height: '56px', borderRadius: '50%',
            background: '#25D366', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
            transition: 'transform 0.2s ease',
            textDecoration: 'none', fontSize: '1.5rem'
          }}
          title="Contactar por WhatsApp"
        >
          💬
        </a>
      </main>
    </div>
  );
}
