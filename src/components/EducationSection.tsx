import styles from './EducationSection.module.css';

const articles = [
  {
    id: 1,
    title: "Estrategias de Inversión Inmobiliaria 2026",
    category: "Educación Inmobiliaria",
    readTime: "5 min de lectura",
    description: "Descubre cómo diversificar tu portafolio y aprovechar las tasas actuales para maximizar tu retorno de inversión (ROI).",
    imageClass: styles.imageRealEstate
  },
  {
    id: 2,
    title: "Guía Definitiva: Créditos Infonavit",
    category: "Infonavit",
    readTime: "8 min de lectura",
    description: "Conoce los nuevos esquemas de cofinanciamiento, cómo usar tu subcuenta de vivienda y precalificar con inteligencia artificial.",
    imageClass: styles.imageInfonavit
  },
  {
    id: 3,
    title: "Libertad Financiera a través de Bienes Raíces",
    category: "Educación Financiera",
    readTime: "6 min de lectura",
    description: "Aprende los conceptos básicos de apalancamiento, flujo de caja positivo y cómo evaluar el Cap Rate de una propiedad.",
    imageClass: styles.imageFinance
  }
];

export default function EducationSection() {
  return (
    <section className={styles.educationSection} id="educacion">
      <div className={styles.header}>
        <div className={styles.aiBadge}>
           <span className={styles.sparkle}>✨</span> Curado por AVA AI
        </div>
        <h2 className={styles.title}>
          Academia <span className="text-gradient-silver">OHB</span>
        </h2>
        <p className={styles.subtitle}>
          Formación premium en finanzas, estrategias inmobiliarias y optimización de créditos Infonavit. Toma decisiones informadas.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}>Infografías Exclusivas</h3>
        <button style={{ background: 'var(--accent-silver)', color: '#0B0F19', padding: '0.5rem 1rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
           + Añadir Infografía (Ver. Asesor/Admin)
        </button>
      </div>
      
      <div className={styles.grid} style={{ marginBottom: '4rem' }}>
        <article className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ width: '100%', height: '200px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>[Infografía 1]</span>
          </div>
          <h4>Guía de Avalúos 2026</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Aprende a valorar tu propiedad antes de vender.</p>
        </article>
        <article className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ width: '100%', height: '200px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>[Infografía 2]</span>
          </div>
          <h4>Pasos de Compra-Venta</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>El recorrido legal y notarial completo.</p>
        </article>
      </div>

      <div className={styles.header}>
        <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}>Artículos de Interés</h3>
      </div>

      <div className={styles.grid}>
        {articles.map((article) => (
          <article key={article.id} className={`glass-panel ${styles.card}`}>
            <div className={`${styles.imageContainer} ${article.imageClass}`}>
              <div className={styles.categoryBadge}>{article.category}</div>
            </div>
            <div className={styles.content}>
              <div className={styles.meta}>
                <span className={styles.readTime}>⏱ {article.readTime}</span>
              </div>
              <h3 className={styles.articleTitle}>{article.title}</h3>
              <p className={styles.description}>{article.description}</p>
              <button className={styles.readMoreBtn}>
                Leer Artículo <span className={styles.arrow}>→</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
