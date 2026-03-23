"use client";

import { useState, useEffect } from 'react';
import styles from '../Dashboard.module.css';
import { AppointmentsDB, ActivityLogDB, type AppointmentRecord } from '../../../lib/database';
import { useAuth } from '../../../context/AuthContext';

const typeColors: Record<string, string> = {
  visita: '#4ade80',
  reunion: '#38bdf8',
  firma: '#f59e0b',
  seguimiento: '#a855f7',
  otro: '#64748b',
};

const typeLabels: Record<string, string> = {
  visita: '🏠 Visita',
  reunion: '🤝 Reunión',
  firma: '✍️ Firma',
  seguimiento: '📞 Seguimiento',
  otro: '📋 Otro',
};

export default function CalendarPage() {
  const { email: userEmail, fullName } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Partial<AppointmentRecord>>({});

  useEffect(() => {
    setAppointments(AppointmentsDB.getAll());
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth, year, month };
  };

  const { firstDay, daysInMonth, year, month } = getDaysInMonth(currentDate);

  const navigateMonth = (dir: number) => {
    setCurrentDate(new Date(year, month + dir, 1));
  };

  const getAppointmentsForDate = (dateStr: string) => {
    return appointments.filter(a => a.date === dateStr);
  };

  const handleOpenEdit = (date?: string, appt?: AppointmentRecord) => {
    if (appt) {
      setEditingAppt({ ...appt });
    } else {
      setEditingAppt({
        id: `APT-${Date.now().toString(36).toUpperCase()}`,
        title: '',
        date: date || today,
        time: '10:00',
        endTime: '11:00',
        client: '',
        clientPhone: '',
        property: '',
        type: 'visita',
        advisor: fullName || '',
        notes: '',
        color: typeColors.visita,
        completed: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppt.id || !editingAppt.title) return;
    const appt = { ...editingAppt, color: typeColors[editingAppt.type || 'otro'], updatedAt: Date.now() } as AppointmentRecord;
    if (!appt.createdAt) appt.createdAt = Date.now();
    AppointmentsDB.upsert(appt);
    ActivityLogDB.add({ userEmail: userEmail || '', userName: fullName || '', action: 'APPOINTMENT_SAVED', details: `Cita "${appt.title}" para ${appt.date}`, module: 'calendar' });
    setAppointments(AppointmentsDB.getAll());
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar esta cita?')) {
      AppointmentsDB.delete(id);
      ActivityLogDB.add({ userEmail: userEmail || '', userName: fullName || '', action: 'APPOINTMENT_DELETED', details: `Cita ${id} eliminada`, module: 'calendar' });
      setAppointments(AppointmentsDB.getAll());
    }
  };

  const toggleComplete = (id: string) => {
    const appt = appointments.find(a => a.id === id);
    if (appt) {
      AppointmentsDB.upsert({ ...appt, completed: !appt.completed });
      setAppointments(AppointmentsDB.getAll());
    }
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Upcoming appointments
  const upcoming = appointments
    .filter(a => a.date >= today && !a.completed)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 5);

  // Selected date appointments
  const selectedDateAppts = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1>📅 <span className="text-gradient-silver">Calendario</span></h1>
          <p className={styles.subtitle}>Gestiona citas, visitas y reuniones con clientes.</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => handleOpenEdit()}>+ Nueva Cita</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
        {/* Calendar Grid */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          {/* Calendar Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <button onClick={() => navigateMonth(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer' }}>◀</button>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-outfit)' }}>{monthNames[month]} {year}</h3>
            <button onClick={() => navigateMonth(1)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer' }}>▶</button>
          </div>

          {/* Day Names */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '0.5rem' }}>
            {dayNames.map(day => (
              <div key={day} style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.3rem', fontWeight: 'bold' }}>{day}</div>
            ))}
          </div>

          {/* Calendar Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} style={{ padding: '0.5rem', minHeight: '70px' }}></div>
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayAppts = getAppointmentsForDate(dateStr);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  style={{
                    padding: '0.4rem',
                    minHeight: '70px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: isSelected ? 'rgba(192, 198, 204, 0.15)' : isToday ? 'rgba(74, 222, 128, 0.08)' : 'rgba(255,255,255,0.02)',
                    border: isToday ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid transparent',
                  }}
                >
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: isToday ? 'bold' : 'normal',
                    color: isToday ? '#4ade80' : 'var(--text-primary)',
                    marginBottom: '0.2rem',
                  }}>{day}</div>
                  {dayAppts.slice(0, 2).map(appt => (
                    <div
                      key={appt.id}
                      style={{
                        fontSize: '0.6rem',
                        padding: '0.1rem 0.3rem',
                        borderRadius: '3px',
                        marginBottom: '1px',
                        background: `${appt.color}20`,
                        color: appt.color,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textDecoration: appt.completed ? 'line-through' : 'none',
                        opacity: appt.completed ? 0.5 : 1,
                      }}
                    >
                      {appt.time} {appt.title}
                    </div>
                  ))}
                  {dayAppts.length > 2 && (
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>+{dayAppts.length - 2} más</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Selected Date Detail */}
          {selectedDate && (
            <div className="glass-panel" style={{ padding: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <h4 style={{ fontSize: '0.95rem' }}>📋 {selectedDate}</h4>
                <button onClick={() => handleOpenEdit(selectedDate)} style={{ background: 'none', border: '1px solid var(--glass-border)', color: 'var(--accent-silver)', padding: '0.2rem 0.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem' }}>+ Cita</button>
              </div>
              {selectedDateAppts.length > 0 ? (
                selectedDateAppts.map(appt => (
                  <div key={appt.id} style={{
                    padding: '0.6rem',
                    marginBottom: '0.4rem',
                    borderRadius: '8px',
                    borderLeft: `3px solid ${appt.color}`,
                    background: 'rgba(255,255,255,0.02)',
                    opacity: appt.completed ? 0.5 : 1,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.85rem', textDecoration: appt.completed ? 'line-through' : 'none' }}>{appt.title}</span>
                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                        <button onClick={() => toggleComplete(appt.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>{appt.completed ? '↩️' : '✅'}</button>
                        <button onClick={() => handleOpenEdit(undefined, appt)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>✏️</button>
                        <button onClick={() => handleDelete(appt.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>🗑️</button>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      🕐 {appt.time} - {appt.endTime} • {typeLabels[appt.type]}
                    </div>
                    {appt.client && <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>👤 {appt.client}</div>}
                    {appt.property && <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>🏠 {appt.property}</div>}
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>Sin citas para esta fecha</p>
              )}
            </div>
          )}

          {/* Upcoming */}
          <div className="glass-panel" style={{ padding: '1.2rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.8rem' }}>⏰ Próximas Citas</h4>
            {upcoming.length > 0 ? (
              upcoming.map(appt => (
                <div key={appt.id} style={{ padding: '0.5rem', marginBottom: '0.3rem', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', borderLeft: `2px solid ${appt.color}`, paddingLeft: '0.7rem' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{appt.title}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>📅 {appt.date} • 🕐 {appt.time}</div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Sin citas próximas</p>
            )}
          </div>

          {/* Type Legend */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Tipos de cita</h4>
            {Object.entries(typeLabels).map(([key, label]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: typeColors[key] }}></span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', margin: '1rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>
              {appointments.some(a => a.id === editingAppt.id) ? '✏️ Editar Cita' : '📅 Nueva Cita'}
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Título de la cita *</label>
                <input required className={styles.formInput} value={editingAppt.title || ''} onChange={e => setEditingAppt({...editingAppt, title: e.target.value})} placeholder="Ej: Visita propiedad X" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Fecha *</label>
                  <input required className={styles.formInput} type="date" value={editingAppt.date || ''} onChange={e => setEditingAppt({...editingAppt, date: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Hora inicio *</label>
                  <input required className={styles.formInput} type="time" value={editingAppt.time || ''} onChange={e => setEditingAppt({...editingAppt, time: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Hora fin</label>
                  <input className={styles.formInput} type="time" value={editingAppt.endTime || ''} onChange={e => setEditingAppt({...editingAppt, endTime: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Cliente</label>
                  <input className={styles.formInput} value={editingAppt.client || ''} onChange={e => setEditingAppt({...editingAppt, client: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Teléfono cliente</label>
                  <input className={styles.formInput} value={editingAppt.clientPhone || ''} onChange={e => setEditingAppt({...editingAppt, clientPhone: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Propiedad</label>
                  <input className={styles.formInput} value={editingAppt.property || ''} onChange={e => setEditingAppt({...editingAppt, property: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tipo de cita</label>
                  <select className={styles.formSelect} value={editingAppt.type || 'visita'} onChange={e => setEditingAppt({...editingAppt, type: e.target.value as AppointmentRecord['type']})}>
                    <option value="visita">🏠 Visita</option>
                    <option value="reunion">🤝 Reunión</option>
                    <option value="firma">✍️ Firma</option>
                    <option value="seguimiento">📞 Seguimiento</option>
                    <option value="otro">📋 Otro</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Asesor</label>
                <input className={styles.formInput} value={editingAppt.advisor || ''} onChange={e => setEditingAppt({...editingAppt, advisor: e.target.value})} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Notas</label>
                <textarea className={styles.formTextarea} value={editingAppt.notes || ''} onChange={e => setEditingAppt({...editingAppt, notes: e.target.value})} rows={2} />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.secondaryBtn} style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className={styles.primaryBtn} style={{ flex: 1 }}>💾 Guardar Cita</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Responsive override */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 320px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
