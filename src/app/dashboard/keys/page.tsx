"use client";

import { useState } from 'react';
import styles from '../Dashboard.module.css';

interface KeyRecord {
  id: string;
  property: string;
  type: string;
  assignedTo: string;
  status: string;
  dateOut: string;
}

const initialKeys: KeyRecord[] = [
  { id: 'K001', property: 'Paseo de las Lomas #442', type: 'Casa', assignedTo: 'Maximiliano Torres', status: 'En uso', dateOut: '2026-03-05' },
  { id: 'K002', property: 'Península Residencial', type: 'Departamento', assignedTo: 'Disponible', status: 'En oficina', dateOut: '-' },
  { id: 'K003', property: 'Bodega Industrial 4', type: 'Comercial', assignedTo: 'Ricardo Silva', status: 'En uso', dateOut: '2026-03-01' },
  { id: 'K004', property: 'Valle del Sol #120', type: 'Casa', assignedTo: 'Jorge Ramírez', status: 'En uso', dateOut: '2026-03-06' },
  { id: 'K005', property: 'Torre Vértice Of. 7', type: 'Oficina', assignedTo: 'Disponible', status: 'En oficina', dateOut: '-' },
];

export default function KeysControlPage() {
  const [keys, setKeys] = useState<KeyRecord[]>(initialKeys);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isLendModalOpen, setLendModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<Partial<KeyRecord>>({});
  const [lendingKey, setLendingKey] = useState<KeyRecord | null>(null);

  const handleReturnKey = (id: string) => {
    setKeys(keys.map(k => k.id === id ? { ...k, status: 'En oficina', assignedTo: 'Disponible', dateOut: '-' } : k));
  };

  const handleOpenEdit = (key?: KeyRecord) => {
    if (key) {
      setEditingKey(key);
    } else {
      setEditingKey({ id: '', property: '', type: 'Casa', assignedTo: 'Disponible', status: 'En oficina', dateOut: '-' });
    }
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey.id || !editingKey.property) return;
    
    const exists = keys.some(k => k.id === editingKey.id);
    if (exists) {
      setKeys(keys.map(k => k.id === editingKey.id ? { ...k, ...editingKey } : k));
    } else {
      setKeys([...keys, editingKey as KeyRecord]);
    }
    setEditModalOpen(false);
  };

  const handleOpenLend = (key: KeyRecord) => {
    setLendingKey(key);
    setLendModalOpen(true);
  };

  const handleSaveLend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lendingKey) return;
    const form = e.target as HTMLFormElement;
    const assignedTo = (form.elements.namedItem('assignedTo') as HTMLInputElement).value;
    const dateOut = (form.elements.namedItem('dateOut') as HTMLInputElement).value;
    
    setKeys(keys.map(k => k.id === lendingKey.id ? { ...k, status: 'En uso', assignedTo, dateOut } : k));
    setLendModalOpen(false);
  };

  return (
    <div className={styles.container} style={{ position: 'relative' }}>
      <header className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1>Control de <span className="text-gradient-silver">Llaves</span></h1>
          <p className={styles.subtitle}>Gestión y rastreo de llaves físicas y accesos (Solo Asesores/Admins)</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => handleOpenEdit()}>+ Registrar Llave</button>
      </header>

      <div className={`glass-panel ${styles.dashboardCard}`}>
        <h3 className={styles.cardTitle}>Inventario de Llaves</h3>
        <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem' }}>ID Llave</th>
                <th style={{ padding: '1rem' }}>Propiedad</th>
                <th style={{ padding: '1rem' }}>Tipo</th>
                <th style={{ padding: '1rem' }}>Estado</th>
                <th style={{ padding: '1rem' }}>Asignada A</th>
                <th style={{ padding: '1rem' }}>Fecha Salida</th>
                <th style={{ padding: '1rem' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {keys.map(key => (
                <tr key={key.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{key.id}</td>
                  <td style={{ padding: '1rem' }}>{key.property}</td>
                  <td style={{ padding: '1rem' }}>{key.type}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.3rem 0.6rem', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem', 
                      background: key.status === 'En oficina' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: key.status === 'En oficina' ? '#4ade80' : '#f87171' 
                    }}>
                      {key.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: key.status === 'En oficina' ? 'var(--text-secondary)' : '#fff' }}>{key.assignedTo}</td>
                  <td style={{ padding: '1rem' }}>{key.dateOut}</td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {key.status === 'En uso' ? (
                      <button onClick={() => handleReturnKey(key.id)} style={{ background: 'var(--glass-bg)', color: '#fff', border: '1px solid var(--glass-border)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Marcar Devolución</button>
                    ) : (
                      <button onClick={() => handleOpenLend(key)} style={{ background: 'var(--accent-silver)', color: '#0B0F19', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Prestar Llave</button>
                    )}
                    <button onClick={() => handleOpenEdit(key)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Editar</button>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay llaves registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className={`glass-panel`} style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>{keys.some(k => k.id === editingKey.id) ? 'Editar Llave' : 'Registrar Llave'}</h3>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>ID de Llave</label>
                <input required type="text" value={editingKey.id || ''} onChange={(e) => setEditingKey({...editingKey, id: e.target.value})} disabled={keys.some(k => k.id === editingKey.id)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Propiedad / Unidad</label>
                <input required type="text" value={editingKey.property || ''} onChange={(e) => setEditingKey({...editingKey, property: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tipo</label>
                <select value={editingKey.type || 'Casa'} onChange={(e) => setEditingKey({...editingKey, type: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }}>
                  <option value="Casa" style={{color: '#0B0F19'}}>Casa</option>
                  <option value="Departamento" style={{color: '#0B0F19'}}>Departamento</option>
                  <option value="Oficina" style={{color: '#0B0F19'}}>Oficina</option>
                  <option value="Comercial" style={{color: '#0B0F19'}}>Comercial</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEditModalOpen(false)} style={{ flex: 1, background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, background: 'var(--accent-silver)', color: '#0B0F19', border: 'none', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLendModalOpen && lendingKey && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className={`glass-panel`} style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Prestar Llave {lendingKey.id}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{lendingKey.property}</p>
            <form onSubmit={handleSaveLend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Asignar A (Asesor o Cliente)</label>
                <input required name="assignedTo" type="text" placeholder="Nombre completo" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Fecha de Salida</label>
                <input required name="dateOut" type="date" defaultValue={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setLendModalOpen(false)} style={{ flex: 1, background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, background: 'var(--accent-silver)', color: '#0B0F19', border: 'none', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Prestar y Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
