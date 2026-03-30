"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { useAuth } from '../../context/AuthContext';
import { LeadsDB, PropertiesDB, AppointmentsDB, ActivityLogDB, QuickNotesDB, type QuickNote } from '../../lib/database';

export default function DashboardHome() {
  const { email, fullName, role } = useAuth();
  const [period, setPeriod] = useState('week');
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [newNote, setNewNote] = useState('');

  // Load real data
  const leads = LeadsDB.getAll();
  const properties = PropertiesDB.getAll();
  const appointments = AppointmentsDB.getAll();
  const logs = ActivityLogDB.getRecent(10);
  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today);

  useEffect(() => {
    setQuickNotes(QuickNotesDB.getAll().filter(n => n.createdBy === email));
  }, [email]);

  const addNote = () => {
    if (newNote.trim()) {
      QuickNotesDB.add({ text: newNote.trim(), color: '#f1c40f', createdBy: email || '' });
      setQuickNotes(QuickNotesDB.getAll().filter(n => n.createdBy === email));
      setNewNote('');
    }
  };

  const deleteNote = (id: string) => {
    QuickNotesDB.delete(id);
    setQuickNotes(QuickNotesDB.getAll().filter(n => n.createdBy === email));
  };

  // Computed metrics
  const activeLeads = leads.filter(l => l.status !== 'cerrados');
  const closedLeads = leads.filter(l => l.status === 'cerrados');
  const negotiationLeads = leads.filter(l => l.status === 'negociacion');
  const activeProperties = properties.filter(p => p.status !== 'Oculto' && p.status !== 'Vendido');
  const totalViews = properties.reduce((acc, p) => acc + (p.views || 0), 0);
  const priorityLeads = leads.filter(l => l.priority === 'alta' && l.status !== 'cerrados').slice(0, 5);

  // Revenue estimate (from closed deals)
  const portfolioValue = properties.reduce((acc, p) => acc + (p.price || 0), 0);

  const quickAccessCards = [
    { icon: '🎯', title: 'Pipeline CRM', desc: 'Gestiona leads con campos técnicos inmobiliarios', stat: `${activeLeads.length} activos`, statColor: '#38bdf8', href: '/dashboard/leads', bgColor: 'rgba(56, 189, 248, 0.08)' },
    { icon: '🏠', title: 'Propiedades', desc: 'Inventario con imágenes y estadísticas reales', stat: `${activeProperties.length} disponibles`, statColor: '#4ade80', href: '/dashboard/properties', bgColor: 'rgba(74, 222, 128, 0.08)' },
    { icon: '📅', title: 'Calendario', desc: 'Agenda citas, visitas y reuniones', stat: `${todayAppts.length} hoy`, statColor: '#f59e0b', href: '/dashboard/calendar', bgColor: 'rgba(245, 158, 11, 0.08)' },
    { icon: '🎓', title: 'Academia CMS', desc: 'Gestiona artículos, infografías y cursos', stat: 'Contenido educativo', statColor: '#a855f7', href: '/dashboard/academy', bgColor: 'rgba(168, 85, 247, 0.08)' },
    { icon: '📋', title: 'Reportes', desc: 'Genera reporte semanal de actividades', stat: 'Viernes ready', statColor: '#ec4899', href: '/dashboard/reports', bgColor: 'rgba(236, 72, 153, 0.08)' },
    ...(role === 'admin' ? [{ icon: '✏️', title: 'Editor Nosotros', desc: 'Modifica la sección pública de la empresa', stat: 'Admin only', statColor: '#64748b', href: '/dashboard/about-editor', bgColor: 'rgba(100, 116, 139, 0.08)' }] : []),
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className={styles.container}>
      {/* Welcome Banner */}
      <div className={styles.welcomeBanner}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.3rem', fontFamily: 'var(--font-outfit)' }}>
            {getGreeting()}, <span className="text-gradient-silver">{fullName?.split(' ')[0] || 'Asesor'}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {todayAppts.length > 0 && <span> • <strong style={{ color: '#f59e0b' }}>{todayAppts.length} citas hoy</strong></span>}
          </p>
        </div>
        <Link href="/dashboard/reports" className={styles.secondaryBtn}>
          📊 Generar Reporte Semanal
        </Link>
      </div>

      {/* Metrics Grid — REAL DATA */}
      <div className={styles.metricsGrid}>
        <div className={`glass-panel ${styles.metricCard}`}>
          <div className={styles.metricTitle}>
            <span>Leads Activos</span>
            <span style={{ fontSize: '1.2rem' }}>🎯</span>
          </div>
          <div className={styles.metricValue}>{activeLeads.length}</div>
          <div className={`${styles.trend} ${styles.up}`}>
            {negotiationLeads.length} en negociación
          </div>
        </div>
        <div className={`glass-panel ${styles.metricCard}`}>
          <div className={styles.metricTitle}>
            <span>Citas Hoy</span>
            <span style={{ fontSize: '1.2rem' }}>📅</span>
          </div>
          <div className={styles.metricValue}>{todayAppts.length}</div>
          <div className={`${styles.trend} ${styles.up}`}>
            {appointments.filter(a => !a.completed).length} pendientes total
          </div>
        </div>
        <div className={`glass-panel ${styles.metricCard}`}>
          <div className={styles.metricTitle}>
            <span>Propiedades Activas</span>
            <span style={{ fontSize: '1.2rem' }}>🏠</span>
          </div>
          <div className={styles.metricValue}>{activeProperties.length}</div>
          <div className={`${styles.trend} ${styles.up}`}>
            {totalViews.toLocaleString()} vistas totales
          </div>
        </div>
        <div className={`glass-panel ${styles.metricCard}`}>
          <div className={styles.metricTitle}>
            <span>Cierres</span>
            <span style={{ fontSize: '1.2rem' }}>✅</span>
          </div>
          <div className={styles.metricValue} style={{ color: '#4ade80' }}>{closedLeads.length}</div>
          <div className={`${styles.trend} ${styles.up}`}>
            Deals completados
          </div>
        </div>
        <div className={`glass-panel ${styles.metricCard}`}>
          <div className={styles.metricTitle}>
            <span>Valor Portafolio</span>
            <span style={{ fontSize: '1.2rem' }}>💰</span>
          </div>
          <div className={styles.metricValue} style={{ fontSize: '1.5rem' }}>
            ${(portfolioValue / 1000000).toFixed(1)}M
          </div>
          <div className={`${styles.trend} ${styles.up}`}>Valor total inventario</div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-outfit)', marginBottom: '1rem' }}>⚡ Acceso Rápido</h3>
      <div className={styles.quickAccessGrid}>
        {quickAccessCards.map((card) => (
          <Link key={card.href} href={card.href} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.quickAccessCard} style={{ background: card.bgColor }}>
              <div className={styles.quickAccessIcon}>{card.icon}</div>
              <div className={styles.quickAccessTitle}>{card.title}</div>
              <div className={styles.quickAccessDesc}>{card.desc}</div>
              <div className={styles.quickAccessStat}>
                <span style={{ color: card.statColor }}>{card.stat}</span>
                <span className={styles.quickAccessArrow}>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Insights Grid */}
      <div className={styles.insightsSection}>
        {/* Priority Leads */}
        <div className={`glass-panel ${styles.leadsPanel}`}>
          <div className={styles.sectionTitle}>🔥 Leads Prioritarios</div>
          {priorityLeads.length > 0 ? (
            priorityLeads.map(lead => (
              <div key={lead.id} className={styles.leadItem}>
                <div className={styles.leadInfo}>
                  <h4>{lead.name}</h4>
                  <p>{lead.interest} • {lead.advisor}</p>
                  <p style={{ fontSize: '0.72rem' }}>
                    📞 Siguiente: {lead.nextAction || 'Sin acción definida'}
                    {lead.nextActionDate && <span> ({lead.nextActionDate})</span>}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                  <span className={styles.score}>★ {lead.score}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{lead.progressPercent}%</span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>Sin leads de alta prioridad.</p>
          )}
        </div>

        {/* Today's Appointments + Quick Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Today's Appointments */}
          <div className={`glass-panel ${styles.aiAlerts}`}>
            <div className={styles.sectionTitle}>📅 Agenda del Día</div>
            {todayAppts.length > 0 ? (
              todayAppts.map(appt => (
                <div key={appt.id} className={styles.alertItem} style={{ borderLeftColor: appt.color }}>
                  <h5>{appt.title}</h5>
                  <p>🕐 {appt.time} - {appt.endTime} • 👤 {appt.client}</p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0', fontSize: '0.85rem' }}>Sin citas para hoy.</p>
            )}
          </div>

          {/* Quick Notes */}
          <div className={`glass-panel ${styles.aiAlerts}`}>
            <div className={styles.sectionTitle}>📌 Notas Rápidas</div>
            <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.5rem' }}>
              <input
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addNote(); }}
                placeholder="Agregar nota..."
                style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
              />
              <button onClick={addNote} style={{ background: 'var(--accent-silver)', color: '#0B0F19', border: 'none', padding: '0.5rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.82rem' }}>+</button>
            </div>
            {quickNotes.slice(0, 5).map(note => (
              <div key={note.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem', background: 'rgba(241, 196, 15, 0.05)', borderRadius: '6px', marginBottom: '0.2rem', borderLeft: '2px solid #f1c40f' }}>
                <span style={{ fontSize: '0.82rem', paddingLeft: '0.3rem' }}>{note.text}</span>
                <button onClick={() => deleteNote(note.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className={`glass-panel ${styles.dashboardCard}`} style={{ marginTop: '1.5rem' }}>
        <div className={styles.sectionTitle}>📜 Actividad Reciente</div>
        {logs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {logs.map(log => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: 'var(--accent-silver)', fontWeight: 'bold', marginRight: '0.4rem' }}>{log.action}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{log.details}</span>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                  {new Date(log.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>Sin actividad registrada aún.</p>
        )}
      </div>
    </div>
  );
}
