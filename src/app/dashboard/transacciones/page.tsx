"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../Dashboard.module.css';
import { useAuth } from '../../../context/AuthContext';
import { LeadsDB, PropertiesDB } from '../../../lib/database';

interface Transaction {
  id: string;
  leadName: string;
  propertyTitle: string;
  type: 'venta' | 'renta';
  amount: number;
  commission: number;
  advisor: string;
  status: 'prospect' | 'offer' | 'under_contract' | 'closed';
  closedDate: string;
  documents: string[];
}

export default function TransaccionesPage() {
  const { role } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Generate transactions from closed leads
    const leads = LeadsDB.getAll();
    const properties = PropertiesDB.getAll();

    const txns: Transaction[] = leads
      .filter(l => l.status === 'cerrados')
      .map(l => ({
        id: `TXN-${l.id}`,
        leadName: l.name,
        propertyTitle: properties.find(p => p.title.includes(l.interest))?.title || l.interest,
        type: l.interestType === 'renta' ? 'renta' : 'venta',
        amount: (l.budgetMax + l.budgetMin) / 2,
        commission: ((l.budgetMax + l.budgetMin) / 2) * 0.03,
        advisor: l.advisor,
        status: 'closed' as const,
        closedDate: l.lastInteraction,
        documents: ['Contrato', 'Recibo'],
      }));

    setTransactions(txns);
  }, []);

  const filtered = transactions
    .filter(t => filter === 'all' || t.status === filter)
    .filter(t => t.leadName.toLowerCase().includes(search.toLowerCase()));

  const totalAmount = filtered.reduce((acc, t) => acc + t.amount, 0);
  const totalCommission = filtered.reduce((acc, t) => acc + t.commission, 0);

  const statusColors: Record<string, string> = {
    prospect: '#3b82f6',
    offer: '#f59e0b',
    under_contract: '#8b5cf6',
    closed: '#10b981',
  };

  const statusLabels: Record<string, string> = {
    prospect: 'Prospecto',
    offer: 'Oferta',
    under_contract: 'En Contrato',
    closed: 'Cerrado',
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>💼 Transacciones</h1>
          <p className={styles.subtitle}>Registro completo de ventas, rentas y comisiones</p>
        </div>
        {role === 'admin' && (
          <button className={styles.primaryBtn}>
            ➕ Nueva Transacción
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className={styles.metricsGrid}>
        <div className="glass-panel" style={{ padding: '1.3rem' }}>
          <div className={styles.metricTitle}>Monto Total</div>
          <div className={styles.metricValue}>
            ${(totalAmount / 1000000).toFixed(1)}M
          </div>
          <div className={styles.trend} style={{ color: '#10b981' }}>↑ {filtered.length} transacciones</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.3rem' }}>
          <div className={styles.metricTitle}>Comisión Total</div>
          <div className={styles.metricValue}>
            ${(totalCommission / 1000).toFixed(0)}K
          </div>
          <div className={styles.trend} style={{ color: '#f59e0b' }}>3% promedio</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.3rem' }}>
          <div className={styles.metricTitle}>Cerradas</div>
          <div className={styles.metricValue}>{filtered.filter(t => t.status === 'closed').length}</div>
          <div className={styles.trend} style={{ color: '#10b981' }}>100% completadas</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.pageToolbar}>
        <input
          type="text"
          placeholder="🔍 Buscar por cliente o propiedad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.toolbarSearch}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={styles.formSelect}
          style={{ minWidth: '150px' }}
        >
          <option value="all">Todos los estados</option>
          <option value="prospect">Prospecto</option>
          <option value="offer">Oferta</option>
          <option value="under_contract">En Contrato</option>
          <option value="closed">Cerrado</option>
        </select>
        <button className={styles.toolbarBtn}>
          📊 Exportar CSV
        </button>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className={styles.sectionTitle}>Estado de Transacciones</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.85rem',
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                <th style={{ padding: '0.8rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Cliente</th>
                <th style={{ padding: '0.8rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Propiedad</th>
                <th style={{ padding: '0.8rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Tipo</th>
                <th style={{ padding: '0.8rem', textAlign: 'right', color: 'var(--text-secondary)' }}>Monto</th>
                <th style={{ padding: '0.8rem', textAlign: 'right', color: 'var(--text-secondary)' }}>Comisión</th>
                <th style={{ padding: '0.8rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Estado</th>
                <th style={{ padding: '0.8rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Asesor</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(txn => (
                <tr key={txn.id} style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  transition: 'background 0.2s',
                }}>
                  <td style={{ padding: '0.8rem' }}><strong>{txn.leadName}</strong></td>
                  <td style={{ padding: '0.8rem', color: 'var(--text-secondary)' }}>{txn.propertyTitle}</td>
                  <td style={{ padding: '0.8rem' }}>
                    <span style={{
                      background: txn.type === 'venta' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      color: txn.type === 'venta' ? '#22c55e' : '#3b82f6',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}>
                      {txn.type === 'venta' ? 'Venta' : 'Renta'}
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem', textAlign: 'right', fontWeight: '600' }}>
                    ${(txn.amount / 1000000).toFixed(2)}M
                  </td>
                  <td style={{ padding: '0.8rem', textAlign: 'right', color: '#f59e0b', fontWeight: '600' }}>
                    ${(txn.commission / 1000).toFixed(0)}K
                  </td>
                  <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                    <span style={{
                      background: `${statusColors[txn.status]}20`,
                      color: statusColors[txn.status],
                      padding: '0.3rem 0.8rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}>
                      {statusLabels[txn.status]}
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem', color: 'var(--text-secondary)' }}>{txn.advisor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Tracking */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <div className={styles.sectionTitle}>📋 Pago de Comisiones</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginTop: '1rem',
        }}>
          {['Carlos M.', 'Ana P.', 'Luis G.'].map(advisor => {
            const advisorTxns = filtered.filter(t => t.advisor === advisor);
            const advisorCommission = advisorTxns.reduce((acc, t) => acc + t.commission, 0);
            return (
              <div key={advisor} style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '10px',
                border: '1px solid var(--glass-border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <span style={{ fontWeight: '600' }}>👤 {advisor}</span>
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                  }}>
                    Pendiente
                  </span>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.5rem' }}>
                  ${(advisorCommission / 1000).toFixed(0)}K
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {advisorTxns.length} transacción{advisorTxns.length !== 1 ? 'es' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
