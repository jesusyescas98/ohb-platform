"use client";

import { useState, useEffect, useRef } from 'react';
import styles from '../Dashboard.module.css';
import { PropertiesDB, ActivityLogDB, exportToCSV, type PropertyRecord, type PropertyImage } from '../../../lib/database';
import { useAuth } from '../../../context/AuthContext';

export default function PropertiesManagementPage() {
  const { email: userEmail, fullName } = useAuth();
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Partial<PropertyRecord>>({});
  const [viewingImages, setViewingImages] = useState<PropertyImage[] | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProperties(PropertiesDB.getAll());
  }, []);

  const filteredProperties = properties.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar esta propiedad permanentemente?')) {
      PropertiesDB.delete(id);
      ActivityLogDB.add({ userEmail: userEmail || '', userName: fullName || '', action: 'PROPERTY_DELETED', details: `Propiedad ${id} eliminada`, module: 'properties' });
      setProperties(PropertiesDB.getAll());
    }
  };

  const handleOpenEdit = (property?: PropertyRecord) => {
    if (property) {
      setEditingProperty({ ...property });
    } else {
      setEditingProperty({
        id: `PR-${Date.now().toString(36).toUpperCase()}`,
        title: '', category: 'Casa', location: '', price: 0,
        status: 'Disponible', views: 0, images: [],
        squareMeters: 0, bedrooms: 0, bathrooms: 0, parking: 0,
        amenities: '', description: '', createdBy: userEmail || '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty.id || !editingProperty.title) return;
    const property = { ...editingProperty, updatedAt: Date.now() } as PropertyRecord;
    if (!property.createdAt) property.createdAt = Date.now();
    PropertiesDB.upsert(property);
    ActivityLogDB.add({ userEmail: userEmail || '', userName: fullName || '', action: 'PROPERTY_SAVED', details: `Propiedad ${property.title} guardada`, module: 'properties' });
    setProperties(PropertiesDB.getAll());
    setIsModalOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const currentImages = editingProperty.images || [];

    Array.from(files).forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`La imagen ${file.name} excede 2MB. Por favor usa una imagen más pequeña.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newImg: PropertyImage = {
          id: `IMG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          dataUrl: ev.target?.result as string,
          name: file.name,
        };
        setEditingProperty(prev => ({
          ...prev,
          images: [...(prev.images || []), newImg],
        }));
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (imgId: string) => {
    setEditingProperty(prev => ({
      ...prev,
      images: (prev.images || []).filter(img => img.id !== imgId),
    }));
  };

  // Track view when clicking a property to view images
  const handleViewImages = (property: PropertyRecord) => {
    PropertiesDB.incrementViews(property.id);
    setViewingImages(property.images || []);
    setCurrentImageIdx(0);
    // Update local state
    setProperties(PropertiesDB.getAll());
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Disponible': return { bg: 'rgba(74, 222, 128, 0.2)', text: '#4ade80' };
      case 'En Negociación': return { bg: 'rgba(241, 196, 15, 0.2)', text: '#f1c40f' };
      case 'Vendido': return { bg: 'rgba(239, 68, 68, 0.2)', text: '#f87171' };
      case 'En renta/Para venta': return { bg: 'rgba(56, 189, 248, 0.2)', text: '#38bdf8' };
      case 'Disponible para renta y venta': return { bg: 'rgba(168, 85, 247, 0.2)', text: '#a855f7' };
      default: return { bg: 'rgba(255, 255, 255, 0.1)', text: 'var(--text-secondary)' };
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1>Gestión de <span className="text-gradient-silver">Propiedades</span></h1>
          <p className={styles.subtitle}>Inventario con imágenes, estadísticas reales y detalles técnicos.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className={styles.secondaryBtn} onClick={() => exportToCSV(properties.map(p => ({ ...p, images: `${p.images?.length || 0} fotos` })) as unknown as Record<string, unknown>[], 'propiedades')}>📥 CSV</button>
          <button className={styles.primaryBtn} onClick={() => handleOpenEdit()}>+ Nueva Propiedad</button>
        </div>
      </header>

      <div className={`glass-panel ${styles.dashboardCard}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0 }}>🏠 Catálogo de Inmuebles ({filteredProperties.length})</h3>
          <input
            type="text" placeholder="🔍 Buscar por ID, nombre, ubicación..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.formInput} style={{ maxWidth: '300px' }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                <th style={{ padding: '0.8rem' }}>Fotos</th>
                <th style={{ padding: '0.8rem' }}>ID</th>
                <th style={{ padding: '0.8rem' }}>Título / Ubicación</th>
                <th style={{ padding: '0.8rem' }}>Detalles</th>
                <th style={{ padding: '0.8rem' }}>Precio</th>
                <th style={{ padding: '0.8rem' }}>Vistas</th>
                <th style={{ padding: '0.8rem' }}>Estatus</th>
                <th style={{ padding: '0.8rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map(prop => {
                const statusStyle = getStatusStyle(prop.status);
                return (
                  <tr key={prop.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.8rem' }}>
                      {prop.images && prop.images.length > 0 ? (
                        <div
                          onClick={() => handleViewImages(prop)}
                          style={{ width: '60px', height: '45px', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--glass-border)', position: 'relative' }}
                        >
                          <img src={prop.images[0].dataUrl} alt={prop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {prop.images.length > 1 && (
                            <span style={{ position: 'absolute', bottom: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.6rem', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>
                              +{prop.images.length - 1}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div style={{ width: '60px', height: '45px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          📷
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.8rem', fontWeight: 'bold', fontSize: '0.82rem' }}>{prop.id}</td>
                    <td style={{ padding: '0.8rem' }}>
                      <div style={{ fontWeight: 'bold' }}>{prop.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{prop.location}</div>
                    </td>
                    <td style={{ padding: '0.8rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {prop.bedrooms > 0 && <span>🛏 {prop.bedrooms} </span>}
                      {prop.bathrooms > 0 && <span>🚿 {prop.bathrooms} </span>}
                      {prop.parking > 0 && <span>🚗 {prop.parking} </span>}
                      {prop.squareMeters > 0 && <span>📐 {prop.squareMeters}m²</span>}
                    </td>
                    <td style={{ padding: '0.8rem', fontFamily: 'var(--font-outfit)', fontWeight: 'bold', color: 'var(--accent-silver)' }}>
                      ${prop.price.toLocaleString('en-US')}
                    </td>
                    <td style={{ padding: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{prop.views}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>👁</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.8rem' }}>
                      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold', background: statusStyle.bg, color: statusStyle.text }}>
                        {prop.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleOpenEdit(prop)} className={styles.secondaryBtn} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>✏️</button>
                        <button onClick={() => handleDelete(prop.id)} className={styles.dangerBtn} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProperties.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No se encontraron propiedades.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {viewingImages && (
        <div className={styles.modalOverlay} onClick={() => setViewingImages(null)}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', width: '90%', textAlign: 'center' }}>
            {viewingImages.length > 0 ? (
              <>
                <img
                  src={viewingImages[currentImageIdx]?.dataUrl}
                  alt="Propiedad"
                  style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '12px', objectFit: 'contain' }}
                />
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                  <button
                    onClick={() => setCurrentImageIdx(Math.max(0, currentImageIdx - 1))}
                    disabled={currentImageIdx === 0}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem' }}
                  >◀</button>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{currentImageIdx + 1} / {viewingImages.length}</span>
                  <button
                    onClick={() => setCurrentImageIdx(Math.min(viewingImages.length - 1, currentImageIdx + 1))}
                    disabled={currentImageIdx === viewingImages.length - 1}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem' }}
                  >▶</button>
                </div>
              </>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>Sin imágenes disponibles</p>
            )}
            <button onClick={() => setViewingImages(null)} style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.5rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '650px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', margin: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem' }}>
                {properties.some(p => p.id === editingProperty.id) ? '✏️ Editar Propiedad' : '➕ Nueva Propiedad'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.3rem' }}>✕</button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>ID Propiedad</label>
                  <input className={styles.formInput} value={editingProperty.id || ''} onChange={e => setEditingProperty({...editingProperty, id: e.target.value})} disabled={properties.some(p => p.id === editingProperty.id)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Categoría</label>
                  <select className={styles.formSelect} value={editingProperty.category || 'Casa'} onChange={e => setEditingProperty({...editingProperty, category: e.target.value})}>
                    <option value="Casa">Casa</option>
                    <option value="Departamento">Departamento</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Terreno">Terreno</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Título *</label>
                <input required className={styles.formInput} value={editingProperty.title || ''} onChange={e => setEditingProperty({...editingProperty, title: e.target.value})} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Descripción</label>
                <textarea className={styles.formTextarea} value={editingProperty.description || ''} onChange={e => setEditingProperty({...editingProperty, description: e.target.value})} rows={2} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Ubicación *</label>
                <input required className={styles.formInput} value={editingProperty.location || ''} onChange={e => setEditingProperty({...editingProperty, location: e.target.value})} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.8rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>m²</label>
                  <input className={styles.formInput} type="number" min="0" value={editingProperty.squareMeters || 0} onChange={e => setEditingProperty({...editingProperty, squareMeters: Number(e.target.value)})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Recámaras</label>
                  <input className={styles.formInput} type="number" min="0" value={editingProperty.bedrooms || 0} onChange={e => setEditingProperty({...editingProperty, bedrooms: Number(e.target.value)})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Baños</label>
                  <input className={styles.formInput} type="number" min="0" value={editingProperty.bathrooms || 0} onChange={e => setEditingProperty({...editingProperty, bathrooms: Number(e.target.value)})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Estacionamiento</label>
                  <input className={styles.formInput} type="number" min="0" value={editingProperty.parking || 0} onChange={e => setEditingProperty({...editingProperty, parking: Number(e.target.value)})} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Amenidades</label>
                <input className={styles.formInput} value={editingProperty.amenities || ''} onChange={e => setEditingProperty({...editingProperty, amenities: e.target.value})} placeholder="Alberca, Jardín, Gym..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Precio ($)</label>
                  <input required className={styles.formInput} type="number" min="0" value={editingProperty.price || 0} onChange={e => setEditingProperty({...editingProperty, price: Number(e.target.value)})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Estatus</label>
                  <select className={styles.formSelect} value={editingProperty.status || 'Disponible'} onChange={e => setEditingProperty({...editingProperty, status: e.target.value as PropertyRecord['status']})}>
                    <option value="Disponible">Disponible</option>
                    <option value="En renta/Para venta">En renta/Para venta</option>
                    <option value="Disponible para renta y venta">Renta y venta</option>
                    <option value="En Negociación">En Negociación</option>
                    <option value="Vendido">Vendido</option>
                    <option value="Oculto">Oculto</option>
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>📷 Imágenes de la propiedad</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  {(editingProperty.images || []).map(img => (
                    <div key={img.id} style={{ position: 'relative', width: '80px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                      <img src={img.dataUrl} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239,68,68,0.8)', border: 'none', color: '#fff', width: '18px', height: '18px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >✕</button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ width: '80px', height: '60px', borderRadius: '6px', border: '2px dashed var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                  >+</button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Máx 2MB por imagen. Formatos: JPG, PNG, WebP.</p>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
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
