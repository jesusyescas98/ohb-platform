"use client";

import { useState, useEffect } from 'react';
import styles from '../Dashboard.module.css';
import { LeadsDB, ActivityLogDB, exportToCSV, type LeadRecord } from '../../../lib/database';
import { useAuth } from '../../../context/AuthContext';

interface LeadNote {
  id: string;
  text: string;
  createdBy: string;
  createdAt: number;
}

interface LeadHistory {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: number;
}

const emptyLead: Partial<LeadRecord> = {
  id: '', name: '', phone: '', email: '', rfc: '', interestType: 'compra', interest: '',
  budgetMin: 0, budgetMax: 0, creditType: 'bancario', zoneOfInterest: '', bedroomsNeeded: 0,
  squareMetersNeeded: 0, civilStatus: '', dependents: 0, monthlyIncome: 0, prequalified: false,
  prequalifiedAmount: 0, nextAction: '', nextActionDate: '', priority: 'media', notes: '',
  requiredDocuments: [], advisor: '', firstContactDate: new Date().toISOString().split('T')[0],
  lastInteraction: new Date().toISOString().split('T')[0], progressPercent: 0, source: 'Manual',
  score: 50, status: 'nuevos', tags: [],
};

const DB_KEYS = {
  NOTES: 'ohb_crm_lead_notes',
  HISTORY: 'ohb_crm_lead_history',
};

function getLeadNotes(leadId: string): LeadNote[] {
  if (typeof window === 'undefined') return [];
  try {
    const all = JSON.parse(localStorage.getItem(DB_KEYS.NOTES) || '[]') as LeadNote[];
    return all.filter(n => n.id.startsWith(leadId + '_'));
  } catch {
    return [];
  }
}

function saveLeadNote(leadId: string, text: string, createdBy: string) {
  if (typeof window === 'undefined') return;
  try {
    const all = JSON.parse(localStorage.getItem(DB_KEYS.NOTES) || '[]') as LeadNote[];
    all.push({ id: `${leadId}_${Date.now()}`, text, createdBy, createdAt: Date.now() });
    localStorage.setItem(DB_KEYS.NOTES, JSON.stringify(all));
  } catch { }
}

function deleteLeadNote(noteId: string) {
  if (typeof window === 'undefined') return;
  try {
    const all = JSON.parse(localStorage.getItem(DB_KEYS.NOTES) || '[]') as LeadNote[];
    const filtered = all.filter(n => n.id !== noteId);
    localStorage.setItem(DB_KEYS.NOTES, JSON.stringify(filtered));
  } catch { }
}

function getLeadHistory(leadId: string): LeadHistory[] {
  if (typeof window === 'undefined') return [];
  try {
    const all = JSON.parse(localStorage.getItem(DB_KEYS.HISTORY) || '[]') as LeadHistory[];
    return all.filter(h => h.id.startsWith(leadId + '_')).sort((a, b) => b.changedAt - a.changedAt);
  } catch {
    return [];
  }
}

function addLeadHistory(leadId: string, field: string, oldValue: string, newValue: string, changedBy: string) {
  if (typeof window === 'undefined') return;
  try {
    const all = JSON.parse(localStorage.getItem(DB_KEYS.HISTORY) || '[]') as LeadHistory[];
    all.push({ id: `${leadId}_${Date.now()}`, field, oldValue, newValue, changedBy, changedAt: Date.now() });
    localStorage.setItem(DB_KEYS.HISTORY, JSON.stringify(all));
  } catch { }
}

