"use client";

import { useState, useEffect } from 'react';
import styles from './EducationSection.module.css';
import { ArticlesDB, InfographicsDB, CoursesDB, UserPrefsDB, type ArticleRecord, type InfographicRecord, type CourseRecord } from '../lib/database';
import { useAuth } from '../context/AuthContext';

export default function EducationSection() {
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [infographics, setInfographics] = useState<InfographicRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);

  const { role, email, fullName, isLoggedIn } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<CourseRecord | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ArticleRecord | null>(null);
  const [paymentCourse, setPaymentCourse] = useState<string | null>(null);
  const [userPrefs, setUserPrefs] = useState<any>({});

  const reloadPrefs = () => {
    if (email) setUserPrefs(UserPrefsDB.get(email));
  };

  useEffect(() => {
    setArticles(ArticlesDB.getAll());
    setInfographics(InfographicsDB.getAll());
    setCourses(CoursesDB.getAll());
    reloadPrefs();
  }, [email]);

  const hasAccessToCourse = (course: CourseRecord) => {
    if (!course.price || course.price === 0) return true;
    if (role === 'admin') return true;
    const purchased = userPrefs.purchasedCourses || [];
    return purchased.includes(course.id);
  };

  const isCourseCompleted = (courseId: string) => {
    const completed = userPrefs.completedCourses || [];
    return completed.includes(courseId);
  };

  const handlePurchaseButtonClick = (courseId: string) => {
    setPaymentCourse(courseId);
  };

  const handlePurchase = (courseId: string) => {
    const purchased = userPrefs.purchasedCourses || [];
    UserPrefsDB.set(email || '', { purchasedCourses: [...purchased, courseId] });
    reloadPrefs();
    setPaymentCourse(null);
    alert('¡Pago exitoso! Tienes acceso al curso.');
  };

  const markAsCompleted = (courseId: string) => {
    const completed = userPrefs.completedCourses || [];
    UserPrefsDB.set(email || '', { completedCourses: [...completed, courseId] });
    reloadPrefs();
    alert('¡Felicidades! Has completado el curso marcado como 100%.');
  };

  const downloadCertificate = (courseTitle: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;
    
    // Background and border
    ctx.fillStyle = '#0f172a'; // dark slate
    ctx.fillRect(0,0,800,600);
    ctx.strokeStyle = '#1D3D8F'; // logo dark blue
    ctx.lineWidth = 12;
    ctx.strokeRect(20,20,760,560);
    ctx.strokeStyle = '#00AEEF'; // logo cyan inner
    ctx.lineWidth = 2;
    ctx.strokeRect(36,36,728,528);

    // Text
    ctx.fillStyle = '#1D3D8F';
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px "Outfit", sans-serif';
    ctx.fillText('CERTIFICADO DE COMPLETACIÓN', 400, 140);
    
    ctx.fillStyle = '#00AEEF';
    ctx.font = '22px "Inter", sans-serif';
    ctx.fillText('OTORGADO A:', 400, 240);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px "Outfit", sans-serif';
    ctx.fillText((fullName || email || 'Estudiante').toUpperCase(), 400, 310);
    
    ctx.fillStyle = '#c0c6cc';
    ctx.font = '20px "Inter", sans-serif';
    ctx.fillText('Por haber completado con éxito al 100% el curso:', 400, 390);
    
    ctx.fillStyle = '#4ade80';
    ctx.font = 'italic bold 28px "Inter", sans-serif';
    // Wrap title if too long
    const words = courseTitle.split(' ');
    let line = '';
    let y = 450;
    words.forEach(word => {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > 600) {
        ctx.fillText(line, 400, y);
        line = word + ' ';
        y += 40;
      } else {
        line = test;
      }
    });
    ctx.fillText(line, 400, y);
    
    ctx.font = '16px "Inter", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Academia OHB - Fecha: ${new Date().toLocaleDateString()}`, 400, y + 60);

    const link = document.createElement('a');
    link.download = `Certificado_${courseTitle.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <section className={styles.educationSection} id="educacion">
      <div className={styles.header}>
        <div className={styles.aiBadge}>
           <span className={styles.sparkle}>✨</span> Curado por AVA AI
        </div>
        <h2 className={styles.title}>
          Academia <span className="text-gradient-primary">OHB</span>
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
                  <p style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>👨‍🏫 {course.instructor}</p>
                  {course.price ? (
                    <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>💵 Costo: ${course.price.toLocaleString()}</p>
                  ) : (
                    <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4ade80', marginBottom: '0.5rem' }}>🎁 Gratis</p>
                  )}
                  {course.topics && course.topics.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      {course.topics.map(t => (
                        <span key={t} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>{t}</span>
                      ))}
                    </div>
                  )}
                  <button className={styles.readMoreBtn} onClick={() => setSelectedCourse(course)}>
                    Ver Detalles <span className={styles.arrow}>→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* COURSE MODAL */}
          {selectedCourse && (
            <div className={styles.modalOverlay} onClick={(e) => { if(e.target === e.currentTarget) setSelectedCourse(null) }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
                <button onClick={() => setSelectedCourse(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{selectedCourse.title}</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)' }}>👨‍🏫 {selectedCourse.instructor}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>⏱ {selectedCourse.duration}</span>
                </div>
                
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>{selectedCourse.description}</p>
                
                {!hasAccessToCourse(selectedCourse) ? (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔒</div>
                    <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Curso Bloqueado</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Para acceder a los materiales de este curso, necesitas realizar el pago.</p>
                    <p style={{ fontSize: '1.2rem', color: 'var(--accent-primary)', fontWeight: 'bold', marginBottom: '1rem' }}>Costo: ${selectedCourse.price?.toLocaleString()}</p>
                    {isLoggedIn ? (
                      <button onClick={() => handlePurchaseButtonClick(selectedCourse.id)} style={{ padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Realizar Pago Seguro</button>
                    ) : (
                      <p style={{ color: 'var(--accent-secondary)' }}>Inicia sesión para comprar.</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div style={{ background: 'rgba(74, 222, 128, 0.1)', padding: '0.5rem 1rem', borderRadius: '4px', display: 'inline-block', color: '#4ade80', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1rem' }}>✓ Tienes acceso al curso</div>
                    
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Materiales del Curso</h3>
                    
                    {(!selectedCourse.attachments || selectedCourse.attachments.length === 0) ? (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>No hay archivos adjuntos en este curso todavía.</p>
                    ) : (
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {selectedCourse.attachments.map((att, idx) => (
                          <li key={idx} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '6px' }}>
                            <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>
                              {att.type === 'file' ? '📄' : att.type === 'image' ? '🖼️' : att.type === 'video' ? '🎬' : '🔗'}
                            </span>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{att.name}</p>
                            </div>
                            <a href={att.url} target="_blank" rel="noopener noreferrer" style={{ padding: '0.4rem 0.8rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderRadius: '4px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 'bold' }}>
                              Ver / Descargar
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
                      {isCourseCompleted(selectedCourse.id) ? (
                        <div>
                          <p style={{ color: '#4ade80', fontWeight: 'bold', marginBottom: '1rem', fontSize: '1.1rem' }}>🎉 ¡Curso Completado al 100%!</p>
                          <button onClick={() => downloadCertificate(selectedCourse.title)} style={{ padding: '0.8rem 1.5rem', background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-secondary-hover))', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                            🎓 Descargar Certificado
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Al finalizar de revisar todos los materiales, marca este curso como completado.</p>
                          <button onClick={() => markAsCompleted(selectedCourse.id)} style={{ padding: '0.7rem 1.5rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}>
                            ✓ Marcar Curso como Completado (100%)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
                <button className={styles.readMoreBtn} onClick={() => setSelectedArticle(article)}>
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

      {/* ARTICLE MODAL */}
      {selectedArticle && (
        <div className={styles.modalOverlay} onClick={(e) => { if(e.target === e.currentTarget) setSelectedArticle(null) }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setSelectedArticle(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            <div style={{ marginBottom: '1rem' }}>
              <span className={styles.categoryBadge} style={{ position: 'static', display: 'inline-block', marginBottom: '1rem' }}>{selectedArticle.category}</span>
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{selectedArticle.title}</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <span>✍️ {selectedArticle.createdBy === 'sistema' ? 'Equipo Editorial OHB' : selectedArticle.createdBy}</span>
              <span>⏱ {selectedArticle.readTime}</span>
            </div>
            
            {selectedArticle.imageUrl && (
              <img src={selectedArticle.imageUrl} alt={selectedArticle.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '2rem' }} />
            )}
            
            <div style={{ color: 'var(--text-primary)', lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
              {selectedArticle.content ? selectedArticle.content : (
                <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1rem' }}>El contenido completo de este artículo no está disponible actualmente.</p>
                  <p style={{ color: 'var(--text-primary)' }}>{selectedArticle.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {paymentCourse && (
        <div className={styles.modalOverlay} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setPaymentCourse(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)', textAlign: 'center' }}>Proceso de Pago</h2>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Curso a desbloquear:</p>
               <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--accent-secondary)' }}>{courses.find(c => c.id === paymentCourse)?.title}</p>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                 <span>Total a pagar:</span>
                 <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                   ${courses.find(c => c.id === paymentCourse)?.price?.toLocaleString()} MXN
                 </span>
               </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handlePurchase(paymentCourse); }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Nombre en la tarjeta</label>
                <input required type="text" placeholder="Ej. Juan Pérez" style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Número de tarjeta</label>
                <input required type="text" placeholder="0000 0000 0000 0000" maxLength={19} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white', letterSpacing: '2px' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Vencimiento (MM/AA)</label>
                  <input required type="text" placeholder="12/28" maxLength={5} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>CVC</label>
                  <input required type="text" placeholder="123" maxLength={4} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
                </div>
              </div>

              <button type="submit" style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover))', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
                Pagar y Desbloquear Curso
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
