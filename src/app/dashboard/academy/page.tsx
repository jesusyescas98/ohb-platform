"use client";

import { useState, useEffect, useRef } from 'react';
import styles from '../Dashboard.module.css';
import { ArticlesDB, InfographicsDB, CoursesDB, ActivityLogDB, type ArticleRecord, type InfographicRecord, type CourseRecord, type CourseAttachment } from '../../../lib/database';
import { useAuth } from '../../../context/AuthContext';

type Tab = 'articles' | 'infographics' | 'courses';

export default function AcademyCMSPage() {
  const { email: userEmail, fullName } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('articles');
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [infographics, setInfographics] = useState<InfographicRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, unknown>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setArticles(ArticlesDB.getAll());
    setInfographics(InfographicsDB.getAll());
    setCourses(CoursesDB.getAll());
  }, []);

  const reload = () => {
    setArticles(ArticlesDB.getAll());
    setInfographics(InfographicsDB.getAll());
    setCourses(CoursesDB.getAll());
  };

  const logAction = (action: string, details: string) => {
    ActivityLogDB.add({ userEmail: userEmail || '', userName: fullName || '', action, details, module: 'academia' });
  };

  // ========== ARTICLES ==========
  const openArticleEdit = (article?: ArticleRecord) => {
    setEditingItem(article ? { ...article, _type: 'article' } : {
      _type: 'article', id: `ART-${Date.now().toString(36).toUpperCase()}`,
      title: '', category: '', readTime: '5 min', description: '', content: '', imageUrl: '',
      createdBy: userEmail || '',
    });
    setIsModalOpen(true);
  };

  const saveArticle = () => {
    const item = editingItem as unknown as ArticleRecord & { _type: string };
    ArticlesDB.upsert({ ...item, updatedAt: Date.now() } as ArticleRecord);
    logAction('ARTICLE_SAVED', `Artículo "${item.title}" guardado`);
    reload();
    setIsModalOpen(false);
  };

  const deleteArticle = (id: string) => {
    if (window.confirm('¿Eliminar este artículo?')) {
      ArticlesDB.delete(id);
      logAction('ARTICLE_DELETED', `Artículo ${id} eliminado`);
      reload();
    }
  };

  // ========== INFOGRAPHICS ==========
  const openInfographicEdit = (infographic?: InfographicRecord) => {
    setEditingItem(infographic ? { ...infographic, _type: 'infographic' } : {
      _type: 'infographic', id: `INF-${Date.now().toString(36).toUpperCase()}`,
      title: '', description: '', imageDataUrl: '', createdBy: userEmail || '',
    });
    setIsModalOpen(true);
  };

  const handleInfographicImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Máximo 2MB por imagen'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditingItem(prev => ({ ...prev, imageDataUrl: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const saveInfographic = () => {
    const item = editingItem as unknown as InfographicRecord & { _type: string };
    InfographicsDB.upsert({ ...item, updatedAt: Date.now() } as InfographicRecord);
    logAction('INFOGRAPHIC_SAVED', `Infografía "${item.title}" guardada`);
    reload();
    setIsModalOpen(false);
  };

  const deleteInfographic = (id: string) => {
    if (window.confirm('¿Eliminar esta infografía?')) {
      InfographicsDB.delete(id);
      logAction('INFOGRAPHIC_DELETED', `Infografía ${id} eliminada`);
      reload();
    }
  };

  // ========== COURSES ==========
  const openCourseEdit = (course?: CourseRecord) => {
    setEditingItem(course ? { ...course, _type: 'course', _topicsText: (course.topics || []).join(', '), price: course.price || 0, attachments: course.attachments || [] } : {
      _type: 'course', id: `CRS-${Date.now().toString(36).toUpperCase()}`,
      title: '', description: '', instructor: '', duration: '', level: 'basico',
      topics: [], _topicsText: '', imageUrl: '', createdBy: userEmail || '',
      price: 0, attachments: [],
    });
    setIsModalOpen(true);
  };

  const handleCourseAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Máximo 10MB por archivo adjunto en este demo'); return; }
    
    let type: CourseAttachment['type'] = 'file';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newAttachment: CourseAttachment = {
        name: file.name,
        type,
        url: ev.target?.result as string,
      };
      setEditingItem(prev => {
        const past = (prev.attachments as CourseAttachment[]) || [];
        return { ...prev, attachments: [...past, newAttachment] };
      });
    };
    reader.readAsDataURL(file);
  };

  const removeCourseAttachment = (index: number) => {
    setEditingItem(prev => {
      const past = [...((prev.attachments as CourseAttachment[]) || [])];
      past.splice(index, 1);
      return { ...prev, attachments: past };
    });
  };

  const handleLinkAttachment = () => {
    const link = prompt('Ingresa el enlace (URL):');
    if (!link) return;
    const name = prompt('Nombre del enlace:') || 'Enlace Externo';
    const newAttachment: CourseAttachment = {
      name,
      type: 'link',
      url: link,
    };
    setEditingItem(prev => {
      const past = (prev.attachments as CourseAttachment[]) || [];
      return { ...prev, attachments: [...past, newAttachment] };
    });
  };

  const saveCourse = () => {
    const item = editingItem as unknown as CourseRecord & { _type: string; _topicsText?: string };
    const topics = (item._topicsText || '').split(',').map(t => t.trim()).filter(Boolean);
    CoursesDB.upsert({ ...item, topics, updatedAt: Date.now() } as CourseRecord);
    logAction('COURSE_SAVED', `Curso "${item.title}" guardado`);
    reload();
    setIsModalOpen(false);
  };

  const deleteCourse = (id: string) => {
    if (window.confirm('¿Eliminar este curso?')) {
      CoursesDB.delete(id);
      logAction('COURSE_DELETED', `Curso ${id} eliminado`);
      reload();
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const type = editingItem._type;
    if (type === 'article') saveArticle();
    else if (type === 'infographic') saveInfographic();
    else if (type === 'course') saveCourse();
  };

  const tabs = [
    { key: 'articles' as Tab, label: '📝 Artículos', count: articles.length },
    { key: 'infographics' as Tab, label: '🖼️ Infografías', count: infographics.length },
    { key: 'courses' as Tab, label: '🎓 Cursos OHB', count: courses.length },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1>Academia <span className="text-gradient-silver">CMS</span></h1>
          <p className={styles.subtitle}>Gestiona artículos, infografías y cursos de la plataforma.</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => {
          if (activeTab === 'articles') openArticleEdit();
          else if (activeTab === 'infographics') openInfographicEdit();
          else openCourseEdit();
        }}>+ Nuevo {activeTab === 'articles' ? 'Artículo' : activeTab === 'infographics' ? 'Infografía' : 'Curso'}</button>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.6rem 1.2rem', borderRadius: '8px 8px 0 0', border: 'none', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: activeTab === tab.key ? 'bold' : 'normal', transition: 'all 0.2s',
              background: activeTab === tab.key ? 'rgba(192, 198, 204, 0.15)' : 'transparent',
              color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.key ? '2px solid var(--accent-silver)' : '2px solid transparent',
            }}
          >
            {tab.label} <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>({tab.count})</span>
          </button>
        ))}
      </div>

      {/* ARTICLES LIST */}
      {activeTab === 'articles' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {articles.map(article => (
            <div key={article.id} className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>{article.category}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>⏱ {article.readTime}</span>
              </div>
              <h4 style={{ fontSize: '1rem' }}>{article.title}</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{article.description}</p>
              <div style={{ display: 'flex', gap: '0.3rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                <button onClick={() => openArticleEdit(article)} className={styles.secondaryBtn} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', flex: 1 }}>✏️ Editar</button>
                <button onClick={() => deleteArticle(article.id)} className={styles.dangerBtn} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INFOGRAPHICS LIST */}
      {activeTab === 'infographics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {infographics.map(inf => (
            <div key={inf.id} className="glass-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
              {inf.imageDataUrl ? (
                <img src={inf.imageDataUrl} alt={inf.title} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.8rem' }} />
              ) : (
                <div style={{ width: '100%', height: '180px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem', color: 'var(--text-secondary)' }}>
                  📷 Sin imagen
                </div>
              )}
              <h4 style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>{inf.title}</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{inf.description}</p>
              <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.8rem' }}>
                <button onClick={() => openInfographicEdit(inf)} className={styles.secondaryBtn} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', flex: 1 }}>✏️ Editar</button>
                <button onClick={() => deleteInfographic(inf.id)} className={styles.dangerBtn} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COURSES LIST */}
      {activeTab === 'courses' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {courses.map(course => (
            <div key={course.id} className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: '6px', background: course.level === 'basico' ? 'rgba(74, 222, 128, 0.15)' : course.level === 'intermedio' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: course.level === 'basico' ? '#4ade80' : course.level === 'intermedio' ? '#f59e0b' : '#ef4444', textTransform: 'capitalize' }}>
                  {course.level}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>⏱ {course.duration}</span>
              </div>
              <h4 style={{ fontSize: '1rem' }}>{course.title}</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{course.description}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--accent-silver)' }}>👨‍🏫 {course.instructor}</p>
              {course.price ? (
                <p style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>💵 Costo: ${course.price.toLocaleString()}</p>
              ) : (
                <p style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#4ade80' }}>🎁 Gratis</p>
              )}
              {course.topics && course.topics.length > 0 && (
                <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                  {course.topics.map(t => (
                    <span key={t} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>{t}</span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.3rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                <button onClick={() => openCourseEdit(course)} className={styles.secondaryBtn} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', flex: 1 }}>✏️ Editar</button>
                <button onClick={() => deleteCourse(course.id)} className={styles.dangerBtn} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UNIVERSAL EDIT MODAL */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '550px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', margin: '1rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>
              {editingItem._type === 'article' ? '📝 Artículo' : editingItem._type === 'infographic' ? '🖼️ Infografía' : '🎓 Curso'}
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Título *</label>
                <input required className={styles.formInput} value={(editingItem.title as string) || ''} onChange={e => setEditingItem({...editingItem, title: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Descripción</label>
                <textarea className={styles.formTextarea} value={(editingItem.description as string) || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})} rows={3} />
              </div>

              {editingItem._type === 'article' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Categoría</label>
                      <input className={styles.formInput} value={(editingItem.category as string) || ''} onChange={e => setEditingItem({...editingItem, category: e.target.value})} placeholder="Ej: Educación Financiera" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Tiempo de lectura</label>
                      <input className={styles.formInput} value={(editingItem.readTime as string) || ''} onChange={e => setEditingItem({...editingItem, readTime: e.target.value})} placeholder="5 min" />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Contenido completo</label>
                    <textarea className={styles.formTextarea} value={(editingItem.content as string) || ''} onChange={e => setEditingItem({...editingItem, content: e.target.value})} rows={5} />
                  </div>
                </>
              )}

              {editingItem._type === 'infographic' && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>📷 Imagen de la infografía</label>
                  {(editingItem.imageDataUrl as string) && (
                    <img src={editingItem.imageDataUrl as string} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', marginBottom: '0.5rem', objectFit: 'contain' }} />
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleInfographicImage} className={styles.formInput} style={{ padding: '0.5rem' }} />
                </div>
              )}

              {editingItem._type === 'course' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Instructor</label>
                      <input className={styles.formInput} value={(editingItem.instructor as string) || ''} onChange={e => setEditingItem({...editingItem, instructor: e.target.value})} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Duración</label>
                      <input className={styles.formInput} value={(editingItem.duration as string) || ''} onChange={e => setEditingItem({...editingItem, duration: e.target.value})} placeholder="4 horas" />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Nivel</label>
                    <select className={styles.formSelect} value={(editingItem.level as string) || 'basico'} onChange={e => setEditingItem({...editingItem, level: e.target.value})}>
                      <option value="basico">Básico</option>
                      <option value="intermedio">Intermedio</option>
                      <option value="avanzado">Avanzado</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Temas (separados por coma)</label>
                    <input className={styles.formInput} value={(editingItem._topicsText as string) || ''} onChange={e => setEditingItem({...editingItem, _topicsText: e.target.value})} placeholder="ROI, Cap Rate, Apalancamiento" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Costo del curso (0 para gratuito)</label>
                    <input type="number" min="0" className={styles.formInput} value={(editingItem.price as number) || 0} onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})} placeholder="0" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Contenidos / Archivos Adjuntos</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input type="file" id="course_file_upload" style={{ display: 'none' }} onChange={handleCourseAttachment} />
                      <button type="button" onClick={() => document.getElementById('course_file_upload')?.click()} className={styles.secondaryBtn} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>📎 Subir Archivo/Video</button>
                      <button type="button" onClick={handleLinkAttachment} className={styles.secondaryBtn} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>🔗 Agregar Enlace</button>
                    </div>
                    {((editingItem.attachments as any[]) || []).map((att, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '4px', marginBottom: '0.3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>
                            {att.type === 'file' ? '📄' : att.type === 'image' ? '🖼️' : att.type === 'video' ? '🎬' : '🔗'}
                          </span>
                          <span style={{ fontSize: '0.85rem' }}>{att.name}</span>
                        </div>
                        <button type="button" onClick={() => removeCourseAttachment(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.5rem' }}>×</button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.secondaryBtn} style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className={styles.primaryBtn} style={{ flex: 1 }}>💾 Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
