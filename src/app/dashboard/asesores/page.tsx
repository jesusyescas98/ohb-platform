"use client";

import { useState, useEffect } from 'react';
import styles from '../Dashboard.module.css';
import { UsersDB, AdvisorStatsDB, type UserProfile, type AdvisorStatRecord } from '../../../lib/database';
import { useAuth } from '../../../context/AuthContext';

export default function AsesoresControlPage() {
  const { isAdmin } = useAuth();
  const [asesores, setAsesores] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<Record<string, AdvisorStatRecord>>({});
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AdvisorStatRecord | null>(null);

  useEffect(() => {
    const loadData = () => {
      const users = UsersDB.getAll();
      const onlyAsesores = users.filter((u) => u.role === 'asesor');
      setAsesores(onlyAsesores);

      const allStats = AdvisorStatsDB.getAll();
      const statsMap: Record<string, AdvisorStatRecord> = {};
      allStats.forEach((s) => {
        statsMap[s.id] = s;
      });
      setStats(statsMap);
    };

    loadData();
    window.addEventListener('db_updated', loadData);
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('db_updated', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, []);

  const handleOpenEdit = (asesor: UserProfile) => {
    const currentStats = stats[asesor.email] || {
      id: asesor.email,
      ventas: 0,
      rentas: 0,
      captaciones: 0,
      inversiones: 0,
      salidas: 0,
      updatedAt: Date.now()
    };
    setEditForm(currentStats);
    setEditingEmail(asesor.email);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm && editForm.id) {
      AdvisorStatsDB.upsert(editForm);
      setEditingEmail(null);
      setEditForm(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className={styles.container}>
        <h2>Acceso Denegado</h2>
        <p>Solo los administradores pueden ver esta sección.</p>
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ position: 'relative' }}>
      <header className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1>Control de <span className="text-gradient-silver">Asesores</span></h1>
          <p className={styles.subtitle}>Supervisión de KPIs y actividades de los asesores inmobiliarios</p>
        </div>
      </header>

      <div className={`glass-panel ${styles.dashboardCard}`}>
        <h3 className={styles.cardTitle}>Rendimiento del Equipo</h3>
        <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem' }}>Asesor</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Ventas</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Rentas</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Captaciones</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Inversiones Captadas</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Salidas a Campo</th>
                <th style={{ padding: '1rem' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asesores.map((asesor) => {
                const s = stats[asesor.email] || { ventas: 0, rentas: 0, captaciones: 0, inversiones: 0, salidas: 0 };
                return (
                  <tr key={asesor.email} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold' }}>{asesor.fullName || 'Asesor Sin Nombre'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{asesor.email}</div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '1.1rem' }}>
                      <span style={{ color: s.ventas > 0 ? '#4ade80' : 'var(--text-secondary)' }}>{s.ventas}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '1.1rem' }}>
                      <span style={{ color: s.rentas > 0 ? '#38bdf8' : 'var(--text-secondary)' }}>{s.rentas}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '1.1rem' }}>
                      <span style={{ color: s.captaciones > 0 ? '#fcd34d' : 'var(--text-secondary)' }}>{s.captaciones}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '1.1rem' }}>
                      <span style={{ color: s.inversiones > 0 ? '#c084fc' : 'var(--text-secondary)' }}>{s.inversiones}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '1.1rem' }}>
                      <span style={{ color: s.salidas > 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{s.salidas}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button 
                        onClick={() => handleOpenEdit(asesor)}
                        style={{ background: 'var(--accent-silver)', color: '#0B0F19', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        Actualizar KPIs
                      </button>
                    </td>
                  </tr>
                );
              })}
              {asesores.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay asesores registrados en la plataforma.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingEmail && editForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Actualizar métricas del asesor</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{asesores.find(a => a.email === editingEmail)?.fullName || editingEmail}</p>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Ventas</label>
                  <input required min="0" type="number" value={editForm.ventas} onChange={(e) => setEditForm({...editForm, ventas: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Rentas</label>
                  <input required min="0" type="number" value={editForm.rentas} onChange={(e) => setEditForm({...editForm, rentas: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Captaciones</label>
                  <input required min="0" type="number" value={editForm.captaciones} onChange={(e) => setEditForm({...editForm, captaciones: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Inversiones Captadas</label>
                  <input required min="0" type="number" value={editForm.inversiones} onChange={(e) => setEditForm({...editForm, inversiones: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Salidas a Campo</label>
                <input required min="0" type="number" value={editForm.salidas} onChange={(e) => setEditForm({...editForm, salidas: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => { setEditingEmail(null); setEditForm(null); }} style={{ flex: 1, background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, background: 'var(--accent-silver)', color: '#0B0F19', border: 'none', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar KPIs</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