export default function LeadsPipelinePage() {
  const { email: userEmail, fullName } = useAuth();
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState<LeadRecord | null>(null);
  const [editingLead, setEditingLead] = useState<Partial<LeadRecord>>({});
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterOrigin, setFilterOrigin] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAdvisor, setFilterAdvisor] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newTag, setNewTag] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [newNote, setNewNote] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'name'>('date');
  const leadsPerPage = 20;

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

  const handleViewDetails = (lead: LeadRecord) => {
    setSelectedLeadForDetails(lead);
    setIsDetailsOpen(true);
    setNewNote('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead.id || !editingLead.name) return;

    const oldLead = leads.find(l => l.id === editingLead.id);
    const lead = { ...emptyLead, ...editingLead, updatedAt: Date.now() } as LeadRecord;
    if (!lead.createdAt) lead.createdAt = Date.now();

    // Track changes in history
    if (oldLead) {
      if (oldLead.status !== lead.status) addLeadHistory(lead.id, 'status', oldLead.status, lead.status, fullName || 'Sistema');
      if (oldLead.name !== lead.name) addLeadHistory(lead.id, 'name', oldLead.name, lead.name, fullName || 'Sistema');
      if (oldLead.priority !== lead.priority) addLeadHistory(lead.id, 'priority', oldLead.priority, lead.priority, fullName || 'Sistema');
    }

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

  const handleBulkDelete = () => {
    if (selectedLeads.size === 0) return;
    if (window.confirm(`Eliminar ${selectedLeads.size} leads permanentemente?`)) {
      selectedLeads.forEach(id => LeadsDB.delete(id));
      ActivityLogDB.add({ userEmail: userEmail || '', userName: fullName || '', action: 'BULK_DELETE', details: `${selectedLeads.size} leads eliminados`, module: 'crm' });
      setSelectedLeads(new Set());
      setLeads(LeadsDB.getAll());
    }
  };

  const handleBulkStatusChange = (newStatus: LeadRecord['status']) => {
    if (selectedLeads.size === 0) return;
    selectedLeads.forEach(id => {
      const lead = leads.find(l => l.id === id);
      if (lead) {
        const updated = { ...lead, status: newStatus, lastInteraction: new Date().toISOString().split('T')[0], updatedAt: Date.now() };
        LeadsDB.upsert(updated);
        addLeadHistory(id, 'status', lead.status, newStatus, fullName || 'Sistema');
      }
    });
    ActivityLogDB.add({ userEmail: userEmail || '', userName: fullName || '', action: 'BULK_STATUS_CHANGE', details: `${selectedLeads.size} leads a ${newStatus}`, module: 'crm' });
    setSelectedLeads(new Set());
    setLeads(LeadsDB.getAll());
  };

  const toggleLeadSelection = (id: string) => {
    const newSet = new Set(selectedLeads);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedLeads(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const handleAddNote = (leadId: string) => {
    if (!newNote.trim()) return;
    saveLeadNote(leadId, newNote.trim(), fullName || 'Desconocido');
    setNewNote('');
    setSelectedLeadForDetails(leads.find(l => l.id === leadId) || null);
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

  // Advanced Filters
  const getDaysDiff = (timestamp: number) => Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));

  const filteredLeads = leads.filter(l => {
    // Status filter
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    // Origin filter
    if (filterOrigin !== 'all' && (l.source || '').toLowerCase() !== filterOrigin.toLowerCase()) return false;
    // Date range filter
    if (filterDateRange !== 'all') {
      const daysDiff = getDaysDiff(l.createdAt);
      if (filterDateRange === 'today' && daysDiff > 0) return false;
      if (filterDateRange === 'week' && daysDiff > 7) return false;
      if (filterDateRange === 'month' && daysDiff > 30) return false;
    }
    // Priority filter
    if (filterPriority !== 'all' && l.priority !== filterPriority) return false;
    // Advisor filter
    if (filterAdvisor !== 'all' && l.advisor !== filterAdvisor) return false;
    // Search term (name, email, phone)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (!l.name.toLowerCase().includes(search) && !l.email.toLowerCase().includes(search) && !l.phone.toLowerCase().includes(search)) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'date') return b.createdAt - a.createdAt;
    if (sortBy === 'status') return a.status.localeCompare(b.status);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  // Pagination
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * leadsPerPage, currentPage * leadsPerPage);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  // Statistics
  const stats = {
    total: leads.length,
    nuevos: leads.filter(l => l.status === 'nuevos').length,
    last7Days: leads.filter(l => getDaysDiff(l.createdAt) <= 7).length,
    conversionRate: leads.length > 0 ? Math.round((leads.filter(l => l.status === 'cerrados').length / leads.length) * 100) : 0,
    byOrigin: [...new Set(leads.map(l => l.source))].map(origin => ({
      origin,
      count: leads.filter(l => l.source === origin).length,
      conversions: leads.filter(l => l.source === origin && l.status === 'cerrados').length,
    })),
  };

  const pipeline = {
    nuevos: paginatedLeads.filter(l => l.status === 'nuevos'),
    contactados: paginatedLeads.filter(l => l.status === 'contactados'),
    negociacion: paginatedLeads.filter(l => l.status === 'negociacion'),
    cerrados: paginatedLeads.filter(l => l.status === 'cerrados'),
  };

  const advisors = [...new Set(leads.map(l => l.advisor))];
  const origins = [...new Set(leads.map(l => l.source))];

  const getScoreColor = (score: number) => score > 85 ? '#4ade80' : score > 70 ? '#f1c40f' : '#f87171';
  const getPriorityColor = (p: string) => p === 'alta' ? '#ef4444' : p === 'media' ? '#f59e0b' : '#22c55e';
  const getStatusBg = (status: string) => {
    const map: Record<string, string> = {
      nuevos: 'rgba(59,130,246,0.15)',
      contactados: 'rgba(168,85,247,0.15)',
      negociacion: 'rgba(251,146,60,0.15)',
      cerrados: 'rgba(34,197,94,0.15)',
    };
    return map[status] || 'rgba(107,114,128,0.15)';
  };

  const callLead = (phone: string) => {
    if (!phone) return;
    window.location.href = `tel:${phone}`;
  };

  const whatsappLead = (phone: string, name: string) => {
    if (!phone) return;
    const message = `Hola ${name}, te estamos contactando desde OHB Asesorías y Consultorías.`;
    window.open(`https://wa.me/52${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`);
  };

  const emailLead = (email: string) => {
    if (!email) return;
    window.location.href = `mailto:${email}`;
  };

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
          <p className={styles.subtitle}>Gestión completa de leads con filtros avanzados y estadísticas en tiempo real.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {selectedLeads.size > 0 && (
            <>
              <button className={styles.secondaryBtn} onClick={() => handleBulkStatusChange('contactados')}>Contactados</button>
              <button className={styles.secondaryBtn} onClick={() => handleBulkStatusChange('negociacion')}>Negociación</button>
              <button className={styles.dangerBtn} onClick={handleBulkDelete}>🗑️ Eliminar ({selectedLeads.size})</button>
            </>
          )}
          <button className={styles.secondaryBtn} onClick={() => exportToCSV(leads as unknown as Record<string, unknown>[], 'leads_export')}>📥 Exportar CSV</button>
          <button className={styles.primaryBtn} onClick={() => handleOpenEdit()}>+ Nuevo Lead</button>
        </div>
      </header>

      {/* Statistics Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', borderLeft: '3px solid var(--accent-gold)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Total Leads</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{stats.total}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', borderLeft: '3px solid #4ade80' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Nuevos (7d)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4ade80' }}>{stats.last7Days}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', borderLeft: '3px solid #22c55e' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Conversión</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#22c55e' }}>{stats.conversionRate}%</div>
        </div>
        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', borderLeft: '3px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Top Origen</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {stats.byOrigin.length > 0 && stats.byOrigin.sort((a, b) => b.count - a.count)[0].origin}
          </div>
        </div>
      </div>

      {/* Advanced Filters Toolbar */}
      <div className={styles.pageToolbar} style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        <input className={styles.toolbarSearch} placeholder="🔍 Buscar (nombre, email, teléfono)..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} style={{ minWidth: '200px' }} />
        <select className={styles.formSelect} style={{ width: 'auto', padding: '0.5rem 0.8rem', fontSize: '0.82rem' }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
          <option value="all">Todos los estados</option>
          <option value="nuevos">Nuevos</option>
          <option value="contactados">Contactados</option>
          <option value="negociacion">Negociación</option>
          <option value="cerrados">Cerrados</option>
        </select>
        <select className={styles.formSelect} style={{ width: 'auto', padding: '0.5rem 0.8rem', fontSize: '0.82rem' }} value={filterOrigin} onChange={e => { setFilterOrigin(e.target.value); setCurrentPage(1); }}>
          <option value="all">Todos los orígenes</option>
          {origins.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select className={styles.formSelect} style={{ width: 'auto', padding: '0.5rem 0.8rem', fontSize: '0.82rem' }} value={filterDateRange} onChange={e => { setFilterDateRange(e.target.value); setCurrentPage(1); }}>
          <option value="all">Cualquier fecha</option>
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
        </select>
        <select className={styles.formSelect} style={{ width: 'auto', padding: '0.5rem 0.8rem', fontSize: '0.82rem' }} value={filterPriority} onChange={e => { setFilterPriority(e.target.value); setCurrentPage(1); }}>
          <option value="all">Todas las prioridades</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
        <select className={styles.formSelect} style={{ width: 'auto', padding: '0.5rem 0.8rem', fontSize: '0.82rem' }} value={filterAdvisor} onChange={e => { setFilterAdvisor(e.target.value); setCurrentPage(1); }}>
          <option value="all">Todos los asesores</option>
          {advisors.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select className={styles.formSelect} style={{ width: 'auto', padding: '0.5rem 0.8rem', fontSize: '0.82rem' }} value={sortBy} onChange={e => setSortBy(e.target.value as 'date' | 'status' | 'name')}>
          <option value="date">Ordenar: Fecha</option>
          <option value="status">Ordenar: Estado</option>
          <option value="name">Ordenar: Nombre</option>
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
        <div>
          <div className={`glass-panel ${styles.dashboardCard}`} style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.8rem', width: '30px' }}>
                    <input type="checkbox" checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer' }} />
                  </th>
                  <th style={{ padding: '0.8rem', minWidth: '140px' }}>Nombre</th>
                  <th style={{ padding: '0.8rem', minWidth: '120px' }}>Email</th>
                  <th style={{ padding: '0.8rem', minWidth: '110px' }}>Teléfono</th>
                  <th style={{ padding: '0.8rem' }}>Estado</th>
                  <th style={{ padding: '0.8rem' }}>Origen</th>
                  <th style={{ padding: '0.8rem' }}>Prioridad</th>
                  <th style={{ padding: '0.8rem' }}>Score</th>
                  <th style={{ padding: '0.8rem', width: '220px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map(lead => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: selectedLeads.has(lead.id) ? 'rgba(212,168,67,0.1)' : 'transparent' }}>
                    <td style={{ padding: '0.8rem' }}>
                      <input type="checkbox" checked={selectedLeads.has(lead.id)} onChange={() => toggleLeadSelection(lead.id)} style={{ cursor: 'pointer' }} />
                    </td>
                    <td style={{ padding: '0.8rem' }}>
                      <div style={{ fontWeight: 'bold', cursor: 'pointer', color: 'var(--accent-gold)' }} onClick={() => handleViewDetails(lead)}>{lead.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{new Date(lead.createdAt).toLocaleDateString('es-MX')}</div>
                    </td>
                    <td style={{ padding: '0.8rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{lead.email || '—'}</td>
                    <td style={{ padding: '0.8rem', fontSize: '0.78rem' }}>{lead.phone || '—'}</td>
                    <td style={{ padding: '0.8rem' }}>
                      <span style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold', background: getStatusBg(lead.status), color: 'var(--text-primary)' }}>
                        {lead.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{lead.source}</td>
                    <td style={{ padding: '0.8rem' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 'bold', background: `${getPriorityColor(lead.priority)}20`, color: getPriorityColor(lead.priority) }}>
                        {lead.priority}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem', fontWeight: 'bold', color: getScoreColor(lead.score) }}>{lead.score}</td>
                    <td style={{ padding: '0.8rem' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        <button onClick={() => callLead(lead.phone)} disabled={!lead.phone} className={styles.secondaryBtn} style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', opacity: lead.phone ? 1 : 0.5 }} title="Llamar">📞</button>
                        <button onClick={() => whatsappLead(lead.phone, lead.name)} disabled={!lead.phone} className={styles.secondaryBtn} style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', opacity: lead.phone ? 1 : 0.5 }} title="WhatsApp">💬</button>
                        <button onClick={() => emailLead(lead.email)} disabled={!lead.email} className={styles.secondaryBtn} style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', opacity: lead.email ? 1 : 0.5 }} title="Email">✉️</button>
                        <button onClick={() => handleViewDetails(lead)} className={styles.secondaryBtn} style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }} title="Detalles">📄</button>
                        <button onClick={() => handleOpenEdit(lead)} className={styles.secondaryBtn} style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }} title="Editar">✏️</button>
                        <button onClick={() => handleDelete(lead.id)} className={styles.dangerBtn} style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }} title="Eliminar">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button className={styles.secondaryBtn} onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>← Anterior</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} className={`${styles.toolbarBtn} ${currentPage === page ? styles.active : ''}`} onClick={() => setCurrentPage(page)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  {page}
                </button>
              ))}
              <button className={styles.secondaryBtn} onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>Siguiente →</button>
            </div>
          )}
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

      {/* DETAILS MODAL — Resumen completo, historial y notas */}
      {isDetailsOpen && selectedLeadForDetails && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsDetailsOpen(false)}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', margin: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem' }}>📄 Detalles del Lead</h3>
              <button onClick={() => setIsDetailsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.3rem' }}>✕</button>
            </div>

            {/* Summary Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-silver)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.3rem' }}>Información de Contacto</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{selectedLeadForDetails.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>📧 {selectedLeadForDetails.email || '—'}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>📞 {selectedLeadForDetails.phone || '—'}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>🆔 {selectedLeadForDetails.rfc || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-silver)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.3rem' }}>Estado Actual</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', background: getStatusBg(selectedLeadForDetails.status), color: 'var(--text-primary)' }}>
                    {selectedLeadForDetails.status}
                  </span>
                  <span style={{ padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', background: `${getPriorityColor(selectedLeadForDetails.priority)}20`, color: getPriorityColor(selectedLeadForDetails.priority) }}>
                    {selectedLeadForDetails.priority}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Score: <strong style={{ color: getScoreColor(selectedLeadForDetails.score) }}>{selectedLeadForDetails.score}/100</strong></div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avance: <strong>{selectedLeadForDetails.progressPercent}%</strong></div>
              </div>
            </div>

            {/* Interest & Financial Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-silver)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.3rem' }}>Interés</div>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>{selectedLeadForDetails.interest}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Tipo: {selectedLeadForDetails.interestType}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Zona: {selectedLeadForDetails.zoneOfInterest || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-silver)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.3rem' }}>Presupuesto</div>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                  ${selectedLeadForDetails.budgetMin?.toLocaleString('es-MX')} - ${selectedLeadForDetails.budgetMax?.toLocaleString('es-MX')} MXN
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Crédito: {selectedLeadForDetails.creditType}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Prequalificado: {selectedLeadForDetails.prequalified ? `Sí - $${selectedLeadForDetails.prequalifiedAmount?.toLocaleString('es-MX')}` : 'No'}</div>
              </div>
            </div>

            {/* Notes Section */}
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-silver)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.5rem' }}>📝 Notas Internas</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                <textarea className={styles.formTextarea} value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Añadir nueva nota..." rows={2} style={{ flex: 1 }} />
                <button type="button" onClick={() => handleAddNote(selectedLeadForDetails.id)} className={styles.primaryBtn} style={{ padding: '0.5rem 1rem', height: 'fit-content' }}>Añadir</button>
              </div>
              {getLeadNotes(selectedLeadForDetails.id).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {getLeadNotes(selectedLeadForDetails.id).map(note => (
                    <div key={note.id} style={{ background: 'rgba(212,168,67,0.1)', padding: '0.8rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-gold)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{note.createdBy}</span>
                        <button onClick={() => deleteLeadNote(note.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                      </div>
                      <div style={{ fontSize: '0.85rem', marginBottom: '0.3rem' }}>{note.text}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{new Date(note.createdAt).toLocaleString('es-MX')}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  No hay notas aún
                </div>
              )}
            </div>

            {/* History Section */}
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-silver)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.5rem' }}>📋 Historial de Cambios</div>
              {getLeadHistory(selectedLeadForDetails.id).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {getLeadHistory(selectedLeadForDetails.id).slice(0, 20).map(h => (
                    <div key={h.id} style={{ fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: '2px solid var(--text-secondary)' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--accent-gold)' }}>{h.field}</span>: <span style={{ color: 'var(--text-secondary)' }}>"{h.oldValue}"</span> → <span style={{ color: 'var(--accent-gold)' }}>"{h.newValue}"</span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{h.changedBy} - {new Date(h.changedAt).toLocaleString('es-MX')}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  Sin cambios registrados
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
              <button className={styles.secondaryBtn} onClick={() => callLead(selectedLeadForDetails.phone)} disabled={!selectedLeadForDetails.phone} style={{ flex: 1 }}>📞 Llamar</button>
              <button className={styles.secondaryBtn} onClick={() => whatsappLead(selectedLeadForDetails.phone, selectedLeadForDetails.name)} disabled={!selectedLeadForDetails.phone} style={{ flex: 1 }}>💬 WhatsApp</button>
              <button className={styles.secondaryBtn} onClick={() => emailLead(selectedLeadForDetails.email)} disabled={!selectedLeadForDetails.email} style={{ flex: 1 }}>✉️ Email</button>
              <button className={styles.primaryBtn} onClick={() => { handleOpenEdit(selectedLeadForDetails); setIsDetailsOpen(false); }} style={{ flex: 1 }}>✏️ Editar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
