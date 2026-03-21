"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Dashboard.module.css';
import { useAuth } from '../../context/AuthContext';

const leads = [
  { id: 1, name: 'Carlos Mendoza', project: 'Villa Oceana - Lux', score: '92% (Compra)', date: 'Hace 2 horas', avatar: 'CM' },
  { id: 2, name: 'María Fernanda Ruiz', project: 'Penthouse Horizon', score: '78% (Interés)', date: 'Hace 5 horas', avatar: 'MR' },
  { id: 3, name: 'Grupo Inversor Alpha', project: 'Mansion Serene', score: '45% (Explorando)', date: 'Ayer', avatar: 'GA' },
];

const insights = [
  { id: 1, title: 'Predicción de Cierre Alto', text: 'El perfil de Carlos Mendoza coincide con búsquedas recurrentes en calculadoras de hipoteca para propiedades de lujo.', type: 'alert', priority: 'high' },
  { id: 2, title: 'Tendencia del Mercado', text: 'Aumento del 18% en interés por propiedades en "Costa del Sol" en las últimas 48 horas.', type: 'trend', priority: 'medium' },
  { id: 3, title: 'Oportunidad de Venta', text: '3 prospectos han visitado la propiedad "Penthouse Horizon" más de 5 veces esta semana.', type: 'opportunity', priority: 'high' },
];

const recentActivities = [
  { id: 1, action: 'Lead registrado', detail: 'Alfonso Reyes - Inversión Comercial', time: 'Hace 15 min', icon: '🎯' },
  { id: 2, action: 'Propiedad actualizada', detail: 'Villa Oceana - Precio ajustado', time: 'Hace 1 hora', icon: '🏠' },
  { id: 3, action: 'Llave prestada', detail: 'K001 → Maximiliano Torres', time: 'Hace 2 horas', icon: '🔑' },
  { id: 4, action: 'Documento cargado', detail: 'Reglamento-Condominio.pdf', time: 'Hace 3 horas', icon: '📄' },
  { id: 5, action: 'Lead cerrado', detail: 'Roberto Díaz - Bodega Norte', time: 'Hace 5 horas', icon: '✅' },
];

const quickAccessCards = [
  {
    href: '/dashboard/leads',
    icon: '🎯',
    iconBg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)',
    title: 'Pipeline de Leads',
    description: 'Gestiona prospectos con score IA, arrastra entre columnas del embudo y da seguimiento hasta el cierre.',
    stat: '3 leads sin contactar',
    statColor: '#f59e0b',
  },
  {
    href: '/dashboard/properties',
    icon: '🏠',
    iconBg: 'linear-gradient(135deg, rgba(74, 222, 128, 0.2) 0%, rgba(56, 189, 248, 0.1) 100%)',
    title: 'Inventario de Propiedades',
    description: 'Administra tu catálogo de inmuebles: casas, departamentos, comercial. Edita precios, estatus y visualiza estadísticas.',
    stat: '4 disponibles • 1 en negociación',
    statColor: '#4ade80',
  },
  {
    href: '/dashboard/contacts',
    icon: '👥',
    iconBg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(56, 189, 248, 0.1) 100%)',
    title: 'Base de Contactos',
    description: 'Directorio unificado de clientes, prospectos y proveedores. Exporta CSV, filtra por tipo y marca favoritos.',
    stat: '156 contactos totales',
    statColor: '#a855f7',
  },
  {
    href: '/dashboard/keys',
    icon: '🔑',
    iconBg: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(42, 75, 130, 0.1) 100%)',
    title: 'Control de Llaves',
    description: 'Registra préstamos y devoluciones de llaves físicas. Sabe quién tiene cada llave y desde cuándo.',
    stat: '3 en uso • 2 disponibles',
    statColor: '#38bdf8',
  },
  {
    href: '/dashboard/ai-chat',
    icon: '🧠',
    iconBg: 'linear-gradient(135deg, rgba(192, 198, 204, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)',
    title: 'Asistente AVA (IA)',
    description: 'Tu copiloto inteligente: analiza PDFs, genera descripciones para propiedades, calcula métricas y responde preguntas.',
    stat: 'IA conectada y lista',
    statColor: '#2ecc71',
  },
];

