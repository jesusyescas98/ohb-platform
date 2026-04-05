"use client";

import { useState, useEffect, useMemo } from 'react';
import styles from '../Dashboard.module.css';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  type: 'cliente' | 'prospecto' | 'asesor' | 'proveedor';
  notes: string;
  createdAt: string;
  lastContact: string;
  isFavorite: boolean;
}

const contactTypes = ['Todos', 'cliente', 'prospecto', 'asesor', 'proveedor'];
const typeLabels: Record<string, string> = { cliente: 'Cliente', prospecto: 'Prospecto', asesor: 'Asesor', proveedor: 'Proveedor' };
const typeColors: Record<string, { bg: string; text: string }> = {
  cliente: { bg: 'rgba(74, 222, 128, 0.2)', text: '#4ade80' },
  prospecto: { bg: 'rgba(56, 189, 248, 0.2)', text: '#38bdf8' },
  asesor: { bg: 'rgba(168, 85, 247, 0.2)', text: '#a855f7' },
  proveedor: { bg: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b' },
};

const ITEMS_PER_PAGE = 8;

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Partial<Contact>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const [sortField, setSortField] = useState<'firstName' | 'lastName' | 'email' | 'createdAt'>('firstName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('ohb_contacts');
    if (stored) {
      try {
        setContacts(JSON.parse(stored));
      } catch {
        initializeContacts();
      }
    } else {
      initializeContacts();
    }
  }, []);

  const initializeContacts = () => {
    const initial: Contact[] = [
      { id: '1', firstName: 'Juan', lastName: 'Pérez', email: 'juan@test.com', phone: '555-012-3456', company: 'Inmobiliaria Norte', type: 'cliente', notes: 'Interesado en propiedades comerciales', createdAt: '2026-01-15', lastContact: '2026-03-05', isFavorite: true },
      { id: '2', firstName: 'María', lastName: 'Gómez', email: 'maria@test.com', phone: '555-012-4567', company: 'Inversiones MG', type: 'prospecto', notes: 'Pedir seguimiento de Infonavit', createdAt: '2026-02-20', lastContact: '2026-03-01', isFavorite: false },
      { id: '3', firstName: 'Roberto', lastName: 'Díaz', email: 'roberto@proveedor.com', phone: '555-098-7654', company: 'Servicios Legales RD', type: 'proveedor', notes: 'Notario de confianza', createdAt: '2025-11-10', lastContact: '2026-02-28', isFavorite: true },
      { id: '4', firstName: 'Ana', lastName: 'Lucía', email: 'ana@ohb.com', phone: '555-111-2222', company: 'OHB Asesorías', type: 'asesor', notes: 'Especialista en Infonavit', createdAt: '2025-06-01', lastContact: '2026-03-06', isFavorite: false },
      { id: '5', firstName: 'Carlos', lastName: 'Mendoza', email: 'carlos.m@gmail.com', phone: '555-333-4444', company: '', type: 'prospecto', notes: 'Interesado en Villa Oceana', createdAt: '2026-03-01', lastContact: '2026-03-06', isFavorite: true },
    ];
    setContacts(initial);
    localStorage.setItem('ohb_contacts', JSON.stringify(initial));
  };

  const handleSaveStore = (newContacts: Contact[]) => {
    setContacts(newContacts);
    localStorage.setItem('ohb_contacts', JSON.stringify(newContacts));
  };

  const handleOpenEdit = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
    } else {
      setEditingContact({
        id: Date.now().toString(),
        firstName: '', lastName: '', email: '', phone: '',
        company: '', type: 'prospecto', notes: '',
        createdAt: new Date().toISOString().split('T')[0],
        lastContact: new Date().toISOString().split('T')[0],
        isFavorite: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact.id || !editingContact.firstName) return;

    const exists = contacts.some(c => c.id === editingContact.id);
    let newContacts;
    if (exists) {
      newContacts = contacts.map(c => c.id === editingContact.id ? { ...c, ...editingContact } as Contact : c);
    } else {
      newContacts = [...contacts, editingContact as Contact];
    }
    handleSaveStore(newContacts);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    handleSaveStore(contacts.filter(c => c.id !== id));
    setShowDeleteConfirm(null);
  };

  const toggleFavorite = (id: string) => {
    handleSaveStore(contacts.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
  };

  const toggleSelectContact = (id: string) => {
    setSelectedContacts(prev => prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]);
  };

  const handleBulkDelete = () => {
    if (selectedContacts.length === 0) return;
    handleSaveStore(contacts.filter(c => !selectedContacts.includes(c.id)));
    setSelectedContacts([]);
  };

  const exportContacts = () => {
    const csv = [
      ['Nombre', 'Apellido', 'Email', 'Teléfono', 'Empresa', 'Tipo', 'Notas'].join(','),
      ...filteredContacts.map(c => [c.firstName, c.lastName, c.email, c.phone, c.company, c.type, `"${c.notes}"`].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contactos-ohb-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Filtering, sorting, pagination
  const filteredContacts = useMemo(() => {
    let result = contacts.filter(c => {
      const matchSearch = searchTerm === '' || 
        `${c.firstName} ${c.lastName} ${c.email} ${c.company}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'Todos' || c.type === filterType;
      return matchSearch && matchType;
    });

    result.sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      const comparison = aVal.localeCompare(bVal);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [contacts, searchTerm, filterType, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE);
  const paginatedContacts = filteredContacts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    <span style={{ marginLeft: '0.3rem', fontSize: '0.7rem', color: sortField === field ? 'var(--accent-silver)' : 'var(--text-secondary)' }}>
      {sortField === field ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1>Base de <span className="text-gradient-silver">Contactos</span></h1>
          <p className={styles.subtitle}>
            Directorio unificado de clientes, inversionistas y prospectos. 
            <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: 'var(--accent-silver)' }}>
              ({filteredContacts.length} de {contacts.length})
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className={styles.primaryBtn} onClick={exportContacts} style={{ background: 'transparent', border: '1px solid var(--accent-silver)', color: 'var(--accent-silver)' }}>📥 Exportar CSV</button>
          <button className={styles.primaryBtn} onClick={() => handleOpenEdit()}>+ Nuevo Contacto</button>
        </div>
      </header>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Buscar por nombre, email, empresa..." 
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {contactTypes.map(type => (
            <button 
              key={type} 
              onClick={() => { setFilterType(type); setCurrentPage(1); }}
              style={{ 
                padding: '0.5rem 1rem', borderRadius: '20px', 
                background: filterType === type ? 'var(--accent-silver)' : 'rgba(255,255,255,0.05)',
                color: filterType === type ? '#0B0F19' : 'var(--text-secondary)',
                border: '1px solid var(--glass-border)', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: filterType === type ? 'bold' : 'normal',
                transition: 'all 0.2s ease'
              }}
            >
              {type === 'Todos' ? 'Todos' : typeLabels[type]}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setViewMode('table')}
            style={{ padding: '0.5rem 0.8rem', background: viewMode === 'table' ? 'var(--accent-silver)' : 'transparent', color: viewMode === 'table' ? '#0B0F19' : 'var(--text-secondary)', border: '1px solid var(--glass-border)', borderRadius: '6px', cursor: 'pointer' }}
            title="Vista tabla"
          >☰</button>
          <button 
            onClick={() => setViewMode('cards')}
            style={{ padding: '0.5rem 0.8rem', background: viewMode === 'cards' ? 'var(--accent-silver)' : 'transparent', color: viewMode === 'cards' ? '#0B0F19' : 'var(--text-secondary)', border: '1px solid var(--glass-border)', borderRadius: '6px', cursor: 'pointer' }}
            title="Vista tarjetas"
          >▦</button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '0.6rem 1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#f87171' }}>{selectedContacts.length} contacto(s) seleccionado(s)</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setSelectedContacts([])} style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Deseleccionar</button>
            <button onClick={handleBulkDelete} style={{ padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>🗑 Eliminar Seleccionados</button>
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className={`glass-panel`} style={{ padding: '1.5rem', marginTop: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.8rem', width: '40px' }}>
                  <input type="checkbox" onChange={e => setSelectedContacts(e.target.checked ? paginatedContacts.map(c => c.id) : [])} checked={selectedContacts.length === paginatedContacts.length && paginatedContacts.length > 0} style={{ accentColor: 'var(--accent-silver)' }} />
                </th>
                <th style={{ padding: '0.8rem', width: '35px' }}>★</th>
                <th style={{ padding: '0.8rem', cursor: 'pointer' }} onClick={() => handleSort('firstName')}>Nombre <SortIcon field="firstName" /></th>
                <th style={{ padding: '0.8rem', cursor: 'pointer' }} onClick={() => handleSort('lastName')}>Apellido <SortIcon field="lastName" /></th>
                <th style={{ padding: '0.8rem', cursor: 'pointer' }} onClick={() => handleSort('email')}>Email <SortIcon field="email" /></th>
                <th style={{ padding: '0.8rem' }}>Teléfono</th>
                <th style={{ padding: '0.8rem' }}>Tipo</th>
                <th style={{ padding: '0.8rem' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedContacts.map(contact => (
                <tr key={contact.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '0.8rem' }}>
                    <input type="checkbox" checked={selectedContacts.includes(contact.id)} onChange={() => toggleSelectContact(contact.id)} style={{ accentColor: 'var(--accent-silver)' }} />
                  </td>
                  <td style={{ padding: '0.8rem' }}>
                    <button onClick={() => toggleFavorite(contact.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                      {contact.isFavorite ? '⭐' : '☆'}
                    </button>
                  </td>
                  <td style={{ padding: '0.8rem', color: '#fff', fontWeight: 'bold' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-silver), rgba(255,255,255,0.3))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B0F19', fontWeight: 'bold', fontSize: '0.6rem', flexShrink: 0 }}>
                        {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                      </div>
                      {contact.firstName}
                    </div>
                  </td>
                  <td style={{ padding: '0.8rem', color: '#fff' }}>{contact.lastName}</td>
                  <td style={{ padding: '0.8rem', color: '#fff', fontSize: '0.85rem' }}>{contact.email}</td>
                  <td style={{ padding: '0.8rem', color: '#fff', fontSize: '0.85rem' }}>{contact.phone}</td>
                  <td style={{ padding: '0.8rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', background: typeColors[contact.type]?.bg, color: typeColors[contact.type]?.text }}>
                      {typeLabels[contact.type]}
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem' }}>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button onClick={() => handleOpenEdit(contact)} style={{ background: 'transparent', border: '1px solid var(--accent-silver)', color: 'var(--accent-silver)', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Editar</button>
                      <button onClick={() => setShowDeleteConfirm(contact.id)} style={{ background: 'transparent', border: '1px solid #f87171', color: '#f87171', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedContacts.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {searchTerm || filterType !== 'Todos' ? 'No se encontraron contactos con esos filtros.' : 'No hay contactos en la base de datos.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Cards View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          {paginatedContacts.map(contact => (
            <div key={contact.id} className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-silver), rgba(255,255,255,0.3))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B0F19', fontWeight: 'bold', fontSize: '0.7rem' }}>
                    {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{contact.firstName} {contact.lastName}</div>
                    <span style={{ padding: '0.1rem 0.4rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 'bold', background: typeColors[contact.type]?.bg, color: typeColors[contact.type]?.text }}>{typeLabels[contact.type]}</span>
                  </div>
                </div>
                <button onClick={() => toggleFavorite(contact.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>
                  {contact.isFavorite ? '⭐' : '☆'}
                </button>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>📧 {contact.email}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>📱 {contact.phone}</div>
              {contact.company && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>🏢 {contact.company}</div>}
              {contact.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderTop: '1px solid var(--glass-border)', paddingTop: '0.5rem' }}>💬 {contact.notes}</div>}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                <button onClick={() => handleOpenEdit(contact)} style={{ flex: 1, padding: '0.4rem', background: 'transparent', border: '1px solid var(--accent-silver)', color: 'var(--accent-silver)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Editar</button>
                <button onClick={() => setShowDeleteConfirm(contact.id)} style={{ flex: 1, padding: '0.4rem', background: 'transparent', border: '1px solid #f87171', color: '#f87171', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', alignItems: 'center' }}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}>← Anterior</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)} style={{ padding: '0.4rem 0.7rem', background: currentPage === page ? 'var(--accent-silver)' : 'rgba(255,255,255,0.05)', color: currentPage === page ? '#0B0F19' : 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '6px', cursor: 'pointer', fontWeight: currentPage === page ? 'bold' : 'normal' }}>{page}</button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1 }}>Siguiente →</button>
        </div>
      )}

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className={`glass-panel`} style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>{contacts.some(c => c.id === editingContact.id) ? '✏️ Editar Contacto' : '✨ Nuevo Contacto'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Nombre(s) <span style={{ color: '#f87171' }}>*</span></label>
                  <input required type="text" value={editingContact.firstName || ''} onChange={(e) => setEditingContact({...editingContact, firstName: e.target.value})} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Apellidos <span style={{ color: '#f87171' }}>*</span></label>
                  <input required type="text" value={editingContact.lastName || ''} onChange={(e) => setEditingContact({...editingContact, lastName: e.target.value})} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Correo Electrónico <span style={{ color: '#f87171' }}>*</span></label>
                  <input required type="email" value={editingContact.email || ''} onChange={(e) => setEditingContact({...editingContact, email: e.target.value})} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Teléfono <span style={{ color: '#f87171' }}>*</span></label>
                  <input required type="tel" value={editingContact.phone || ''} onChange={(e) => setEditingContact({...editingContact, phone: e.target.value})} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Empresa</label>
                  <input type="text" value={editingContact.company || ''} onChange={(e) => setEditingContact({...editingContact, company: e.target.value})} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tipo</label>
                  <select value={editingContact.type || 'prospecto'} onChange={(e) => setEditingContact({...editingContact, type: e.target.value as Contact['type']})} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none' }}>
                    <option value="cliente" style={{color: '#0B0F19'}}>Cliente</option>
                    <option value="prospecto" style={{color: '#0B0F19'}}>Prospecto</option>
                    <option value="asesor" style={{color: '#0B0F19'}}>Asesor</option>
                    <option value="proveedor" style={{color: '#0B0F19'}}>Proveedor</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Notas</label>
                <textarea value={editingContact.notes || ''} onChange={(e) => setEditingContact({...editingContact, notes: e.target.value})} rows={3} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, background: 'var(--accent-silver)', color: '#0B0F19', border: 'none', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '1rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '380px', width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ marginBottom: '0.5rem' }}>¿Eliminar contacto?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Esta acción no se puede deshacer. El contacto será eliminado permanentemente.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowDeleteConfirm(null)} style={{ flex: 1, padding: '0.7rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} style={{ flex: 1, padding: '0.7rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
