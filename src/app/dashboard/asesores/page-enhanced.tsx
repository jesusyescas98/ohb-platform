"use client";

import { useState, useEffect } from 'react';
import styles from '../Dashboard.module.css';
import { LeadsDB, AppointmentsDB } from '../../../lib/database';

interface AdvisorStats {
  name: string;
  email: string;
  totalLeads: number;
  closedDeals: number;
  leadsInNegotiation: number;
  commission: number;
  avgClosingTime: number;
  appointments: number;
  conversionRate: number;
  lastActivity: string;
}

export default function AsesoresPageEnhanced() {
  const [advisors, setAdvisors] = useState<AdvisorStats[]>([]);

  useEffect(() => {
    const leads = LeadsDB.getAll();
    const appointments = AppointmentsDB.getAll();

    const advisorMap = new Map<string, AdvisorStats>();

    leads.forEach(lead => {
      if (!advisorMap.has(lead.advisor)) {
        advisorMap.set(lead.advisor, {
          name: lead.advisor,
          email: `${lead.advisor.toLowerCase().replace(/\s+/g, '.')}@ohb.com`,
          totalLeads: 0,
          closedDeals: 0,
          leadsInNegotiation: 0,
          commission: 0,
          avgClosingTime: 0,
          appointments: 0,
          conversionRate: 0,
          lastActivity: lead.lastInteraction,
        });
      }

      const advisor = advisorMap.get(lead.advisor)!;
      advisor.totalLeads++;

      if (lead.status === 'cerrados') {
        advisor.closedDeals++;
        advisor.commission += ((lead.budgetMax + lead.budgetMin) / 2) * 0.03;
      }
      if (lead.status === 'negociacion') {
        advisor.leadsInNegotiation++;
      }

      advisor.conversionRate = advisor.totalLeads > 0 ? (advisor.closedDeals / advisor.totalLeads) * 100 : 0;
    });

    appointments.forEach(appt => {
      const advisor = advisorMap.get(appt.advisor);
      if (advisor) advisor.appointments++;
    });

    setAdvisors(Array.from(advisorMap.values()).sort((a, b) => b.commission - a.commission));
  }, []);

  const totalRevenue = advisors.reduce((acc, a) => acc + a.commission, 0);
  const avgConversion = advisors.length > 0
    ? advisors.reduce((acc, a) => acc + a.conversionRate, 0) / advisors.length
    : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>👔 Asesores - Panel de Desempeño</h1>
          <p className={styles.subtitle}>Estadísticas en tiempo real de cada asesor del equipo</p>
        </div>
      </div>

      {/* Team KPIs */}
      <div className={styles.metricsGrid}>
        <div className="glass-panel" style={{ padding: '1.3rem' }}>
          <div className={styles.metricTitle}>Total de Asesores</div>
          <div className={styles.metricValue}>{advisors.length}</div>
          <div className={styles.trend} style={{ color: '#3b82f6' }}>Equipo activo</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.3rem' }}>
          <div className={styles.metricTitle}>Ingresos Totales</div>
          <div className={styles.metricValue}>${(totalRevenue / 1000).toFixed(0)}K</div>
          <div className={styles.trend} style={{ color: '#10b981' }}>↑ Comisiones generadas</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.3rem' }}>
          <div className={styles.metricTitle}>Conversión Promedio</div>
          <div className={styles.metricValue}>{avgConversion.toFixed(1)}%</div>
          <div className={styles.trend} style={{ color: '#f59e0b' }}>Tasa de cierre</div>
        </div>
      </div>

      {/* Advisor Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem',
      }}>
        {advisors.map(advisor => (
          <div
            key={advisor.name}
            className="glass-panel"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '0.2rem' }}>
                  👤 {advisor.name}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {advisor.email}
                </div>
              </div>
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                }}
              >
                Activo
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem' }}>
              <div
                style={{
                  padding: '0.8rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Leads
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{advisor.totalLeads}</div>
              </div>
              <div
                style={{
                  padding: '0.8rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#10b981', marginBottom: '0.3rem' }}>
                  Cerrados
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981' }}>
                  {advisor.closedDeals}
                </div>
              </div>
              <div
                style={{
                  padding: '0.8rem',
                  background: 'rgba(249, 158, 11, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(249, 158, 11, 0.2)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginBottom: '0.3rem' }}>
                  Tasa Conversión
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  {advisor.conversionRate.toFixed(0)}%
                </div>
              </div>
              <div
                style={{
                  padding: '0.8rem',
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginBottom: '0.3rem' }}>
                  Citas
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#3b82f6' }}>
                  {advisor.appointments}
                </div>
              </div>
            </div>

            {/* Commission */}
            <div
              style={{
                padding: '0.8rem',
                background: 'linear-gradient(135deg, rgba(249, 158, 11, 0.15), rgba(245, 158, 11, 0.05))',
                borderRadius: '8px',
                border: '1px solid rgba(249, 158, 11, 0.2)',
              }}
            >
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Comisión Ganada
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#f59e0b' }}>
                ${(advisor.commission / 1000).toFixed(0)}K
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>En Negociación</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{advisor.leadsInNegotiation}</span>
              </div>
              <div
                style={{
                  height: '6px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #f59e0b, #f97316)',
                    width: `${(advisor.leadsInNegotiation / advisor.totalLeads) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className={styles.toolbarBtn} style={{ flex: 1 }}>
                📊 Ver Detalle
              </button>
              <button className={styles.toolbarBtn} style={{ flex: 1 }}>
                💬 Contactar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
