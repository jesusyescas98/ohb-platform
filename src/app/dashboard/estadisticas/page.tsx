"use client";

import { useState, useEffect } from 'react';
import styles from '../Dashboard.module.css';
import { PropertiesDB, LeadsDB } from '../../../lib/database';

interface AnalyticsData {
  propertyViews: Record<string, number>;
  leadSources: Record<string, number>;
  conversionRate: number;
  avgTimeToClose: number;
  topProperties: Array<{ name: string; views: number; leads: number }>;
}

export default function EstadisticasPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    propertyViews: {},
    leadSources: {},
    conversionRate: 0,
    avgTimeToClose: 0,
    topProperties: [],
  });

  useEffect(() => {
    const properties = PropertiesDB.getAll();
    const leads = LeadsDB.getAll();

    const propertyViews: Record<string, number> = {};
    const leadSources: Record<string, number> = {};

    properties.forEach(p => {
      propertyViews[p.title] = p.views || 0;
    });

    leads.forEach(l => {
      leadSources[l.source] = (leadSources[l.source] || 0) + 1;
    });

    const closedLeads = leads.filter(l => l.status === 'cerrados').length;
    const conversionRate = leads.length > 0 ? (closedLeads / leads.length) * 100 : 0;

    const topProps = properties
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(p => ({
        name: p.title,
        views: p.views || 0,
        leads: leads.filter(l => l.interest === p.title).length,
      }));

    setAnalytics({
      propertyViews,
      leadSources,
      conversionRate,
      avgTimeToClose: 12,
      topProperties: topProps,
    });
  }, []);

  const leadSourceEntries = Object.entries(analytics.leadSources);
  const totalLeads = leadSourceEntries.reduce((acc, [_, count]) => acc + count, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>📊 Estadísticas y Analítica</h1>
          <p className={styles.subtitle}>Análisis de rendimiento, conversiones y tendencias</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className={styles.metricsGrid}>
        <div className="glass-panel" style={{ padding: '1.3rem' }}>
          <div className={styles.metricTitle}>Tasa de Conversión</div>
          <div className={styles.metricValue}>{analytics.conversionRate.toFixed(1)}%</div>
          <div className={styles.trend} style={{ color: '#10b981' }}>↑ Mejorando</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.3rem' }}>
          <div className={styles.metricTitle}>Vistas Totales</div>
          <div className={styles.metricValue}>
            {Object.values(analytics.propertyViews).reduce((a, b) => a + b, 0)}
          </div>
          <div className={styles.trend} style={{ color: '#3b82f6' }}>Todas las propiedades</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.3rem' }}>
          <div className={styles.metricTitle}>Días Promedio de Cierre</div>
          <div className={styles.metricValue}>{analytics.avgTimeToClose}</div>
          <div className={styles.trend} style={{ color: '#f59e0b' }}>-2 días vs mes anterior</div>
        </div>
      </div>

      {/* Lead Sources */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <div className={styles.sectionTitle}>🔗 Fuentes de Leads</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '1rem',
        }}>
          {leadSourceEntries.map(([source, count]) => (
            <div key={source} style={{
              padding: '1rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '10px',
              border: '1px solid var(--glass-border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600' }}>{source}</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-silver)' }}>
                  {((count / totalLeads) * 100).toFixed(0)}%
                </span>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#3b82f6' }}>
                {count}
              </div>
              <div style={{
                height: '4px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '2px',
                marginTop: '0.8rem',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                  width: `${(count / totalLeads) * 100}%`,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Properties */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <div className={styles.sectionTitle}>🏆 Propiedades con Mejor Rendimiento</div>
        <div style={{ marginTop: '1rem' }}>
          {analytics.topProperties.map((prop, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              borderBottom: idx < analytics.topProperties.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              gap: '1rem',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                flexShrink: 0,
              }}>
                {idx + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', marginBottom: '0.2rem' }}>{prop.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {prop.views} vistas • {prop.leads} leads generados
                </div>
              </div>
              <div style={{
                textAlign: 'right',
                fontWeight: '600',
                fontSize: '1.2rem',
              }}>
                {prop.views}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <div className={styles.sectionTitle}>🔄 Embudo de Conversión</div>
        <div style={{ marginTop: '1.5rem' }}>
          {[
            { stage: 'Visitantes', count: 4250, color: '#3b82f6' },
            { stage: 'Leads Generados', count: 342, color: '#8b5cf6' },
            { stage: 'En Negociación', count: 45, color: '#f59e0b' },
            { stage: 'Cerrados', count: 12, color: '#10b981' },
          ].map((item, idx) => (
            <div key={idx} style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600' }}>{item.stage}</span>
                <span style={{ color: item.color, fontWeight: '600' }}>{item.count}</span>
              </div>
              <div style={{
                height: '20px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  background: item.color,
                  width: `${(item.count / 4250) * 100}%`,
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
