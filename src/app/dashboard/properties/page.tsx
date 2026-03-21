"use client";

import { useState } from 'react';
import styles from '../Dashboard.module.css';

interface PropertyRecord {
  id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  status: 'Disponible' | 'En Negociación' | 'Vendido' | 'Oculto' | 'En renta/Para venta' | 'Disponible para renta y venta';
  views: number;
}

const initialProperties: PropertyRecord[] = [
  { id: 'PR-101', title: 'Villa Oceana - Lux', category: 'Casa', location: 'Costa del Sol', price: 2500000, status: 'Disponible', views: 420 },
  { id: 'PR-102', title: 'Penthouse Horizon', category: 'Departamento', location: 'Centro Financiero', price: 1200000, status: 'En Negociación', views: 850 },
  { id: 'PR-103', title: 'Mansion Serene', category: 'Casa', location: 'Valle Verde', price: 4800000, status: 'Vendido', views: 1200 },
  { id: 'PR-104', title: 'Local Comercial Centro', category: 'Comercial', location: 'Av. Principal', price: 850000, status: 'En renta/Para venta', views: 315 },
  { id: 'PR-105', title: 'Terreno Industrial Norte', category: 'Comercial', location: 'Parque Industrial', price: 5000000, status: 'Oculto', views: 45 },
  { id: 'PR-106', title: 'Casa Residencial Las Palmas', category: 'Casa', location: 'Zona Sur', price: 3400000, status: 'Disponible para renta y venta', views: 512 },
];

export default function PropertiesManagementPage() {
  const [properties, setProperties] = useState<PropertyRecord[]>(initialProperties);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Partial<PropertyRecord>>({});

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la propiedad ${id} del inventario? Esta acción no se puede deshacer.`)) {
      setProperties(properties.filter(p => p.id !== id));
    }
  };

  const handleOpenEdit = (property?: PropertyRecord) => {
    if (property) {
      setEditingProperty(property);
    } else {
      setEditingProperty({ 
        id: `PR-${Math.floor(Math.random() * 1000) + 200}`, 
        title: '', 
        category: 'Casa', 
        location: '', 
        price: 0, 
        status: 'Disponible', 
        views: 0 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty.id || !editingProperty.title) return;

    const exists = properties.some(p => p.id === editingProperty.id);
    if (exists) {
      setProperties(properties.map(p => p.id === editingProperty.id ? { ...p, ...editingProperty } as PropertyRecord : p));
    } else {
      setProperties([...properties, editingProperty as PropertyRecord]);
    }
    setIsModalOpen(false);
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Disponible': return { bg: 'rgba(74, 222, 128, 0.2)', text: '#4ade80' };
      case 'En Negociación': return { bg: 'rgba(241, 196, 15, 0.2)', text: '#f1c40f' };
      case 'Vendido': return { bg: 'rgba(239, 68, 68, 0.2)', text: '#f87171' };
      case 'En renta/Para venta': return { bg: 'rgba(56, 189, 248, 0.2)', text: '#38bdf8' }; // Light blue
      case 'Disponible para renta y venta': return { bg: 'rgba(168, 85, 247, 0.2)', text: '#a855f7' }; // Purple
      default: return { bg: 'rgba(255, 255, 255, 0.1)', text: 'var(--text-secondary)' };
    }
  };

  return (
    <div className={styles.container} style={{ position: 'relative' }}>
      <header className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1>Gestión de <span className="text-gradient-silver">Propiedades</span></h1>
          <p className={styles.subtitle}>Administración integral del inventario inmobiliario activo.</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => handleOpenEdit()}>+ Nueva Propiedad</button>
      </header>

      <div className={`glass-panel ${styles.dashboardCard}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 className={styles.cardTitle} style={{ margin: 0 }}>Catálogo de Inmuebles</h3>
          <input 
            type="text" 
            placeholder="Buscar por ID, nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff', minWidth: '250px' }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem' }}>ID</th>
                <th style={{ padding: '1rem' }}>Título y Ubicación</th>
                <th style={{ padding: '1rem' }}>Categoría</th>
                <th style={{ padding: '1rem' }}>Precio Base</th>
                <th style={{ padding: '1rem' }}>Estadísticas (Vistas)</th>
                <th style={{ padding: '1rem' }}>Estatus</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map(prop => {
                const statusStyle = getStatusStyle(prop.status);
                return (
                  <tr key={prop.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{prop.id}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{prop.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{prop.location}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{prop.category}</td>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-outfit)', fontWeight: 'bold', color: 'var(--accent-silver)' }}>
                      ${prop.price.toLocaleString('en-US')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{prop.views}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>clicks</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.3rem 0.6rem', 
                        borderRadius: '12px', 
                        fontSize: '0.8rem', 
                        fontWeight: 'bold',
                        background: statusStyle.bg,
                        color: statusStyle.text 
                      }}>
                        {prop.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button onClick={() => handleOpenEdit(prop)} style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', marginRight: '0.5rem' }}>Editar</button>
                      <button onClick={() => handleDelete(prop.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Eliminar</button>
                    </td>
                  </tr>
                );
              })}
              {filteredProperties.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No se encontraron propiedades que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edición / Creación */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className={`glass-panel`} style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
              {properties.some(p => p.id === editingProperty.id) ? 'Editar Propiedad' : 'Nueva Propiedad'}
            </h3>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>ID Propiedad</label>
                  <input required type="text" value={editingProperty.id || ''} onChange={(e) => setEditingProperty({...editingProperty, id: e.target.value})} disabled={properties.some(p => p.id === editingProperty.id)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Categoría</label>
                  <select value={editingProperty.category || 'Casa'} onChange={(e) => setEditingProperty({...editingProperty, category: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }}>
                    <option value="Casa" style={{color: '#0B0F19'}}>Casa</option>
                    <option value="Departamento" style={{color: '#0B0F19'}}>Departamento</option>
                    <option value="Comercial" style={{color: '#0B0F19'}}>Comercial</option>
                    <option value="Terreno" style={{color: '#0B0F19'}}>Terreno</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Título de Inmueble</label>
                <input required type="text" value={editingProperty.title || ''} onChange={(e) => setEditingProperty({...editingProperty, title: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Ubicación</label>
                <input required type="text" value={editingProperty.location || ''} onChange={(e) => setEditingProperty({...editingProperty, location: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Precio ($ USD / MXN)</label>
                  <input required type="number" min="0" value={editingProperty.price || 0} onChange={(e) => setEditingProperty({...editingProperty, price: Number(e.target.value)})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Estatus</label>
                  <select value={editingProperty.status || 'Disponible'} onChange={(e) => setEditingProperty({...editingProperty, status: e.target.value as any})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }}>
                    <option value="Disponible" style={{color: '#0B0F19'}}>Disponible</option>
                    <option value="En renta/Para venta" style={{color: '#0B0F19'}}>En renta/Para venta</option>
                    <option value="Disponible para renta y venta" style={{color: '#0B0F19'}}>Disponible para renta y venta</option>
                    <option value="En Negociación" style={{color: '#0B0F19'}}>En Negociación</option>
                    <option value="Vendido" style={{color: '#0B0F19'}}>Vendido</option>
                    <option value="Oculto" style={{color: '#0B0F19'}}>Oculto</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, background: 'var(--accent-silver)', color: '#0B0F19', border: 'none', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s ease' }}>Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
