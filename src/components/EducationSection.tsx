"use client";

import { useState, useEffect } from 'react';
import styles from './EducationSection.module.css';
import { ArticlesDB, InfographicsDB, CoursesDB, type ArticleRecord, type InfographicRecord, type CourseRecord } from '../lib/database';

export default function EducationSection() {
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [infographics, setInfographics] = useState<InfographicRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);

  useEffect(() => {
    setArticles(ArticlesDB.getAll());
    setInfographics(InfographicsDB.getAll());
    setCourses(CoursesDB.getAll());
  }, []);

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

      {/* Infographics Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}>Infografías Exclusivas</h3>
      </div>
      
      <div className={styles.grid} style={{ marginBottom: '4rem' }}>
        {infographics.length > 0 ? (
          infographics.map(inf => (
            <article key={inf.id} className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
              {inf.imageDataUrl ? (
                <img src={inf.imageDataUrl} alt={inf.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
              ) : (
                <div style={{ width: '100%', height: '200px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>📷 Sin imagen</span>
                </div>
              )}
              <h4>{inf.title}</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{inf.description}</p>
            </article>
          ))
        ) : (
          <article className="glass-panel" style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Próximamente se agregarán infografías educativas.</p>
          </article>
        )}
      </div>

      {/* Courses Section */}
      {courses.length > 0 && (
        <>
          <div className={styles.header}>
            <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}>Cursos OHB</h3>
          </div>
          <div className={styles.grid} style={{ marginBottom: '4rem' }}>
            {courses.map(course => (
              <article key={course.id} className={`glass-panel ${styles.card}`}>
                <div className={styles.content} style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '6px',
                      background: course.level === 'basico' ? 'rgba(74, 222, 128, 0.15)' : course.level === 'intermedio' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: course.level === 'basico' ? '#4ade80' : course.level === 'intermedio' ? '#f59e0b' : '#ef4444',
                      textTransform: 'capitalize',
                    }}>{course.level}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>⏱ {course.duration}</span>
                  </div>
                  <h3 className={styles.articleTitle}>{course.title}</h3>
                  <p className={styles.description}>{course.description}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--accent-silver)', marginBottom: '0.5rem' }}>👨‍🏫 {course.instructor}</p>
                  {course.topics && course.topics.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      {course.topics.map(t => (
                        <span key={t} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>{t}</span>
                      ))}
                    </div>
                  )}
                  <button className={styles.readMoreBtn}>
                    Ver Detalles <span className={styles.arrow}>→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* Articles Section */}
      <div className={styles.header}>
        <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}>Artículos de Interés</h3>
      </div>

      <div className={styles.grid}>
        {articles.length > 0 ? (
          articles.map((article) => (
            <article key={article.id} className={`glass-panel ${styles.card}`}>
              <div className={styles.imageContainer} style={{ background: 'linear-gradient(135deg, rgba(42, 75, 130, 0.5) 0%, rgba(192, 198, 204, 0.2) 100%)' }}>
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
          ))
        ) : (
          <article className="glass-panel" style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Próximamente se agregarán artículos educativos.</p>
          </article>
        )}
      </div>
    </section>
  );
}
