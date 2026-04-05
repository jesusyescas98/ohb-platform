"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import styles from './Investments.module.css';
import { TrendingUp, Calendar, DollarSign, Shield, Clock, CheckCircle, X, Edit3, Save, AlertTriangle, Phone, Mail, User, MessageSquare, Send } from 'lucide-react';

// Default rates structure
const DEFAULT_RATES = {
  month: new Date().toLocaleString('es-MX', { month: 'long', year: 'numeric' }),
  monthKey: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
  plans: {
    lessThan400k: {
      label: 'Inversión menor a $400,000 MXN',
      rates: {
        '12': 10.5,
        '18': 12.0,
        '24': 14.0,
      }
    },
    moreThan400k: {
      label: 'Inversión mayor a $400,000 MXN',
      rates: {
        '12': 12.0,
        '18': 14.5,
        '24': 17.0,
      }
    }
  }
};

const RATES_STORAGE_KEY = 'ohb_investment_rates';

function getRates() {
  if (typeof window === 'undefined') return DEFAULT_RATES;
  try {
    const stored = localStorage.getItem(RATES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if data belongs to current month
      if (parsed.monthKey === DEFAULT_RATES.monthKey) {
        return parsed;
      }
    }
  } catch { /* fallthrough */ }
  return DEFAULT_RATES;
}

