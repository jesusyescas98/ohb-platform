"use client";

import { useState, useEffect } from 'react';
import LeadCaptureModal from './LeadCaptureModal';
import styles from './MortgageCalculator.module.css';

export default function MortgageCalculator() {
  const [amount, setAmount] = useState<number>(300000);
  const [interest, setInterest] = useState<number>(5.5);
  const [years, setYears] = useState<number>(30);
  const [showAmortization, setShowAmortization] = useState<boolean>(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('ohb_lead_captured') === 'true') {
        setLeadCaptured(true);
      }
    } catch { /* ignore */ }
  }, []);

  const calculateMonthlyPayment = () => {
    const principal = amount;
    const monthlyInterest = interest / 100 / 12;
    const numberOfPayments = years * 12;

    if (monthlyInterest === 0) return principal / numberOfPayments;

    const payment =
      (principal * monthlyInterest * Math.pow(1 + monthlyInterest, numberOfPayments)) /
      (Math.pow(1 + monthlyInterest, numberOfPayments) - 1);

    return payment.toFixed(2);
  };

  const monthlyPayment = calculateMonthlyPayment();

  const generateYearlyAmortization = () => {
    const principal = amount;
    const monthlyInterest = interest / 100 / 12;
    const numberOfPayments = years * 12;
    let balance = principal;
    const payment = Number(calculateMonthlyPayment());
    const schedule = [];

    let yearlyInterest = 0;
    let yearlyPrincipal = 0;

    for (let i = 1; i <= numberOfPayments; i++) {
        const interestPayment = balance * monthlyInterest;
        const principalPayment = payment - interestPayment;
        yearlyInterest += interestPayment;
        yearlyPrincipal += principalPayment;
        balance -= principalPayment;

        if (i % 12 === 0 || i === numberOfPayments) {
            schedule.push({
                year: Math.ceil(i / 12),
                principalPayment: yearlyPrincipal,
                interestPayment: yearlyInterest,
                balance: balance > 0 ? balance : 0
            });
            yearlyInterest = 0;
            yearlyPrincipal = 0;
        }
    }
    return schedule;
  };

  const schedule = showAmortization ? generateYearlyAmortization() : [];

  return (
    <div className={`glass-panel ${styles.calculator}`}>
      <h3 className={styles.title}>Calculadora de Hipoteca</h3>
      
      <div className={styles.inputGroup}>
        <div className={styles.labelRow}>
          <label>Monto del Préstamo</label>
          <div className={styles.inputWrapper}>
            <span className={styles.prefix}>$</span>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(Number(e.target.value))}
              className={styles.numberInput}
            />
          </div>
        </div>
        <input 
          type="range" 
          min="50000" 
          max="2000000" 
          step="10000"
          value={amount} 
          onChange={(e) => setAmount(Number(e.target.value))}
          className={styles.range}
        />
      </div>

      <div className={styles.inputGroup}>
        <div className={styles.labelRow}>
          <label>Tasa de Interés Anual</label>
          <span className={styles.valueDisplay}>{interest.toFixed(1)}%</span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="15" 
          step="0.1"
          value={interest} 
          onChange={(e) => setInterest(Number(e.target.value))}
          className={styles.range}
        />
      </div>

      <div className={styles.inputGroup}>
        <div className={styles.labelRow}>
          <label>Plazo</label>
          <span className={styles.valueDisplay}>{years} Años</span>
        </div>
         <input 
          type="range" 
          min="5" 
          max="30" 
          step="1"
          value={years} 
          onChange={(e) => setYears(Number(e.target.value))}
          className={styles.range}
        />
      </div>

      <div className={styles.result}>
        <h4>Pago Mensual Estimado</h4>
        <div className={styles.amount}>
          ${Number(monthlyPayment).toLocaleString('es-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <button
          onClick={() => {
            if (!leadCaptured && !showAmortization) {
              setShowLeadModal(true);
            } else {
              setShowAmortization(!showAmortization);
            }
          }}
          style={{ marginTop: '1.5rem', padding: '0.8rem 1.5rem', background: 'transparent', color: 'var(--accent-blue, var(--accent-silver))', border: '1px solid var(--accent-blue, var(--accent-silver))', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-inter)', fontWeight: 'bold', transition: 'all 0.3s ease', width: '100%' }}
        >
          {showAmortization ? 'Ocultar Tabla de Amortización' : 'Ver Tabla de Amortización'}
        </button>
      </div>

      <LeadCaptureModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onSubmit={() => {
          setShowLeadModal(false);
          setLeadCaptured(true);
          setShowAmortization(true);
        }}
        title="Ver tabla de amortización completa"
        description="Ingresa tus datos para acceder al análisis detallado de tu hipoteca. Un asesor puede ayudarte a encontrar la mejor tasa."
        source="calculadora"
      />

      {showAmortization && (
        <div style={{ marginTop: '2rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', maxHeight: '300px', overflowY: 'auto' }}>
          <h4 style={{ marginBottom: '1rem', textAlign: 'center', color: 'var(--text-primary)' }}>Resumen Anual</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.5rem' }}>Año</th>
                <th style={{ padding: '0.5rem' }}>A Capital</th>
                <th style={{ padding: '0.5rem' }}>Intereses</th>
                <th style={{ padding: '0.5rem' }}>Saldo Final</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.year} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.5rem', color: 'var(--text-primary)' }}>{row.year}</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>${row.principalPayment.toLocaleString('es-US', { maximumFractionDigits: 0 })}</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>${row.interestPayment.toLocaleString('es-US', { maximumFractionDigits: 0 })}</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>${row.balance.toLocaleString('es-US', { maximumFractionDigits: 0 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
