'use client';

import { useState } from 'react';
import { savePublicLead } from '../lib/leadBridge';
import type { PublicLeadData } from '../lib/leadBridge';
import styles from './LeadCaptureModal.module.css';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title?: string;
  description?: string;
  source: PublicLeadData['source'];
}

export default function LeadCaptureModal({
  isOpen,
  onClose,
  onSubmit,
  title = 'Accede a los resultados completos',
  description = 'Ingresa tus datos para ver el análisis detallado. Un asesor podrá ayudarte con cualquier duda.',
  source,
}: LeadCaptureModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePublicLead({ name, phone, email, source });
    // Mark as captured in session so we don't ask again
    try {
      sessionStorage.setItem('ohb_lead_captured', 'true');
    } catch { /* ignore */ }
    onSubmit();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        <div className={styles.icon}>📊</div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={e => setName(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="tel"
            placeholder="Tu teléfono"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="email"
            placeholder="Tu email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.submitBtn}>
            Ver Resultados Completos
          </button>
        </form>
      </div>
    </div>
  );
}
