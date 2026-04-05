"use client";

import { useState, useEffect } from 'react';
import styles from '../Dashboard.module.css';
import { AboutDB, ActivityLogDB, type AboutContent } from '../../../lib/database';
import { useAuth } from '../../../context/AuthContext';

export default function AboutEditorPage() {
  const { email: userEmail, fullName, isAdmin } = useAuth();
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [saved, setSaved] = useState(false);
  const [newValueTitle, setNewValueTitle] = useState('');
  const [newValueDesc, setNewValueDesc] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamRole, setNewTeamRole] = useState('');
  const [newTeamStrength, setNewTeamStrength] = useState('');

  useEffect(() => {
    setAbout(AboutDB.get());
  }, []);

  if (!about) return <div>Cargando...</div>;

  const handleSave = () => {
    AboutDB.save({ ...about, updatedBy: userEmail || '', updatedAt: Date.now() });
    ActivityLogDB.add({ userEmail: userEmail || '', userName: fullName || '', action: 'ABOUT_UPDATED', details: 'Sección Nosotros actualizada', module: 'about' });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const addValue = () => {
    if (newValueTitle.trim()) {
      setAbout({ ...about, values: [...about.values, { title: newValueTitle.trim(), description: newValueDesc.trim() }] });
      setNewValueTitle('');
      setNewValueDesc('');
    }
  };

  const removeValue = (idx: number) => {
    setAbout({ ...about, values: about.values.filter((_, i) => i !== idx) });
  };

  const addTeamMember = () => {
    if (newTeamName.trim()) {
      const newId = Math.max(...about.team.map(t => t.id), 0) + 1;
      setAbout({ ...about, team: [...about.team, { id: newId, name: newTeamName.trim(), role: newTeamRole.trim(), strength: newTeamStrength.trim() }] });
      setNewTeamName('');
      setNewTeamRole('');
      setNewTeamStrength('');
    }
  };

  const removeTeamMember = (id: number) => {
    setAbout({ ...about, team: about.team.filter(t => t.id !== id) });
  };

  if (!isAdmin) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
        <h2>Acceso Restringido</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Solo los administradores pueden editar la sección Nosotros.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1>Editor <span className="text-gradient-silver">Nosotros</span></h1>
          <p className={styles.subtitle}>Modifica la misión, visión, valores y equipo que aparecen en la página pública.</p>
        </div>
        <button className={styles.primaryBtn} onClick={handleSave}>
          {saved ? '✅ Guardado!' : '💾 Guardar Cambios'}
        </button>
      </header>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {/* Mission */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>🎯 Misión</h3>
          <textarea
            className={styles.formTextarea}
            value={about.mission}
            onChange={e => setAbout({ ...about, mission: e.target.value })}
            rows={4}
          />
        </div>

        {/* Vision */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>🔭 Visión</h3>
          <textarea
            className={styles.formTextarea}
            value={about.vision}
            onChange={e => setAbout({ ...about, vision: e.target.value })}
            rows={4}
          />
        </div>

        {/* Values */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>💎 Valores</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem' }}>
            {about.values.map((val, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', padding: '0.6rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div style={{ flex: 1 }}>
                  <input className={styles.formInput} value={val.title} onChange={e => {
                    const newVals = [...about.values];
                    newVals[idx] = { ...newVals[idx], title: e.target.value };
                    setAbout({ ...about, values: newVals });
                  }} style={{ marginBottom: '0.3rem', fontWeight: 'bold' }} />
                  <input className={styles.formInput} value={val.description} onChange={e => {
                    const newVals = [...about.values];
                    newVals[idx] = { ...newVals[idx], description: e.target.value };
                    setAbout({ ...about, values: newVals });
                  }} />
                </div>
                <button type="button" onClick={() => removeValue(idx)} className={styles.dangerBtn} style={{ padding: '0.4rem 0.6rem' }}>🗑️</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input className={styles.formInput} placeholder="Título del valor" value={newValueTitle} onChange={e => setNewValueTitle(e.target.value)} style={{ flex: 1, minWidth: '150px' }} />
            <input className={styles.formInput} placeholder="Descripción" value={newValueDesc} onChange={e => setNewValueDesc(e.target.value)} style={{ flex: 2, minWidth: '200px' }} />
            <button type="button" onClick={addValue} className={styles.secondaryBtn}>+ Agregar</button>
          </div>
        </div>

        {/* Team */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>👥 Equipo</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.8rem', marginBottom: '1rem' }}>
            {about.team.map(member => (
              <div key={member.id} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <input className={styles.formInput} value={member.name} onChange={e => {
                      setAbout({ ...about, team: about.team.map(t => t.id === member.id ? { ...t, name: e.target.value } : t) });
                    }} style={{ fontWeight: 'bold', marginBottom: '0.3rem' }} />
                    <input className={styles.formInput} value={member.role} onChange={e => {
                      setAbout({ ...about, team: about.team.map(t => t.id === member.id ? { ...t, role: e.target.value } : t) });
                    }} style={{ fontSize: '0.85rem', marginBottom: '0.3rem' }} />
                    <input className={styles.formInput} value={member.strength} onChange={e => {
                      setAbout({ ...about, team: about.team.map(t => t.id === member.id ? { ...t, strength: e.target.value } : t) });
                    }} style={{ fontSize: '0.82rem' }} />
                  </div>
                  <button type="button" onClick={() => removeTeamMember(member.id)} className={styles.dangerBtn} style={{ padding: '0.3rem 0.5rem', fontSize: '0.72rem', marginLeft: '0.5rem' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: '0.5rem', alignItems: 'end' }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nombre</label>
              <input className={styles.formInput} value={newTeamName} onChange={e => setNewTeamName(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Rol</label>
              <input className={styles.formInput} value={newTeamRole} onChange={e => setNewTeamRole(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fortaleza</label>
              <input className={styles.formInput} value={newTeamStrength} onChange={e => setNewTeamStrength(e.target.value)} />
            </div>
            <button type="button" onClick={addTeamMember} className={styles.secondaryBtn} style={{ height: '38px' }}>+ Agregar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
