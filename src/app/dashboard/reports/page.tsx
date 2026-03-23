"use client";

import { useState, useEffect } from 'react';
import styles from '../Dashboard.module.css';
import { WeeklyReportsDB, LeadsDB, AppointmentsDB, ActivityLogDB, PropertiesDB, type WeeklyReport } from '../../../lib/database';
import { useAuth } from '../../../context/AuthContext';

export default function ReportsPage() {
  const { email: userEmail, fullName } = useAuth();
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [generating, setGenerating] = useState(false);
  const [viewingReport, setViewingReport] = useState<WeeklyReport | null>(null);

  useEffect(() => {
    setReports(WeeklyReportsDB.getAll());
  }, []);

  // Current stats for quick overview
  const leads = LeadsDB.getAll();
  const appointments = AppointmentsDB.getAll();
  const properties = PropertiesDB.getAll();
  const recentLogs = ActivityLogDB.getRecent(50);

  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const weekStartStr = startOfWeek.toISOString().split('T')[0];

  const thisWeekLeads = leads.filter(l => l.createdAt >= startOfWeek.getTime());
  const thisWeekClosed = leads.filter(l => l.status === 'cerrados' && l.updatedAt >= startOfWeek.getTime());
  const thisWeekAppts = appointments.filter(a => a.date >= weekStartStr);
  const thisWeekLogs = recentLogs.filter(l => l.timestamp >= startOfWeek.getTime());

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const report = WeeklyReportsDB.generate(userEmail || '');
      ActivityLogDB.add({ userEmail: userEmail || '', userName: fullName || '', action: 'REPORT_GENERATED', details: `Reporte semanal ${report.weekStart} - ${report.weekEnd}`, module: 'reports' });
      setReports(WeeklyReportsDB.getAll());
      setViewingReport(report);
      setGenerating(false);
    }, 1500);
  };

  // Advisor breakdown for current week
  const advisors = [...new Set(leads.map(l => l.advisor))];
  const advisorStats = advisors.map(advisor => {
    const advLeads = leads.filter(l => l.advisor === advisor);
    const advWeekLeads = advLeads.filter(l => l.createdAt >= startOfWeek.getTime());
    const advWeekAppts = thisWeekAppts.filter(a => a.advisor === advisor);
    const advClosed = advLeads.filter(l => l.status === 'cerrados' && l.updatedAt >= startOfWeek.getTime());
    return {
      advisor,
      totalLeads: advLeads.length,
      weekLeads: advWeekLeads.length,
      weekAppts: advWeekAppts.length,
      weekClosed: advClosed.length,
      activities: advWeekLeads.length + advWeekAppts.length,
    };
  }).sort((a, b) => b.activities - a.activities);

  // Status distribution
  const statusDist = {
    nuevos: leads.filter(l => l.status === 'nuevos').length,
    contactados: leads.filter(l => l.status === 'contactados').length,
    negociacion: leads.filter(l => l.status === 'negociacion').length,
    cerrados: leads.filter(l => l.status === 'cerrados').length,
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1>Reportes <span className="text-gradient-silver">Semanales</span></h1>
          <p className={styles.subtitle}>Genera el reporte de actividades de la semana para presentar los viernes.</p>
        </div>
        <button
          className={styles.primaryBtn}
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? '⏳ Generando...' : '📊 Generar Reporte Semanal'}
        </button>
      </header>

      {/* Quick Stats */}
      <div className={styles.metricsGrid} style={{ marginBottom: '2rem' }}>
        <div className={`glass-panel ${styles.metricCard}`}>
          <div className={styles.metricTitle}>Leads esta semana</div>
          <div className={styles.metricValue}>{thisWeekLeads.length}</div>
          <div className={`${styles.trend} ${styles.up}`}>Nuevos</div>
        </div>
        <div className={`glass-panel ${styles.metricCard}`}>
          <div className={styles.metricTitle}>Cierres esta semana</div>
          <div className={styles.metricValue} style={{ color: '#4ade80' }}>{thisWeekClosed.length}</div>
          <div className={`${styles.trend} ${styles.up}`}>Cerrados</div>
        </div>
        <div className={`glass-panel ${styles.metricCard}`}>
          <div className={styles.metricTitle}>Citas programadas</div>
          <div className={styles.metricValue}>{thisWeekAppts.length}</div>
          <div className={`${styles.trend} ${styles.up}`}>Semana actual</div>
        </div>
        <div className={`glass-panel ${styles.metricCard}`}>
          <div className={styles.metricTitle}>Actividades registradas</div>
          <div className={styles.metricValue}>{thisWeekLogs.length}</div>
          <div className={`${styles.trend} ${styles.up}`}>Log de acciones</div>
        </div>
        <div className={`glass-panel ${styles.metricCard}`}>
          <div className={styles.metricTitle}>Propiedades activas</div>
          <div className={styles.metricValue}>{properties.filter(p => p.status !== 'Oculto' && p.status !== 'Vendido').length}</div>
        </div>
        <div className={`glass-panel ${styles.metricCard}`}>
          <div className={styles.metricTitle}>Total leads en pipeline</div>
          <div className={styles.metricValue}>{leads.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Advisor Performance */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className={styles.sectionTitle}>👤 Rendimiento por Asesor</h3>
          {advisorStats.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.6rem', textAlign: 'left' }}>Asesor</th>
                  <th style={{ padding: '0.6rem', textAlign: 'center' }}>Leads</th>
                  <th style={{ padding: '0.6rem', textAlign: 'center' }}>Citas</th>
                  <th style={{ padding: '0.6rem', textAlign: 'center' }}>Cierres</th>
                  <th style={{ padding: '0.6rem', textAlign: 'center' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {advisorStats.map(stat => (
                  <tr key={stat.advisor} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.6rem', fontWeight: 'bold' }}>{stat.advisor}</td>
                    <td style={{ padding: '0.6rem', textAlign: 'center' }}>{stat.weekLeads}</td>
                    <td style={{ padding: '0.6rem', textAlign: 'center' }}>{stat.weekAppts}</td>
                    <td style={{ padding: '0.6rem', textAlign: 'center', color: stat.weekClosed > 0 ? '#4ade80' : 'inherit' }}>{stat.weekClosed}</td>
                    <td style={{ padding: '0.6rem', textAlign: 'center', fontWeight: 'bold', color: 'var(--accent-silver)' }}>{stat.activities}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>Sin datos de asesores.</p>
          )}
        </div>

        {/* Pipeline Distribution */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className={styles.sectionTitle}>📊 Distribución del Pipeline</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {[
              { label: 'Sin contactar', count: statusDist.nuevos, color: '#64748b', total: leads.length },
              { label: 'En contacto', count: statusDist.contactados, color: '#38bdf8', total: leads.length },
              { label: 'Negociación', count: statusDist.negociacion, color: '#f59e0b', total: leads.length },
              { label: 'Cerrados', count: statusDist.cerrados, color: '#4ade80', total: leads.length },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                  <span>{item.label}</span>
                  <span style={{ fontWeight: 'bold', color: item.color }}>{item.count}</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                  <div style={{ width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%`, height: '100%', background: item.color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Past Reports */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <h3 className={styles.sectionTitle}>📋 Historial de Reportes Generados</h3>
        {reports.length > 0 ? (
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {reports.map(report => (
              <div
                key={report.id}
                onClick={() => setViewingReport(report)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem', marginRight: '0.8rem' }}>
                    📅 {report.weekStart} — {report.weekEnd}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Generado: {new Date(report.generatedAt).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem' }}>
                  <span>Leads: <strong>{report.newLeads}</strong></span>
                  <span>Cierres: <strong style={{ color: '#4ade80' }}>{report.closedDeals}</strong></span>
                  <span>Visitas: <strong>{report.visitsCompleted}</strong></span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
            Aún no hay reportes generados. Haz click en "Generar Reporte Semanal" para crear el primero.
          </p>
        )}
      </div>

      {/* Report Detail Modal */}
      {viewingReport && (
        <div className={styles.modalOverlay} onClick={() => setViewingReport(null)}>
          <div className="glass-panel" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', margin: '1rem' }}>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              📊 Reporte Semanal<br />
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{viewingReport.weekStart} — {viewingReport.weekEnd}</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem', marginBottom: '1.5rem' }}>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{viewingReport.newLeads}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nuevos leads</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#38bdf8' }}>{viewingReport.contactedLeads}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Contactados</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4ade80' }}>{viewingReport.closedDeals}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cierres</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.5rem' }}>
              <div style={{ textAlign: 'center', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{viewingReport.visitsCompleted}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Visitas completadas</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{viewingReport.propertiesShown}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Propiedades mostradas</div>
              </div>
            </div>

            {viewingReport.activitiesByAdvisor && viewingReport.activitiesByAdvisor.length > 0 && (
              <>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>👤 Actividad por Asesor</h4>
                {viewingReport.activitiesByAdvisor.map(adv => (
                  <div key={adv.advisor} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                    <span>{adv.advisor}</span>
                    <span style={{ fontWeight: 'bold' }}>{adv.activities} actividades</span>
                  </div>
                ))}
              </>
            )}

            <button onClick={() => setViewingReport(null)} className={styles.secondaryBtn} style={{ width: '100%', marginTop: '1.5rem' }}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Responsive override */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
