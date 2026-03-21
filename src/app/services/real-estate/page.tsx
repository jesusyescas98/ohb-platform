"use client";

import { useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import styles from './RealEstate.module.css';
import { 
  Home, ShoppingCart, Tag, ArrowRight, CheckCircle, FileText, 
  Camera, MapPin, Phone, Mail, User, DollarSign, 
  Send, X, ChevronDown, AlertTriangle, Search, Building,
  Shield, Percent, Calculator
} from 'lucide-react';

const COMMISSION_TIERS = [
  { min: 1_000_000, max: 1_999_999, rate: 7, label: '$1,000,000 - $1,999,999 MXN' },
  { min: 2_000_000, max: 4_999_999, rate: 6, label: '$2,000,000 - $4,999,999 MXN' },
  { min: 5_000_000, max: Infinity, rate: 5, label: '$5,000,000+ MXN' },
];

function getCommissionRate(value: number): number {
  for (const tier of COMMISSION_TIERS) {
    if (value >= tier.min && value <= tier.max) return tier.rate;
  }
  return 7; // default
}

export default function RealEstatePage() {
  const [showSellForm, setShowSellForm] = useState(false);
  const [sellForm, setSellForm] = useState({
    ownerName: '',
    email: '',
    phone: '',
    propertyAddress: '',
    city: '',
    colonia: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    sqMeters: '',
    landSqMeters: '',
    askingPrice: '',
    description: '',
    hasPhotos: false,
    acceptsTerms: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const askingPriceNum = parseFloat(sellForm.askingPrice.replace(/,/g, '')) || 0;
  const commissionRate = getCommissionRate(askingPriceNum);
  const commissionAmount = askingPriceNum * (commissionRate / 100);

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellForm.acceptsTerms) {
      alert('Debes aceptar los términos y condiciones para continuar.');
      return;
    }
    const listings = JSON.parse(localStorage.getItem('ohb_sell_listings') || '[]');
    listings.push({
      ...sellForm,
      commissionRate,
      commissionAmount,
      timestamp: new Date().toISOString(),
      status: 'pending_review'
    });
    localStorage.setItem('ohb_sell_listings', JSON.stringify(listings));
    setSubmitted(true);
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
              <Building size={16}/> Servicios Inmobiliarios Integrales
            </div>
            <h1 className={styles.title}>
              Servicios de <span className="text-gradient-silver">Compra-Venta</span>
            </h1>
            <p className={styles.subtitle}>
              Asesoramiento integral y profesional para adquirir o vender inmuebles, maximizando tu beneficio en cada transacción.
            </p>
          </div>
        </section>

        {/* Options Grid */}
        {!showSellForm && (
          <section className={styles.optionsGrid}>
            {/* COMPRAR */}
            <Link href="/portfolio" className={`glass-panel ${styles.optionCard}`}>
              <div className={styles.optionGlow} style={{ background: 'radial-gradient(ellipse, rgba(42, 75, 130, 0.15) 0%, transparent 70%)' }}></div>
              <div className={styles.optionIcon}>
                <ShoppingCart size={36} />
              </div>
              <h2 className={styles.optionTitle}>Comprar</h2>
              <p className={styles.optionDesc}>
                Explora nuestro catálogo completo de propiedades disponibles. Te acompañamos desde la búsqueda hasta la firma, garantizando seguridad legal y las mejores opciones financieras.
              </p>
              <div className={styles.optionFeatures}>
                <div className={styles.optionFeature}><CheckCircle size={14} /> Acceso a todo el inventario</div>
                <div className={styles.optionFeature}><CheckCircle size={14} /> Asesoría legal incluida</div>
                <div className={styles.optionFeature}><CheckCircle size={14} /> Opciones de financiamiento</div>
                <div className={styles.optionFeature}><CheckCircle size={14} /> Avalúo profesional</div>
              </div>
              <div className={styles.optionCta}>
                <span>Ver Inventario de Propiedades</span>
                <ArrowRight size={20} className={styles.arrowIcon} />
              </div>
            </Link>

            {/* VENDER */}
            <div className={`glass-panel ${styles.optionCard}`} onClick={() => setShowSellForm(true)} style={{ cursor: 'pointer' }}>
              <div className={styles.optionGlow} style={{ background: 'radial-gradient(ellipse, rgba(212, 175, 55, 0.1) 0%, transparent 70%)' }}></div>
              <div className={`${styles.optionIcon} ${styles.optionIconSell}`}>
                <Tag size={36} />
              </div>
              <h2 className={styles.optionTitle}>Vender</h2>
              <p className={styles.optionDesc}>
                Publica tu propiedad con nosotros. Usamos marketing digital agresivo, valorización inteligente y nuestra red de compradores para garantizar la máxima rentabilidad.
              </p>
              <div className={styles.optionFeatures}>
                <div className={styles.optionFeature}><CheckCircle size={14} /> Publicación en portales premium</div>
                <div className={styles.optionFeature}><CheckCircle size={14} /> Marketing digital y redes</div>
                <div className={styles.optionFeature}><CheckCircle size={14} /> Sesión fotográfica profesional</div>
                <div className={styles.optionFeature}><CheckCircle size={14} /> Análisis de mercado comparativo</div>
              </div>
              <div className={styles.optionCta}>
                <span>Publicar mi Propiedad</span>
                <ArrowRight size={20} className={styles.arrowIcon} />
              </div>
            </div>
          </section>
        )}

        {/* Commission Info Banner */}
        {!showSellForm && (
          <section className={styles.commissionBanner}>
            <div className={`glass-panel ${styles.commissionCard}`}>
              <h3 className={styles.commissionTitle}>
                <Percent size={20} /> Comisiones Transparentes
              </h3>
              <p className={styles.commissionSubtitle}>
                Nuestras comisiones varían según el valor de la propiedad. Sin sorpresas, sin cargos ocultos.
              </p>
              <div className={styles.tiersGrid}>
                {COMMISSION_TIERS.map((tier, idx) => (
                  <div key={idx} className={styles.tierItem}>
                    <div className={styles.tierRate}>{tier.rate}%</div>
                    <div className={styles.tierLabel}>{tier.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Sell Form */}
        {showSellForm && !submitted && (
          <section className={styles.sellFormSection}>
            <div className={styles.formTopBar}>
              <button className={styles.backBtn} onClick={() => setShowSellForm(false)}>
                ← Volver a opciones
              </button>
            </div>
            
            <div className={`glass-panel ${styles.formCard}`}>
              <div className={styles.formHeader}>
                <h2>Publica tu Propiedad</h2>
                <p>Completa la información de tu inmueble. Nuestro equipo revisará la solicitud y te contactará para coordinar los siguientes pasos.</p>
              </div>

              <form className={styles.sellForm} onSubmit={handleSellSubmit}>
                {/* Owner Info */}
                <div className={styles.formSection}>
                  <h3 className={styles.formSectionTitle}><User size={18} /> Datos del Propietario</h3>
                  <div className={styles.formGrid3}>
                    <div className={styles.formGroup}>
                      <label>Nombre Completo *</label>
                      <input type="text" required placeholder="Tu nombre completo"
                        value={sellForm.ownerName}
                        onChange={(e) => setSellForm(p => ({ ...p, ownerName: e.target.value }))}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label><Mail size={14} /> Correo Electrónico *</label>
                      <input type="email" required placeholder="correo@ejemplo.com"
                        value={sellForm.email}
                        onChange={(e) => setSellForm(p => ({ ...p, email: e.target.value }))}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label><Phone size={14} /> Teléfono *</label>
                      <input type="tel" required placeholder="(656) 123-4567"
                        value={sellForm.phone}
                        onChange={(e) => setSellForm(p => ({ ...p, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Property Info */}
                <div className={styles.formSection}>
                  <h3 className={styles.formSectionTitle}><Home size={18} /> Datos de la Propiedad</h3>
                  <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                      <label><MapPin size={14} /> Dirección *</label>
                      <input type="text" required placeholder="Calle, número, fraccionamiento"
                        value={sellForm.propertyAddress}
                        onChange={(e) => setSellForm(p => ({ ...p, propertyAddress: e.target.value }))}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Ciudad *</label>
                      <input type="text" required placeholder="Cd. Juárez, Chih."
                        value={sellForm.city}
                        onChange={(e) => setSellForm(p => ({ ...p, city: e.target.value }))}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Colonia</label>
                      <input type="text" placeholder="Nombre de la colonia"
                        value={sellForm.colonia}
                        onChange={(e) => setSellForm(p => ({ ...p, colonia: e.target.value }))}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Tipo de Propiedad *</label>
                      <select required value={sellForm.propertyType}
                        onChange={(e) => setSellForm(p => ({ ...p, propertyType: e.target.value }))}>
                        <option value="">Seleccionar...</option>
                        <option value="casa">Casa</option>
                        <option value="departamento">Departamento</option>
                        <option value="terreno">Terreno</option>
                        <option value="local_comercial">Local Comercial</option>
                        <option value="oficina">Oficina</option>
                        <option value="bodega">Bodega / Nave Industrial</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.formGrid4}>
                    <div className={styles.formGroup}>
                      <label>Recámaras</label>
                      <input type="number" min="0" placeholder="3"
                        value={sellForm.bedrooms}
                        onChange={(e) => setSellForm(p => ({ ...p, bedrooms: e.target.value }))}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Baños</label>
                      <input type="number" min="0" step="0.5" placeholder="2.5"
                        value={sellForm.bathrooms}
                        onChange={(e) => setSellForm(p => ({ ...p, bathrooms: e.target.value }))}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>m² Construcción</label>
                      <input type="number" min="0" placeholder="180"
                        value={sellForm.sqMeters}
                        onChange={(e) => setSellForm(p => ({ ...p, sqMeters: e.target.value }))}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>m² Terreno</label>
                      <input type="number" min="0" placeholder="250"
                        value={sellForm.landSqMeters}
                        onChange={(e) => setSellForm(p => ({ ...p, landSqMeters: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className={styles.formSection}>
                  <h3 className={styles.formSectionTitle}><DollarSign size={18} /> Precio y Comisión</h3>
                  <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                      <label>Precio de Venta Deseado (MXN) *</label>
                      <input type="number" required min="500000" placeholder="2,500,000"
                        value={sellForm.askingPrice}
                        onChange={(e) => setSellForm(p => ({ ...p, askingPrice: e.target.value }))}
                      />
                    </div>
                    <div className={styles.commissionPreview}>
                      <div className={styles.commissionPreviewLabel}>Comisión OHB Estimada</div>
                      <div className={styles.commissionPreviewRate}>{commissionRate}%</div>
                      {askingPriceNum > 0 && (
                        <div className={styles.commissionPreviewAmount}>
                          ≈ ${commissionAmount.toLocaleString('es-MX', { minimumFractionDigits: 0 })} MXN
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className={styles.formSection}>
                  <h3 className={styles.formSectionTitle}><FileText size={18} /> Descripción Adicional</h3>
                  <div className={styles.formGroup}>
                    <textarea rows={4} placeholder="Describe las características especiales de tu propiedad: acabados, amenidades, cercanía a servicios, etc."
                      value={sellForm.description}
                      onChange={(e) => setSellForm(p => ({ ...p, description: e.target.value }))}
                    ></textarea>
                  </div>
                </div>

                {/* Commission Terms */}
                <div className={styles.termsSection}>
                  <div className={styles.termsHeader} onClick={() => setShowTerms(!showTerms)}>
                    <h3><Shield size={18} /> Términos y Condiciones de Comisión</h3>
                    <ChevronDown size={20} className={showTerms ? styles.rotated : ''} />
                  </div>
                  {showTerms && (
                    <div className={styles.termsContent}>
                      <div className={styles.termsCard}>
                        <h4>Esquema de Comisiones por Compra-Venta</h4>
                        <p>Al contratar los servicios de intermediación inmobiliaria de OHB, el propietario acepta las siguientes condiciones:</p>
                        <table className={styles.termsTable}>
                          <thead>
                            <tr>
                              <th>Valor de la Propiedad</th>
                              <th>Comisión (%)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>$1,000,000 — $1,999,999 MXN</td>
                              <td><strong style={{ color: '#4ade80' }}>7%</strong></td>
                            </tr>
                            <tr>
                              <td>$2,000,000 — $4,999,999 MXN</td>
                              <td><strong style={{ color: '#4ade80' }}>6%</strong></td>
                            </tr>
                            <tr>
                              <td>$5,000,000 MXN en adelante</td>
                              <td><strong style={{ color: '#4ade80' }}>5%</strong></td>
                            </tr>
                          </tbody>
                        </table>
                        <ul className={styles.termsList}>
                          <li>La comisión se calcula sobre el valor final de venta de la propiedad.</li>
                          <li>La comisión es más IVA (16%), lo cual se reflejará en la factura correspondiente.</li>
                          <li>El pago de la comisión se realiza al momento del cierre de la operación ante notario público.</li>
                          <li>OHB se compromete a brindar marketing digital completo, sesión fotográfica profesional, tours virtuales, publicación en portales inmobiliarios y acompañamiento legal durante todo el proceso.</li>
                          <li>El contrato de exclusividad tiene una vigencia mínima de 6 meses.</li>
                          <li>En caso de venta directa por parte del propietario durante la vigencia del contrato, aplica la comisión acordada.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  <label className={styles.acceptTerms}>
                    <input type="checkbox"
                      checked={sellForm.acceptsTerms}
                      onChange={(e) => setSellForm(p => ({ ...p, acceptsTerms: e.target.checked }))}
                    />
                    <span>He leído y acepto los <button type="button" className={styles.termsLink} onClick={(e) => { e.preventDefault(); setShowTerms(true); }}>términos y condiciones</button> de comisión de OHB Inmobiliaria.</span>
                  </label>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={!sellForm.acceptsTerms}>
                  <Send size={18} /> Enviar Solicitud de Venta
                </button>
              </form>
            </div>
          </section>
        )}

        {/* Success State */}
        {submitted && (
          <section className={styles.successSection}>
            <div className={`glass-panel ${styles.successCard}`}>
              <div className={styles.successIcon}>
                <CheckCircle size={72} />
              </div>
              <h2>¡Solicitud Enviada Exitosamente!</h2>
              <p>Hemos recibido la información de tu propiedad. Un asesor de OHB se pondrá en contacto contigo dentro de las próximas 24 horas hábiles para coordinar la visita de evaluación y la sesión fotográfica.</p>
              <div className={styles.successActions}>
                <button className={styles.successBtnPrimary} onClick={() => { setShowSellForm(false); setSubmitted(false); setSellForm({ ownerName: '', email: '', phone: '', propertyAddress: '', city: '', colonia: '', propertyType: '', bedrooms: '', bathrooms: '', sqMeters: '', landSqMeters: '', askingPrice: '', description: '', hasPhotos: false, acceptsTerms: false }); }}>
                  ← Volver a Compra-Venta
                </button>
                <Link href="/" className={styles.successBtnSecondary}>
                  Ir al Inicio
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
