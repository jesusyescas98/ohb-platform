"use client";

import { useState } from 'react';
import styles from './InvestmentCalculator.module.css';

export default function InvestmentCalculator() {
  const [amount, setAmount] = useState<number>(500000);
  const [months, setMonths] = useState<number>(12);
  const [monthlyYield, setMonthlyYield] = useState<number>(1.2); // OHB monthly percentage

  const totalYield = amount * (monthlyYield / 100) * months;
  const totalReturn = amount + totalYield;

  return (
    <div className={`glass-panel ${styles.calculator}`}>
      <h3 className={styles.title}>Simulador de Inversión Fija OHB</h3>
      
      <div className={styles.inputGroup}>
        <div className={styles.labelRow}>
          <label>Monto de Inversión</label>
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
          min="100000" 
          max="10000000" 
          step="50000"
          value={amount} 
          onChange={(e) => setAmount(Number(e.target.value))}
          className={styles.range}
        />
      </div>

      <div className={styles.inputGroup}>
        <div className={styles.labelRow}>
          <label>Plazo Estimado (Meses)</label>
          <span className={styles.valueDisplay}>{months} Meses</span>
        </div>
        <input 
          type="range" 
          min="3" 
          max="60" 
          step="3"
          value={months} 
          onChange={(e) => setMonths(Number(e.target.value))}
          className={styles.range}
        />
      </div>

      <div className={styles.inputGroup}>
        <div className={styles.labelRow}>
          <label>Tasa Mensual OHB</label>
          <div className={styles.inputWrapper}>
            <input 
              type="number" 
              value={monthlyYield} 
              step="0.1"
              onChange={(e) => setMonthlyYield(Number(e.target.value))}
              className={styles.numberInput}
              style={{ width: '60px' }}
            />
            <span className={styles.suffix}>%</span>
          </div>
        </div>
      </div>

      <div className={styles.resultContainer}>
        <div className={styles.resultItem}>
          <h4>Rendimiento Generado</h4>
          <div className={styles.yieldAmount}>
            + ${totalYield.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className={styles.resultItem}>
          <h4>Retorno Total Estimado</h4>
          <div className={styles.totalAmount}>
            ${totalReturn.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
}