export default function DashboardPage() {
  const { fullName, email, role, getActivityLogs } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [showWelcome, setShowWelcome] = useState(true);
  const [securityLogs, setSecurityLogs] = useState<Array<{timestamp: number; action: string; details: string}>>([]);

  useEffect(() => {
    // Load security logs
    const logs = getActivityLogs();
    setSecurityLogs(logs.slice(0, 5));
    
    // Dismiss welcome after 8s
    const timer = setTimeout(() => setShowWelcome(false), 8000);
    return () => clearTimeout(timer);
  }, [getActivityLogs]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <>
      {/* Welcome Banner */}
      {showWelcome && (
        <div style={{ 
          padding: '1.2rem 1.5rem', 
          background: 'linear-gradient(90deg, rgba(42, 75, 130, 0.25), rgba(192, 198, 204, 0.08))',
          borderRadius: '14px',
          border: '1px solid rgba(42, 75, 130, 0.2)',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          animation: 'fadeIn 0.5s ease'
        }}>
          <div>
            <h3 style={{ marginBottom: '0.3rem', fontSize: '1.15rem' }}>{getGreeting()}, {fullName || email?.split('@')[0] || 'Usuario'} 👋</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              Tienes <strong style={{ color: '#f59e0b' }}>3 leads prioritarios</strong> y <strong style={{ color: '#4ade80' }}>2 insights de AVA</strong> esperando tu atención.
            </p>
          </div>
          <button onClick={() => setShowWelcome(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem', padding: '0.3rem' }}>✕</button>
        </div>
      )}

      <header className={styles.header}>
        <div>
          <h1 className="text-gradient">Centro de <span className="text-gradient-silver">Comando</span></h1>
          <p>Accede a tus herramientas y monitorea el rendimiento de tu cartera en tiempo real.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Period selector */}
          <select 
            value={selectedPeriod} 
            onChange={e => setSelectedPeriod(e.target.value)}
            style={{ 
              padding: '0.5rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', 
              color: '#fff', border: '1px solid var(--glass-border)', outline: 'none', fontSize: '0.82rem'
            }}
          >
            <option value="24h" style={{color: '#0B0F19'}}>Últimas 24h</option>
            <option value="7d" style={{color: '#0B0F19'}}>Últimos 7 días</option>
            <option value="30d" style={{color: '#0B0F19'}}>Últimos 30 días</option>
            <option value="90d" style={{color: '#0B0F19'}}>Trimestre</option>
          </select>
          <button className={styles.reportBtn}>📊 Generar Reporte</button>
        </div>
      </header>

      {/* ═══════════════════════════════════
          QUICK ACCESS CARDS
          ═══════════════════════════════════ */}
      <section className={styles.quickAccessGrid}>
        {quickAccessCards.map(card => (
          <Link key={card.href} href={card.href} style={{ textDecoration: 'none' }}>
            <div className={styles.quickAccessCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div className={styles.quickAccessIcon} style={{ background: card.iconBg }}>
                  {card.icon}
                </div>
                <h3 className={styles.quickAccessTitle}>{card.title}</h3>
                <span className={styles.quickAccessArrow}>→</span>
              </div>
              <p className={styles.quickAccessDesc}>{card.description}</p>
              <div className={styles.quickAccessStat}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: card.statColor, display: 'inline-block' }}></span>
                <span style={{ color: card.statColor }}>{card.stat}</span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* ═══════════════════════════════════
          KPI METRICS GRID
          ═══════════════════════════════════ */}
      <section className={styles.metricsGrid}>
        <div className={`glass-panel ${styles.metricCard}`}>
          <div className={styles.metricTitle}>
            <span>Conversión de Leads (IA)</span>
            <span className={`${styles.trend} ${styles.up}`}>↑ 12%</span>
          </div>
          <span className={styles.metricValue}>24.8%</span>
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '0.5rem' }}>
            <div style={{ width: '24.8%', height: '100%', background: '#4ade80', borderRadius: '2px', transition: 'width 1s ease' }} />
          </div>
        </div>
        <div className={`glass-panel ${styles.metricCard}`}>
          <div className={styles.metricTitle}>
            <span>Pipeline Activo</span>
            <span className={`${styles.trend} ${styles.up}`}>↑ 5%</span>
          </div>
          <span className={styles.metricValue}>$18.5M</span>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Meta trimestral: $25M</div>
        </div>
        <div className={`glass-panel ${styles.metricCard}`}>
          <div className={styles.metricTitle}>
            <span>Precisión IA</span>
            <span>Estable</span>
          </div>
          <span className={styles.metricValue}>94.2%</span>
          <div style={{ fontSize: '0.72rem', color: '#4ade80', marginTop: '0.3rem' }}>✓ Rango óptimo</div>
        </div>
        <div className={`glass-panel ${styles.metricCard}`}>
          <div className={styles.metricTitle}>
            <span>Propiedades</span>
            <span className={`${styles.trend} ${styles.up}`}>+2</span>
          </div>
          <span className={styles.metricValue}>6</span>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>4 disponibles • 1 negociación</div>
        </div>
        <div className={`glass-panel ${styles.metricCard}`}>
          <div className={styles.metricTitle}>
            <span>Llaves En Uso</span>
            <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>⚠ 3/5</span>
          </div>
          <span className={styles.metricValue}>3</span>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>2 disponibles en oficina</div>
        </div>
        <div className={`glass-panel ${styles.metricCard}`}>
          <div className={styles.metricTitle}>
            <span>Contactos</span>
            <span className={`${styles.trend} ${styles.up}`}>↑ 8</span>
          </div>
          <span className={styles.metricValue}>156</span>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>12 nuevos esta semana</div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className={styles.insightsSection}>
        <div className={`glass-panel ${styles.leadsPanel}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className={styles.sectionTitle} style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>🎯 Leads Prioritarios</h3>
            <Link href="/dashboard/leads" style={{ fontSize: '0.78rem', color: 'var(--accent-silver)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', transition: 'all 0.2s' }}>Ver todos →</Link>
          </div>
          <div className={styles.leadsList}>
            {leads.map(lead => (
              <div key={lead.id} className={styles.leadItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ 
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--accent-silver) 0%, rgba(255,255,255,0.3) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#0B0F19', fontWeight: 'bold', fontSize: '0.65rem', flexShrink: 0
                  }}>
                    {lead.avatar}
                  </div>
                  <div className={styles.leadInfo}>
                    <h4 style={{ fontSize: '0.92rem' }}>{lead.name}</h4>
                    <p>Interés: {lead.project} • {lead.date}</p>
                  </div>
                </div>
                <div className={styles.score}>{lead.score}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={`glass-panel ${styles.aiAlerts}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className={styles.sectionTitle} style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0, fontSize: '1rem' }}>🧠 AVA Insights</h3>
            <span style={{ fontSize: '0.68rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              En vivo
            </span>
          </div>
          {insights.map(alert => (
            <div key={alert.id} className={styles.alertItem} style={{ 
              borderLeft: `3px solid ${alert.priority === 'high' ? '#f59e0b' : '#38bdf8'}`,
              paddingLeft: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h5>{alert.type === 'alert' ? '🔔' : alert.type === 'trend' ? '📈' : '💡'} {alert.title}</h5>
                <span style={{ 
                  fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '4px',
                  background: alert.priority === 'high' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                  color: alert.priority === 'high' ? '#f59e0b' : '#38bdf8'
                }}>
                  {alert.priority === 'high' ? 'Prioritario' : 'Informativo'}
                </span>
              </div>
              <p>{alert.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Activity Feed & Security Logs */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* Recent Activity */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📋 Actividad Reciente
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {recentActivities.map(activity => (
              <div key={activity.id} style={{ 
                display: 'flex', alignItems: 'center', gap: '0.8rem', 
                padding: '0.5rem 0.6rem', borderRadius: '8px', 
                background: 'rgba(255,255,255,0.02)',
                transition: 'all 0.2s ease',
                cursor: 'default'
              }}>
                <span style={{ fontSize: '1.1rem' }}>{activity.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{activity.action}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activity.detail}</div>
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Dashboard */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🔒 Monitor de Seguridad
          </h3>
          
          {/* Security Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '1rem' }}>
            {[
              { label: '✓ Encriptado', sub: 'Datos protegidos' },
              { label: '✓ Token Activo', sub: 'Sesión verificada' },
              { label: '✓ XSS Protegido', sub: 'Inputs sanitizados' },
              { label: '✓ Rate Limit', sub: 'Anti brute-force' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '0.45rem', borderRadius: '8px', background: 'rgba(74, 222, 128, 0.08)', border: '1px solid rgba(74, 222, 128, 0.12)', fontSize: '0.72rem', textAlign: 'center' }}>
                <div style={{ color: '#4ade80', fontWeight: 'bold' }}>{item.label}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>{item.sub}</div>
              </div>
            ))}
          </div>

          {/* Security Logs */}
          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Eventos recientes:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {securityLogs.length > 0 ? securityLogs.map((log, i) => (
              <div key={i} style={{ 
                fontSize: '0.68rem', padding: '0.35rem 0.6rem', 
                background: 'rgba(255,255,255,0.02)', borderRadius: '6px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {log.action === 'LOGIN_SUCCESS' ? '✅' : log.action === 'LOGOUT' ? '🚪' : log.action === 'SESSION_RESTORED' ? '🔄' : '📝'} {log.details}
                </span>
                <span style={{ color: 'var(--text-secondary)', flexShrink: 0, marginLeft: '0.5rem' }}>
                  {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            )) : (
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>No hay eventos de seguridad recientes.</p>
            )}
          </div>
        </div>
      </section>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </>
  );
}
