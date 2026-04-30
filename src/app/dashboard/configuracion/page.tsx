"use client";

import { useState } from 'react';
import styles from '../Dashboard.module.css';
import { useAuth } from '../../../context/AuthContext';
import { UsersDB } from '../../../lib/database';

interface CommissionTier {
  name: string;
  minTransactions: number;
  percentage: number;
}

export default function ConfiguracionPage() {
  const { role } = useAuth();
  const [commissionTiers, setCommissionTiers] = useState<CommissionTier[]>([
    { name: 'Junior', minTransactions: 0, percentage: 2.5 },
    { name: 'Senior', minTransactions: 5, percentage: 3 },
    { name: 'Elite', minTransactions: 15, percentage: 4 },
  ]);

  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: 'Carlos M.', email: 'carlos@ohb.com', role: 'asesor', status: 'activo' },
    { id: '2', name: 'Ana P.', email: 'ana@ohb.com', role: 'asesor', status: 'activo' },
    { id: '3', name: 'Luis G.', email: 'luis@ohb.com', role: 'asesor', status: 'activo' },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'asesor' });

  const handleAddMember = () => {
    if (newMember.name && newMember.email) {
      setTeamMembers([
        ...teamMembers,
        {
          id: String(teamMembers.length + 1),
          ...newMember,
          status: 'activo',
        },
      ]);
      setNewMember({ name: '', email: '', role: 'asesor' });
      setShowForm(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>⚙️ Configuración</h1>
          <p className={styles.subtitle}>Gestión de comisiones, equipo y configuración de la plataforma</p>
        </div>
      </div>

      {/* Commission Tiers */}
      {role === 'admin' && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
          <div className={styles.sectionTitle}>💰 Estructura de Comisiones</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
          }}>
            {commissionTiers.map((tier, idx) => (
              <div key={idx} style={{
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '10px',
                border: '1px solid var(--glass-border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.3rem' }}>
                      {tier.name}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {tier.minTransactions}+ transacciones
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(249, 158, 11, 0.2)',
                    color: '#f59e0b',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                  }}>
                    {tier.percentage}%
                  </div>
                </div>
                <button className={styles.toolbarBtn} style={{ width: '100%' }}>
                  ✏️ Editar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Management */}
      {role === 'admin' && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div className={styles.sectionTitle} style={{ marginBottom: 0 }}>👥 Gestión de Equipo</div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={styles.primaryBtn}
              style={{ margin: 0 }}
            >
              ➕ Agregar Miembro
            </button>
          </div>

          {showForm && (
            <div style={{
              padding: '1.5rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              border: '1px solid var(--glass-border)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nombre Completo</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Ej: Carlos Martínez"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Correo Electrónico</label>
                  <input
                    type="email"
                    className={styles.formInput}
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="correo@ohb.com"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Rol</label>
                  <select
                    className={styles.formSelect}
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  >
                    <option value="asesor">Asesor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button onClick={handleAddMember} className={styles.primaryBtn}>
                  Guardar
                </button>
                <button onClick={() => setShowForm(false)} className={styles.toolbarBtn}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Team Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.85rem',
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                  <th style={{ padding: '0.8rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Nombre</th>
                  <th style={{ padding: '0.8rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Email</th>
                  <th style={{ padding: '0.8rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Rol</th>
                  <th style={{ padding: '0.8rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Estado</th>
                  <th style={{ padding: '0.8rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map(member => (
                  <tr key={member.id} style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <td style={{ padding: '0.8rem' }}><strong>{member.name}</strong></td>
                    <td style={{ padding: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{member.email}</td>
                    <td style={{ padding: '0.8rem' }}>
                      <span style={{
                        background: 'rgba(168, 85, 247, 0.1)',
                        color: '#a855f7',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                      }}>
                        {member.role === 'admin' ? '👨‍💼 Admin' : '👤 Asesor'}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                      <span style={{
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#10b981',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                      }}>
                        Activo
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                      <button className={styles.dangerBtn}>Deactivar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Business Settings */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <div className={styles.sectionTitle}>🏢 Información de la Empresa</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nombre de la Empresa</label>
            <input
              type="text"
              className={styles.formInput}
              defaultValue="OHB Asesorías y Consultorías"
              disabled
              style={{ opacity: 0.6 }}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email de Contacto</label>
            <input
              type="email"
              className={styles.formInput}
              defaultValue="jyeskas1111@gmail.com"
              disabled
              style={{ opacity: 0.6 }}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Teléfono WhatsApp</label>
            <input
              type="text"
              className={styles.formInput}
              defaultValue="+526561327685"
              disabled
              style={{ opacity: 0.6 }}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Ubicación</label>
            <input
              type="text"
              className={styles.formInput}
              defaultValue="Tomás Fernández #7818, Juárez, Chihuahua"
              disabled
              style={{ opacity: 0.6 }}
            />
          </div>
        </div>
      </div>

      {/* Platform Settings */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <div className={styles.sectionTitle}>⚙️ Configuración de Plataforma</div>
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            border: '1px solid var(--glass-border)',
          }}>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '0.2rem' }}>Sync a Supabase</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Sincronizar datos con base de datos en la nube
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
              <input type="checkbox" defaultChecked style={{ display: 'none' }} />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: '#10b981',
                transition: '.3s',
                borderRadius: '24px',
              }} />
            </label>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            border: '1px solid var(--glass-border)',
          }}>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '0.2rem' }}>Notificaciones por Email</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Recibir alertas de nuevos leads y transacciones
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
              <input type="checkbox" defaultChecked style={{ display: 'none' }} />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: '#10b981',
                transition: '.3s',
                borderRadius: '24px',
              }} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