export default function InvestmentsPage() {
  const { isLoggedIn, role } = useAuth();
  const isAdmin = isLoggedIn && (role === 'admin' || role === 'asesor');

  const [rates, setRates] = useState(DEFAULT_RATES);
  const [isEditing, setIsEditing] = useState(false);
  const [editRates, setEditRates] = useState(DEFAULT_RATES);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    name: '',
    email: '',
    phone: '',
    investmentAmount: '',
    preferredTerm: '12',
    message: '',
  });
  const [appointmentSubmitted, setAppointmentSubmitted] = useState(false);

  useEffect(() => {
    setRates(getRates());
  }, []);

  const handleSaveRates = () => {
    localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(editRates));
    setRates(editRates);
    setIsEditing(false);
  };

  const handleEditRate = (plan: 'lessThan400k' | 'moreThan400k', term: '12' | '18' | '24', value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditRates(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [plan]: {
          ...prev.plans[plan],
          rates: {
            ...prev.plans[plan].rates,
            [term]: numValue,
          }
        }
      }
    }));
  };

  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store appointment in localStorage for demo
    const appointments = JSON.parse(localStorage.getItem('ohb_investment_appointments') || '[]');
    appointments.push({
      ...appointmentForm,
      timestamp: new Date().toISOString(),
      status: 'pending'
    });
    localStorage.setItem('ohb_investment_appointments', JSON.stringify(appointments));
    setAppointmentSubmitted(true);
    setTimeout(() => {
      setShowAppointmentModal(false);
      setAppointmentSubmitted(false);
      setAppointmentForm({ name: '', email: '', phone: '', investmentAmount: '', preferredTerm: '12', message: '' });
    }, 3000);
  };

  const termLabels: Record<string, string> = {
    '12': '12 Meses',
    '18': '18 Meses',
    '24': '24 Meses',
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroGlow}></div>
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <TrendingUp size={16} /> Rendimientos Actualizados
            </div>
            <h1 className={styles.title}>
              Panel de <span className="text-gradient-silver">Inversiones</span>
            </h1>
            <p className={styles.subtitle}>
              Multiplica tu capital con planes de inversión inmobiliaria de alto rendimiento, respaldados por más de 15 años de experiencia en el sector.
            </p>
          </div>
        </section>

        {/* Admin Edit Panel */}
        {isAdmin && (
          <section className={styles.adminPanel}>
            <div className={styles.adminHeader}>
              <div className={styles.adminBadge}>
                <Shield size={16} /> Panel de Administración
              </div>
              {!isEditing ? (
                <button className={styles.editBtn} onClick={() => { setEditRates(rates); setIsEditing(true); }}>
                  <Edit3 size={16} /> Modificar Rendimientos
                </button>
              ) : (
                <div className={styles.editActions}>
                  <button className={styles.saveBtn} onClick={handleSaveRates}>
                    <Save size={16} /> Guardar Cambios
                  </button>
                  <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>
                    <X size={16} /> Cancelar
                  </button>
                </div>
              )}
            </div>
            {isEditing && (
              <div className={styles.editGrid}>
                <div className={styles.adminNote}>
                  <AlertTriangle size={16} />
                  <span>Los porcentajes que modifiques se reflejarán inmediatamente para todos los visitantes del mes en curso: <strong>{rates.month}</strong></span>
                </div>
                {(['lessThan400k', 'moreThan400k'] as const).map(planKey => (
                  <div key={planKey} className={`glass-panel ${styles.editCard}`}>
                    <h4 className={styles.editCardTitle}>{editRates.plans[planKey].label}</h4>
                    <div className={styles.editInputs}>
                      {(['12', '18', '24'] as const).map(term => (
                        <div key={term} className={styles.editRow}>
                          <label>{termLabels[term]}</label>
                          <div className={styles.editInputWrapper}>
                            <input
                              type="number"
                              step="0.1"
                              value={editRates.plans[planKey].rates[term]}
                              onChange={(e) => handleEditRate(planKey, term, e.target.value)}
                              className={styles.editInput}
                            />
                            <span className={styles.editSuffix}>% anual</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Current Month Rates */}
        <section className={styles.ratesSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.monthIndicator}>
              <Calendar size={18} />
              <span>Tabulador de Rendimientos — <strong style={{ textTransform: 'capitalize' }}>{rates.month}</strong></span>
            </div>
          </div>

          <div className={styles.plansGrid}>
            {/* Plan < 400K */}
            <div className={`glass-panel ${styles.planCard}`}>
              <div className={styles.planHeader}>
                <div className={styles.planIcon}>
                  <DollarSign size={28} />
                </div>
                <div>
                  <h3 className={styles.planTitle}>Plan Estándar</h3>
                  <p className={styles.planRange}>Inversión menor a $400,000 MXN</p>
                </div>
              </div>
              <div className={styles.ratesGrid}>
                {(['12', '18', '24'] as const).map(term => (
                  <div key={term} className={styles.rateItem}>
                    <div className={styles.rateTermBadge}>
                      <Clock size={14} /> {termLabels[term]}
                    </div>
                    <div className={styles.rateValue}>
                      {rates.plans.lessThan400k.rates[term]}%
                    </div>
                    <div className={styles.rateLabel}>rendimiento anual</div>
                  </div>
                ))}
              </div>
              <div className={styles.planFeatures}>
                <div className={styles.feature}><CheckCircle size={14} /> Capital respaldado por bienes raíces</div>
                <div className={styles.feature}><CheckCircle size={14} /> Pagos mensuales de intereses</div>
                <div className={styles.feature}><CheckCircle size={14} /> Contrato notarial</div>
              </div>
            </div>

            {/* Plan > 400K */}
            <div className={`glass-panel ${styles.planCard} ${styles.planPremium}`}>
              <div className={styles.premiumBadge}>⭐ Premium</div>
              <div className={styles.planHeader}>
                <div className={`${styles.planIcon} ${styles.planIconPremium}`}>
                  <TrendingUp size={28} />
                </div>
                <div>
                  <h3 className={styles.planTitle}>Plan Premium</h3>
                  <p className={styles.planRange}>Inversión mayor a $400,000 MXN</p>
                </div>
              </div>
              <div className={styles.ratesGrid}>
                {(['12', '18', '24'] as const).map(term => (
                  <div key={term} className={`${styles.rateItem} ${styles.rateItemPremium}`}>
                    <div className={`${styles.rateTermBadge} ${styles.rateTermBadgePremium}`}>
                      <Clock size={14} /> {termLabels[term]}
                    </div>
                    <div className={`${styles.rateValue} ${styles.rateValuePremium}`}>
                      {rates.plans.moreThan400k.rates[term]}%
                    </div>
                    <div className={styles.rateLabel}>rendimiento anual</div>
                  </div>
                ))}
              </div>
              <div className={styles.planFeatures}>
                <div className={styles.feature}><CheckCircle size={14} /> Todos los beneficios del Plan Estándar</div>
                <div className={styles.feature}><CheckCircle size={14} /> Asesor personal dedicado</div>
                <div className={styles.feature}><CheckCircle size={14} /> Acceso prioritario a proyectos</div>
                <div className={styles.feature}><CheckCircle size={14} /> Rendimientos preferenciales</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={`glass-panel ${styles.ctaCard}`}>
            <div className={styles.ctaGlow}></div>
            <h2 className={styles.ctaTitle}>¿Listo para hacer crecer tu capital?</h2>
            <p className={styles.ctaText}>
              Solicita una asesoría personalizada sin costo. Nuestros expertos te ayudarán a encontrar el plan perfecto para tus objetivos financieros.
            </p>
            <button
              className={styles.ctaButton}
              onClick={() => setShowAppointmentModal(true)}
            >
              📅 Solicitar Asesoría de Inversión
            </button>
          </div>
        </section>

        {/* Appointment Modal */}
        {showAppointmentModal && (
          <div className={styles.modalOverlay} onClick={() => !appointmentSubmitted && setShowAppointmentModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              {appointmentSubmitted ? (
                <div className={styles.successContent}>
                  <div className={styles.successIcon}>
                    <CheckCircle size={64} />
                  </div>
                  <h2>¡Solicitud Enviada!</h2>
                  <p>Un asesor de inversión se pondrá en contacto contigo dentro de las próximas 24 horas hábiles.</p>
                </div>
              ) : (
                <>
                  <div className={styles.modalHeader}>
                    <h2>Solicitar Asesoría de Inversión</h2>
                    <p>Completa el formulario y un asesor te contactará para programar tu cita.</p>
                    <button className={styles.modalClose} onClick={() => setShowAppointmentModal(false)}>
                      <X size={24} />
                    </button>
                  </div>
                  <form className={styles.appointmentForm} onSubmit={handleAppointmentSubmit}>
                    <div className={styles.formGroup}>
                      <label><User size={16} /> Nombre Completo</label>
                      <input
                        type="text"
                        required
                        placeholder="Tu nombre completo"
                        value={appointmentForm.name}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label><Mail size={16} /> Correo Electrónico</label>
                        <input
                          type="email"
                          required
                          placeholder="correo@ejemplo.com"
                          value={appointmentForm.email}
                          onChange={(e) => setAppointmentForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label><Phone size={16} /> Teléfono</label>
                        <input
                          type="tel"
                          required
                          placeholder="(656) 123-4567"
                          value={appointmentForm.phone}
                          onChange={(e) => setAppointmentForm(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label><DollarSign size={16} /> Monto Estimado de Inversión</label>
                        <select
                          required
                          value={appointmentForm.investmentAmount}
                          onChange={(e) => setAppointmentForm(prev => ({ ...prev, investmentAmount: e.target.value }))}
                        >
                          <option value="">Selecciona un rango</option>
                          <option value="100k-200k">$100,000 - $200,000 MXN</option>
                          <option value="200k-400k">$200,000 - $400,000 MXN</option>
                          <option value="400k-700k">$400,000 - $700,000 MXN</option>
                          <option value="700k-1M">$700,000 - $1,000,000 MXN</option>
                          <option value="1M+">Más de $1,000,000 MXN</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label><Calendar size={16} /> Plazo de Interés</label>
                        <select
                          value={appointmentForm.preferredTerm}
                          onChange={(e) => setAppointmentForm(prev => ({ ...prev, preferredTerm: e.target.value }))}
                        >
                          <option value="12">12 Meses</option>
                          <option value="18">18 Meses</option>
                          <option value="24">24 Meses</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label><MessageSquare size={16} /> Mensaje (Opcional)</label>
                      <textarea
                        placeholder="¿Tienes alguna pregunta o comentario adicional?"
                        rows={3}
                        value={appointmentForm.message}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, message: e.target.value }))}
                      ></textarea>
                    </div>
                    <button type="submit" className={styles.submitBtn}>
                      <Send size={18} /> Enviar Solicitud
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
