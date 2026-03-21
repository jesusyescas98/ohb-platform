"use client";

import { useState } from 'react';
import styles from '../Dashboard.module.css';

interface Lead {
  id: string;
  name: string;
  interest: string;
  source: string;
  date: string;
  score: number;
  status: 'nuevos' | 'contactados' | 'negociacion' | 'cerrados';
  advisor: string;
}

const initialLeads: Lead[] = [
  { id: 'L001', name: 'Alfonso Reyes', interest: 'Inversión Comercial', source: 'Bot IA', date: 'Hace 2h', score: 90, status: 'nuevos', advisor: 'Carlos M.' },
  { id: 'L002', name: 'Julio Salazar', interest: 'Casa Habitación (Crédito)', source: 'Plataforma', date: 'Hace 5h', score: 75, status: 'nuevos', advisor: 'Ana P.' },
  { id: 'L003', name: 'Mariana Pineda', interest: 'Terreno Industrial', source: 'TikTok', date: 'Ayer', score: 85, status: 'contactados', advisor: 'Luis G.' },
  { id: 'L004', name: 'Ernesto Vallejo', interest: 'Departamento Premium', source: 'Instagram', date: 'Ayer', score: 95, status: 'contactados', advisor: 'Carlos M.' },
  { id: 'L005', name: 'Laura Montemayor', interest: 'Mansion Serene', source: 'Referido', date: 'Hace 3 días', score: 99, status: 'negociacion', advisor: 'Ana P.' },
  { id: 'L006', name: 'Roberto Díaz', interest: 'Bodega Norte', source: 'Facebook', date: 'Hace 1 sem', score: 100, status: 'cerrados', advisor: 'Luis G.' },
];

export default function LeadsPipelinePage() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Partial<Lead>>({});

  const handleOpenEdit = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
    } else {
      setEditingLead({
        id: `L00${Math.floor(Math.random() * 900) + 100}`,
        name: '',
        interest: '',
        source: 'Manual',
        date: 'Reciente',
        score: 50,
        status: 'nuevos',
        advisor: 'Sin Asignar',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead.id || !editingLead.name) return;

    const exists = leads.some(l => l.id === editingLead.id);
    if (exists) {
      setLeads(leads.map(l => l.id === editingLead.id ? { ...l, ...editingLead } as Lead : l));
    } else {
      setLeads([...leads, editingLead as Lead]);
    }
    setIsModalOpen(false);
  };

  const pipeline = {
    nuevos: leads.filter(l => l.status === 'nuevos'),
    contactados: leads.filter(l => l.status === 'contactados'),
    negociacion: leads.filter(l => l.status === 'negociacion'),
    cerrados: leads.filter(l => l.status === 'cerrados'),
  };

  const PipelineColumn = ({ title, columnLeads, count, statusId }: { title: string, columnLeads: Lead[], count: number, statusId: Lead['status'] }) => {
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const leadId = e.dataTransfer.getData('text/plain');
      if (leadId) {
        setLeads(prevLeads => prevLeads.map(l => l.id === leadId ? { ...l, status: statusId } : l));
      }
    };

    return (
      <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>{title}</h4>
          <span style={{ background: 'var(--glass-bg)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>{count}</span>
        </div>
        
        {columnLeads.length > 0 ? (
          columnLeads.map((lead) => (
            <div 
              key={lead.id} 
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', lead.id);
              }}
              onClick={() => handleOpenEdit(lead)} 
              className="glass-panel" 
              style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', cursor: 'grab', borderLeft: `3px solid ${lead.score > 85 ? '#4ade80' : lead.score > 70 ? '#f1c40f' : '#f87171'}`, transition: 'all 0.2s ease', position: 'relative' }}
            >
              <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', opacity: 0.5, cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>✏️</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{lead.name}</span>
                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{lead.date}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{lead.interest}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-silver)' }}>{lead.source}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>👤 {lead.advisor}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <span style={{ color: lead.score > 85 ? '#4ade80' : lead.score > 70 ? '#f1c40f' : '#f87171' }}>★</span> {lead.score}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            Sin prospectos
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container} style={{ position: 'relative' }}>
      <header className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1>Pipeline de <span className="text-gradient-silver">Leads</span></h1>
          <p className={styles.subtitle}>Gestión predictiva de prospectos, score generado por IA y embudo de conversión.</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => handleOpenEdit()}>+ Nuevo Lead Manual</button>
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', width: '100%', height: 'calc(100vh - 200px)' }}>
        <PipelineColumn title="Nuevos (Sin contactar)" columnLeads={pipeline.nuevos} count={pipeline.nuevos.length} statusId="nuevos" />
        <PipelineColumn title="En Contacto" columnLeads={pipeline.contactados} count={pipeline.contactados.length} statusId="contactados" />
        <PipelineColumn title="En Negociación / Visita" columnLeads={pipeline.negociacion} count={pipeline.negociacion.length} statusId="negociacion" />
        <PipelineColumn title="Cerrados / Ganados" columnLeads={pipeline.cerrados} count={pipeline.cerrados.length} statusId="cerrados" />
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className={`glass-panel`} style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
              {leads.some(l => l.id === editingLead.id) ? 'Editar Lead' : 'Nuevo Lead Manual'}
            </h3>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Nombre del Prospecto</label>
                <input required type="text" value={editingLead.name || ''} onChange={(e) => setEditingLead({...editingLead, name: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Interés Principal</label>
                <input required type="text" placeholder="Ej. Terreno Industrial" value={editingLead.interest || ''} onChange={(e) => setEditingLead({...editingLead, interest: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Asesor Asignado</label>
                <input required type="text" value={editingLead.advisor || ''} onChange={(e) => setEditingLead({...editingLead, advisor: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Origen</label>
                  <input type="text" value={editingLead.source || ''} onChange={(e) => setEditingLead({...editingLead, source: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Score predictivo (1-100)</label>
                  <input type="number" min="0" max="100" value={editingLead.score || 0} onChange={(e) => setEditingLead({...editingLead, score: Number(e.target.value)})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Estatus (Columna del Embudo)</label>
                <select value={editingLead.status || 'nuevos'} onChange={(e) => setEditingLead({...editingLead, status: e.target.value as any})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }}>
                  <option value="nuevos" style={{color: '#0B0F19'}}>Nuevos (Sin contactar)</option>
                  <option value="contactados" style={{color: '#0B0F19'}}>En Contacto</option>
                  <option value="negociacion" style={{color: '#0B0F19'}}>En Negociación / Visita</option>
                  <option value="cerrados" style={{color: '#0B0F19'}}>Cerrados / Ganados</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, background: 'var(--accent-silver)', color: '#0B0F19', border: 'none', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s ease' }}>Guardar Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
