"use client";

import { useState, useEffect } from 'react';
import styles from '../Dashboard.module.css';
import { UsersDB, type UserProfile } from '../../../lib/database';
import { useAuth } from '../../../context/AuthContext';

export default function UsuariosControlPage() {
  const { isAdmin, email: currentEmail } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<'admin' | 'asesor' | 'cliente'>('cliente');

  useEffect(() => {
    const loadData = () => {
      setUsers(UsersDB.getAll());
    };

    loadData();
    window.addEventListener('db_updated', loadData);
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('db_updated', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, []);

  const handleOpenEdit = (user: UserProfile) => {
    setEditRole(user.role);
    setEditingEmail(user.email);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmail) return;

    // We can't let the primary admin change their own role to prevent lockout
    if (editingEmail === 'jyeskas1111@gmail.com' && editRole !== 'admin') {
      alert("No se puede revocar el acceso del administrador principal.");
      return;
    }

    const userToUpdate = users.find(u => u.email === editingEmail);
    if (userToUpdate) {
      UsersDB.upsert({ ...userToUpdate, role: editRole });
      setEditingEmail(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className={styles.container}>
        <h2>Acceso Denegado</h2>
        <p>Solo los administradores pueden ver y editar funciones de los usuarios.</p>
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ position: 'relative' }}>
      <header className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1>Gestión de <span className="text-gradient-silver">Usuarios</span></h1>
          <p className={styles.subtitle}>Control de accesos, roles y permisos en la plataforma</p>
        </div>
      </header>

      <div className={`glass-panel ${styles.dashboardCard}`}>
        <h3 className={styles.cardTitle}>Usuarios Registrados</h3>
        <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem' }}>Usuario</th>
                <th style={{ padding: '1rem' }}>Correo / Email</th>
                <th style={{ padding: '1rem' }}>Teléfono</th>
                <th style={{ padding: '1rem' }}>Rol</th>
                <th style={{ padding: '1rem' }}>Último Acceso</th>
                <th style={{ padding: '1rem' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{user.fullName || 'Sin Nombre'}</td>
                  <td style={{ padding: '1rem' }}>{user.email}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.phone || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.3rem 0.6rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      background: user.role === 'admin' ? 'rgba(56, 189, 248, 0.2)' : user.role === 'asesor' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255,255,255,0.1)',
                      color: user.role === 'admin' ? '#38bdf8' : user.role === 'asesor' ? '#4ade80' : 'var(--text-secondary)',
                      textTransform: 'capitalize'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => handleOpenEdit(user)}
                      style={{ background: 'var(--accent-silver)', color: '#0B0F19', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      Modificar Rol
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay usuarios registrados en la plataforma.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingEmail && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Asignar Permisos</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Editando rol de: <strong style={{color: 'white'}}>{editingEmail}</strong></p>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Nivel de Acceso</label>
                <select 
                  value={editRole} 
                  onChange={(e) => setEditRole(e.target.value as 'admin' | 'asesor' | 'cliente')}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }}
                >
                  <option value="cliente" style={{color: '#0B0F19'}}>Cliente (Público)</option>
                  <option value="asesor" style={{color: '#0B0F19'}}>Asesor Comercial</option>
                  <option value="admin" style={{color: '#0B0F19'}}>Administrador (Control Total)</option>
                </select>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  {editRole === 'admin' && 'Al asignar el rol de administrador, este usuario podrá modificar todo en el sistema.'}
                  {editRole === 'asesor' && 'El asesor podrá crear reportes, modificar propiedades y manejar leads y llaves.'}
                  {editRole === 'cliente' && 'El cliente podrá navegar, ver los cursos y descargar contenido bloqueado si pagó.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEditingEmail(null)} style={{ flex: 1, background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, background: 'var(--accent-silver)', color: '#0B0F19', border: 'none', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Actualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
