"use client";

import { useState, useEffect } from 'react';
import styles from '../Dashboard.module.css';
import { LeadsDB, ActivityLogDB, exportToCSV, type LeadRecord } from '../../../lib/database';
import { useAuth } from '../../../context/AuthContext';

const emptyLead: Partial<LeadRecord> = {
  id: '', name: '', phone: '', email: '', rfc: '', interestType: 'compra', interest: '',
  budgetMin: 0, budgetMax: 0, creditType: 'bancario', zoneOfInterest: '', bedroomsNeeded: 0,
  squareMetersNeeded: 0, civilStatus: '', dependents: 0, monthlyIncome: 0, prequalified: false,
  prequalifiedAmount: 0, nextAction: '', nextActionDate: '', priority: 'media', notes: '',
  requiredDocuments: [], advisor: '', firstContactDate: new Date().toISOString().split('T')[0],
  lastInteraction: new Date().toISOString().split('T')[0], progressPercent: 0, source: 'Manual',
  score: 50, status: 'nuevos', tags: [],
};

export default function LeadsPipelinePage() {
  const { email: userEmail, fullName } = useAuth();
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Partial<LeadRecord>>({});
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAdvisor, setFilterAdvisor] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    setLeads(LeadsDB.getAll());
  }, []);

  const saveLeads = (updatedLeads: LeadRecord[]) => {
    updatedLeads.forEach(l => LeadsDB.upsert(l));
    setLeads(LeadsDB.getAll());
  };

  const handleOpenEdit = (lead?: LeadRecord) => {
    if (lead) {
      setEditingLead({ ...lead });
    } else {
      setEditingLead({
        ...emptyLead,
        id: `L${Date.now().toString(36).toUpperCase()}`,
        advisor: fullName || 'Sin Asignar',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead.id || !editingLead.name) return;
    const lead = { ...emptyLead, ...editingLead, updatedAt: Date.now() } as LeadRecord;
    if (!lead.createdAt) lead.createdAt = Date.now();
    LeadsDB.upsert(lead);
    ActivityLogDB.add({ userEmail: userEmail || '', userName: fullName || '', action: 'LEAD_SAVED', details: `Lead ${lead.name} guardado`, module: 'crm' });
    setLeads(LeadsDB.getAll());
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar este lead permanentemente?')) {
      LeadsDB.delete(id);
      ActivityLogDB.add({ userEmail: userEmail || '', userName: fullName || '', action: 'LEAD_DELETED', details: `Lead ${id} eliminado`, module: 'crm' });
      setLeads(LeadsDB.getAll());
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: LeadRecord['status']) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    if (!leadId) return;
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      const updated = { ...lead, status: targetStatus, lastInteraction: new Date().toISOString().split('T')[0], updatedAt: Date.now() };
      LeadsDB.upsert(updated);
      ActivityLogDB.add({ userEmail: userEmail || '', userName: fullName || '', action: 'LEAD_STATUS_CHANGED', details: `${lead.name} → ${targetStatus}`, module: 'crm' });
      setLeads(LeadsDB.getAll());
    }
  };

  const addTag = () => {
    if (newTag.trim() && editingLead.tags && !editingLead.tags.includes(newTag.trim())) {
      setEditingLead({ ...editingLead, tags: [...editingLead.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setEditingLead({ ...editingLead, tags: (editingLead.tags || []).filter(t => t !== tag) });
  };

  // Filters
  const filteredLeads = leads.filter(l => {
    if (filterPriority !== 'all' && l.priority !== filterPriority) return false;
    if (filterAdvisor !== 'all' && l.advisor !== filterAdvisor) return false;
    if (filterSource !== 'all' && (l.source || '').toLowerCase() !== filterSource.toLowerCase()) return false;
    if (searchTerm && !l.name.toLowerCase().includes(searchTerm.toLowerCase()) && !l.interest.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const pipeline = {
    nuevos: filteredLeads.filter(l => l.status === 'nuevos'),
    contactados: filteredLeads.filter(l => l.status === 'contactados'),
    negociacion: filteredLeads.filter(l => l.status === 'negociacion'),
    cerrados: filteredLeads.filter(l => l.status === 'cerrados'),
  };

  const advisors = [...new Set(leads.map(l => l.advisor))];
  const getScoreColor = (score: number) => score > 85 ? '#4ade80' : score > 70 ? '#f1c40f' : '#f87171';
  const getPriorityColor = (p: string) => p === 'alta' ? '#ef4444' : p === 'media' ? '#f59e0b' : '#22c55e';

  const PipelineColumn = ({ title, icon, columnLeads, statusId }: { title: string; icon: string; columnLeads: LeadRecord[]; statusId: LeadRecord['status'] }) => (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e, statusId)}
      style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
        <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{icon} {title}</h4>
        <span style={{ background: 'var(--glass-bg)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>{columnLeads.length}</span>
      </div>
      {columnLeads.map(lead => (
        <div
          key={lead.id}
          draggable
          onDragStart={(e) => e.dataTransfer.setData('text/plain', lead.id)}
          onClick={() => handleOpenEdit(lead)}
          className="glass-panel"
          style={{ padding: '1rem', cursor: 'grab', borderLeft: `3px solid ${getScoreColor(lead.score)}`, transition: 'all 0.2s ease', position: 'relative' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{lead.name}</span>
            <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: `${getPriorityColor(lead.priority)}20`, color: getPriorityColor(lead.priority), fontWeight: 'bold' }}>
              {lead.priority.toUpperCase()}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0.3rem 0' }}>{lead.interest}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>👤 {lead.advisor}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{lead.source}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: getScoreColor(lead.score) }}>★{lead.score}</span>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: '0.5rem', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
            <div style={{ width: `${lead.progressPercent}%`, height: '100%', background: getScoreColor(lead.score), borderRadius: '2px', transition: 'width 0.5s ease' }} />
          </div>
          {/* Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.2rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
              {lead.tags.slice(0, 3).map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      ))}
      {columnLeads.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
          Arrastra leads aquí
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1>Pipeline <span className="text-gradient-silver">CRM</span></h1>
          <p className={styles.subtitle}>Gestión inmobiliaria completa con campos técnicos para asesores.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className={styles.secondaryBtn} onClick={() => exportToCSV(leads as unknown as Record<string, unknown>[], 'leads_export')}>📥 Exportar CSV</button>
          <button className={styles.primaryBtn} onClick={() => handleOpenEdit()}>+ Nuevo Lead</button>
        </div>
      </header>

      {/* Toolbar */}
      <div className={styles.pageToolbar}>
        <input className={styles.toolbarSearch} placeholder="🔍 Buscar por nombre o interés..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <select className={styles.formSelect} style={{ width: 'auto', padding: '0.5rem 0.8rem', fontSize: '0.82rem' }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="all">Todas las prioridades</option>
          <option value="alta">🔴 Alta</option>
          <option value="media">🟡 Media</option>
          <option value="baja">🟢 Baja</option>
        </select>
        <select className={styles.formSelect} style={{ width: 'auto', padding: '0.5rem 0.8rem', fontSize: '0.82rem' }} value={filterAdvisor} onChange={e => setFilterAdvisor(e.target.value)}>
          <option value="all">Todos los asesores</option>
          {advisors.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select className={styles.formSelect} style={{ width: 'auto', padding: '0.5rem 0.8rem', fontSize: '0.82rem' }} value={filterSource} onChange={e => setFilterSource(e.target.value)}>
          <option value="all">Todas las fuentes</option>
          <option value="portal web">🌐 Portal Web</option>
          <option value="whatsapp">💬 WhatsApp</option>
          <option value="calculadora">🧮 Calculadora</option>
          <option value="newsletter">📧 Newsletter</option>
          <option value="formulario">📋 Formulario</option>
          <option value="chatbot">🤖 Chatbot</option>
          <option value="Manual">✏️ Manual</option>
        </select>
        <button className={`${styles.toolbarBtn} ${viewMode === 'pipeline' ? styles.active : ''}`} onClick={() => setViewMode('pipeline')}>📊 Pipeline</button>
        <button className={`${styles.toolbarBtn} ${viewMode === 'table' ? styles.active : ''}`} onClick={() => setViewMode('table')}>📋 Tabla</button>
      </div>

      {/* Pipeline View */}
      {viewMode === 'pipeline' && (
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', width: '100%' }}>
          <PipelineColumn title="Sin contactar" icon="🆕" columnLeads={pipeline.nuevos} statusId="nuevos" />
          <PipelineColumn title="En Contacto" icon="📞" columnLeads={pipeline.contactados} statusId="contactados" />
          <PipelineColumn title="Negociación" icon="🤝" columnLeads={pipeline.negociacion} statusId="negociacion" />
          <PipelineColumn title="Cerrados" icon="✅" columnLeads={pipeline.cerrados} statusId="cerrados" />
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className={`glass-panel ${styles.dashboardCard}`} style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.8rem' }}>Nombre</th>
                <th style={{ padding: '0.8rem' }}>Interés</th>
                <th style={{ padding: '0.8rem' }}>Fuente</th>
                <th style={{ padding: '0.8rem' }}>Propiedad</th>
                <th style={{ padding: '0.8rem' }}>Asesor</th>
                <th style={{ padding: '0.8rem' }}>Prioridad</th>
                <th style={{ padding: '0.8rem' }}>Score</th>
                <th style={{ padding: '0.8rem' }}>Avance</th>
                <th style={{ padding: '0.8rem' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.8rem' }}>
                    <div style={{ fontWeight: 'bold' }}>{lead.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{lead.phone}</div>
                  </td>
                  <td style={{ padding: '0.8rem' }}>{lead.interest}</td>
                  <td style={{ padding: '0.8rem' }}>
                    <span style={{ padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', background: 'rgba(27,58,107,0.15)', color: 'var(--accent-blue, #1B3A6B)', fontWeight: 500 }}>
                      {lead.source || 'Manual'}
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {lead.interest || '—'}
                  </td>
                  <td style={{ padding: '0.8rem' }}>{lead.advisor}</td>
                  <td style={{ padding: '0.8rem' }}>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', background: `${getPriorityColor(lead.priority)}20`, color: getPriorityColor(lead.priority) }}>
                      {lead.priority}
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem', fontWeight: 'bold', color: getScoreColor(lead.score) }}>{lead.score}</td>
                  <td style={{ padding: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                        <div style={{ width: `${lead.progressPercent}%`, height: '100%', background: getScoreColor(lead.score), borderRadius: '2px' }} />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{lead.progressPercent}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.8rem' }}>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button onClick={() => handleOpenEdit(lead)} className={styles.secondaryBtn} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>✏️</button>
                      <button onClick={() => handleDelete(lead.id)} className={styles.dangerBtn} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT/CREATE MODAL — Now with full CRM fields */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '720px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', margin: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem' }}>
                {leads.some(l => l.id === editingLead.id) ? '✏️ Editar Lead' : '➕ Nuevo Lead'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.3rem' }}>✕</button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Section: Datos del Prospecto */}
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-silver)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}>📋 Datos del Prospecto</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nombre completo *</label>
                  <input required className={styles.formInput} value={editingLead.name || ''} onChange={e => setEditingLead({...editingLead, name: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Teléfono</label>
                  <input className={styles.formInput} value={editingLead.phone || ''} onChange={e => setEditingLead({...editingLead, phone: e.target.value})} placeholder="656-123-4567" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email</label>
                  <input className={styles.formInput} type="email" value={editingLead.email || ''} onChange={e => setEditingLead({...editingLead, email: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>RFC</label>
                  <input className={styles.formInput} value={editingLead.rfc || ''} onChange={e => setEditingLead({...editingLead, rfc: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Estado civil</label>
                  <input className={styles.formInput} value={editingLead.civilStatus || ''} onChange={e => setEditingLead({...editingLead, civilStatus: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Dependientes económicos</label>
                  <input className={styles.formInput} type="number" min="0" value={editingLead.dependents || 0} onChange={e => setEditingLead({...editingLead, dependents: Number(e.target.value)})} />
                </div>
              </div>

              {/* Section: Interés Inmobiliario */}
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-silver)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold', marginTop: '0.5rem' }}>🏠 Interés Inmobiliario</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tipo de interés</label>
                  <select className={styles.formSelect} value={editingLead.interestType || 'compra'} onChange={e => setEditingLead({...editingLead, interestType: e.target.value as LeadRecord['interestType']})}>
                    <option value="compra">Compra</option>
                    <option value="venta">Venta</option>
                    <option value="renta">Renta</option>
                    <option value="inversion">Inversión</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Interés principal *</label>
                  <input required className={styles.formInput} value={editingLead.interest || ''} onChange={e => setEditingLead({...editingLead, interest: e.target.value})} placeholder="Ej: Casa en zona sur" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Presupuesto mín ($)</label>
                  <input className={styles.formInput} type="number" min="0" value={editingLead.budgetMin || 0} onChange={e => setEditingLead({...editingLead, budgetMin: Number(e.target.value)})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Presupuesto máx ($)</label>
                  <input className={styles.formInput} type="number" min="0" value={editingLead.budgetMax || 0} onChange={e => setEditingLead({...editingLead, budgetMax: Number(e.target.value)})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tipo de crédito</label>
                  <select className={styles.formSelect} value={editingLead.creditType || 'bancario'} onChange={e => setEditingLead({...editingLead, creditType: e.target.value as LeadRecord['creditType']})}>
                    <option value="infonavit">Infonavit</option>
                    <option value="bancario">Bancario</option>
                    <option value="contado">Contado</option>
                    <option value="cofinanciamiento">Cofinanciamiento</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Zona de interés</label>
                  <input className={styles.formInput} value={editingLead.zoneOfInterest || ''} onChange={e => setEditingLead({...editingLead, zoneOfInterest: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Recámaras deseadas</label>
                  <input className={styles.formInput} type="number" min="0" value={editingLead.bedroomsNeeded || 0} onChange={e => setEditingLead({...editingLead, bedroomsNeeded: Number(e.target.value)})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>m² deseados</label>
                  <input className={styles.formInput} type="number" min="0" value={editingLead.squareMetersNeeded || 0} onChange={e => setEditingLead({...editingLead, squareMetersNeeded: Number(e.target.value)})} />
                </div>
              </div>

              {/* Section: Financiero */}
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-silver)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold', marginTop: '0.5rem' }}>💰 Información Financiera</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ingresos mensuales ($)</label>
                  <input className={styles.formInput} type="number" min="0" value={editingLead.monthlyIncome || 0} onChange={e => setEditingLead({...editingLead, monthlyIncome: Number(e.target.value)})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>¿Precalificado?</label>
                  <select className={styles.formSelect} value={editingLead.prequalified ? 'si' : 'no'} onChange={e => setEditingLead({...editingLead, prequalified: e.target.value === 'si'})}>
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </div>
                {editingLead.prequalified && (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Monto precalificado ($)</label>
                    <input className={styles.formInput} type="number" min="0" value={editingLead.prequalifiedAmount || 0} onChange={e => setEditingLead({...editingLead, prequalifiedAmount: Number(e.target.value)})} />
                  </div>
                )}
              </div>

              {/* Section: Gestión */}
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-silver)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold', marginTop: '0.5rem' }}>⚙️ Gestión del Lead</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Asesor asignado</label>
                  <input className={styles.formInput} value={editingLead.advisor || ''} onChange={e => setEditingLead({...editingLead, advisor: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Origen</label>
                  <select className={styles.formSelect} value={editingLead.source || 'Manual'} onChange={e => setEditingLead({...editingLead, source: e.target.value})}>
                    <option value="Manual">Manual</option>
                    <option value="Plataforma">Plataforma</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Referido">Referido</option>
                    <option value="Bot IA">Bot IA</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Prioridad</label>
                  <select className={styles.formSelect} value={editingLead.priority || 'media'} onChange={e => setEditingLead({...editingLead, priority: e.target.value as LeadRecord['priority']})}>
                    <option value="alta">🔴 Alta</option>
                    <option value="media">🟡 Media</option>
                    <option value="baja">🟢 Baja</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Score (1-100)</label>
                  <input className={styles.formInput} type="number" min="0" max="100" value={editingLead.score || 50} onChange={e => setEditingLead({...editingLead, score: Number(e.target.value)})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>% Avance</label>
                  <input className={styles.formInput} type="number" min="0" max="100" value={editingLead.progressPercent || 0} onChange={e => setEditingLead({...editingLead, progressPercent: Number(e.target.value)})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Estatus</label>
                  <select className={styles.formSelect} value={editingLead.status || 'nuevos'} onChange={e => setEditingLead({...editingLead, status: e.target.value as LeadRecord['status']})}>
                    <option value="nuevos">Nuevos (Sin contactar)</option>
                    <option value="contactados">En Contacto</option>
                    <option value="negociacion">En Negociación</option>
                    <option value="cerrados">Cerrados / Ganados</option>
                  </select>
                </div>
              </div>

              {/* Siguiente acción */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.8rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Siguiente acción requerida</label>
                  <input className={styles.formInput} value={editingLead.nextAction || ''} onChange={e => setEditingLead({...editingLead, nextAction: e.target.value})} placeholder="Ej: Llamar para agendar visita" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Fecha de acción</label>
                  <input className={styles.formInput} type="date" value={editingLead.nextActionDate || ''} onChange={e => setEditingLead({...editingLead, nextActionDate: e.target.value})} />
                </div>
              </div>

              {/* Notes / Bitácora */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Notas / Bitácora</label>
                <textarea className={styles.formTextarea} value={editingLead.notes || ''} onChange={e => setEditingLead({...editingLead, notes: e.target.value})} rows={3} placeholder="Historial de interacciones..." />
              </div>

              {/* Tags */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Etiquetas</label>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                  {(editingLead.tags || []).map(tag => (
                    <span key={tag} className={styles.tag}>
                      {tag} <span className={styles.tagRemove} onClick={() => removeTag(tag)}>✕</span>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <input className={styles.formInput} value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}} placeholder="Nueva etiqueta..." style={{ flex: 1 }} />
                  <button type="button" onClick={addTag} className={styles.secondaryBtn} style={{ padding: '0.5rem 0.8rem' }}>+</button>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.secondaryBtn} style={{ flex: 1 }}>Cancelar</button>
                {leads.some(l => l.id === editingLead.id) && (
                  <button type="button" onClick={() => { handleDelete(editingLead.id!); setIsModalOpen(false); }} className={styles.dangerBtn} style={{ flex: 0.5 }}>Eliminar</button>
                )}
                <button type="submit" className={styles.primaryBtn} style={{ flex: 1 }}>💾 Guardar Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
