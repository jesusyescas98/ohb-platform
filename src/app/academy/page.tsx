"use client";

import { useState } from 'react';
import Header from '@/components/Header';
import styles from './AcademyPage.module.css';
import { 
  Search, Clock, Star, BookOpen, 
  Heart, CheckCircle, PlayCircle, ChevronDown, 
  ChevronUp, User, Award, ArrowRight, Play, Check, Lock, MessageSquare,
  CreditCard, X, Shield, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const initialCourses = [
  { id: 1, title: 'Inversión Inmobiliaria desde Cero', level: 'Básico', episodes: 5, duration: '2h 30m', category: 'Bienes Raíces', isPremium: false, rating: 4.8, reviews: 120, instructor: 'Marlon', enrolled: true, progress: 60, completed: false, price: '' },
  { id: 2, title: 'Mastering Infonavit & Cofinavit', level: 'Intermedio', episodes: 8, duration: '4h 15m', category: 'Infonavit', isPremium: false, rating: 4.9, reviews: 340, instructor: 'Ana S.', enrolled: false, progress: 0, completed: false, price: '' },
  { id: 3, title: 'Cálculo de Cap Rate y ROI Avanzado', level: 'Avanzado', episodes: 4, duration: '1h 45m', category: 'Finanzas', isPremium: false, rating: 4.7, reviews: 85, instructor: 'Carlos M.', enrolled: true, progress: 100, completed: true, price: '' },
  { id: 4, title: 'Certificación Asesor Élite OHB', level: 'Experto', episodes: 12, duration: '10h 00m', category: 'Ventas', isPremium: true, price: '$500 MXN', rating: 5.0, reviews: 500, instructor: 'OHB Equipo', enrolled: false, progress: 0, completed: false },
  { id: 5, title: 'Estructuración de Fondos de Inversión', level: 'Avanzado', episodes: 6, duration: '3h 20m', category: 'Finanzas', isPremium: true, price: '$250 MXN', rating: 4.6, reviews: 45, instructor: 'Marlon', enrolled: false, progress: 0, completed: false },
];

const faqs = [
  { question: '¿Cómo accedo a los cursos premium?', answer: 'Puedes adquirir los cursos premium directamente desde la plataforma usando tu tarjeta de crédito o débito. El acceso es inmediato una vez procesado el pago.' },
  { question: '¿Dan certificado al terminar?', answer: 'Sí, todas nuestras rutas de aprendizaje otorgan un certificado digital con valor curricular avalado por OHB al finalizar el 100% de los módulos.' },
  { question: '¿Cuánto tiempo tengo para terminar un curso?', answer: 'El acceso a los cursos gratuitos y de pago es de por vida. Puedes avanzar a tu propio ritmo sin presiones.' },
  { question: '¿Qué métodos de pago aceptan?', answer: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express). Todos los pagos se procesan de forma segura con encriptación SSL.' },
];

interface PaymentForm {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  email: string;
}

export default function AcademyPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedLevel, setSelectedLevel] = useState('Todos');
  const [savedCourses, setSavedCourses] = useState<number[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Payment state
  const [paymentCourse, setPaymentCourse] = useState<typeof initialCourses[0] | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    email: '',
  });
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardType, setCardType] = useState<string>('');

  const categories = ['Todas', 'Bienes Raíces', 'Infonavit', 'Finanzas', 'Ventas'];
  const levels = ['Todos', 'Básico', 'Intermedio', 'Avanzado', 'Experto'];

  const toggleSave = (id: number) => {
    setSavedCourses(prev => prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]);
  };

  const filteredCourses = initialCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'Todos' || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const continueCourse = initialCourses.find(c => c.enrolled && c.progress > 0 && c.progress < 100);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').substring(0, 16);
    const parts = [];
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.join(' ');
  };

  // Format expiry date
  const formatExpiry = (value: string) => {
    const v = value.replace(/[^0-9]/g, '').substring(0, 4);
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2);
    }
    return v;
  };

  // Detect card type
  const detectCardType = (number: string) => {
    const clean = number.replace(/\s/g, '');
    if (/^4/.test(clean)) return 'visa';
    if (/^5[1-5]/.test(clean)) return 'mastercard';
    if (/^3[47]/.test(clean)) return 'amex';
    return '';
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setPaymentForm(prev => ({ ...prev, cardNumber: formatted }));
    setCardType(detectCardType(formatted));
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Store purchase
    const purchases = JSON.parse(localStorage.getItem('ohb_course_purchases') || '[]');
    purchases.push({
      courseId: paymentCourse?.id,
      courseTitle: paymentCourse?.title,
      price: paymentCourse?.price,
      email: paymentForm.email,
      cardLast4: paymentForm.cardNumber.replace(/\s/g, '').slice(-4),
      timestamp: new Date().toISOString(),
      status: 'completed'
    });
    localStorage.setItem('ohb_course_purchases', JSON.stringify(purchases));

    setPaymentProcessing(false);
    setPaymentSuccess(true);
  };

  const closePaymentModal = () => {
    setPaymentCourse(null);
    setPaymentProcessing(false);
    setPaymentSuccess(false);
    setPaymentForm({ cardName: '', cardNumber: '', expiry: '', cvv: '', email: '' });
    setCardType('');
  };

  const openPaymentModal = (course: typeof initialCourses[0]) => {
    setPaymentCourse(course);
    setPaymentSuccess(false);
    setPaymentProcessing(false);
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* 15. Hero Redesign Premium */}
        <div className={styles.heroSection}>
          <div className={styles.heroGlow}></div>
          <div className={styles.heroContent}>
            <div className={styles.aiBadge}><Award size={16} className={styles.pulseIcon} /> Currículum Desarrollado por IA</div>
            <h1 className={styles.title}>Academia <span className="text-gradient-silver">OHB</span></h1>
            <p className={styles.subtitle}>
              No es solo un blog. Es tu plataforma integral de aprendizaje para dominar el mercado inmobiliario, el apalancamiento financiero y las regulaciones del Infonavit, diseñada exclusivamente para la comunidad OHB.
            </p>
            <div className={styles.stats}>
              <div className={styles.stat}><strong>3+</strong> Rutas de Aprendizaje</div>
              <div className={styles.stat}><strong>100%</strong> Práctico</div>
              <div className={styles.stat}><strong>Acceso</strong> Gratuito con Registro</div>
            </div>
          </div>
        </div>

        {/* 9. Continuar Aprendiendo Section */}
        {continueCourse && (
          <section className={styles.continueSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Continuar Aprendiendo</h2>
            </div>
            <div className={`glass-panel ${styles.continueCard}`}>
              <div className={styles.continueInfo}>
                <span className={styles.categoryTagSmall}>{continueCourse.category}</span>
                <h3>{continueCourse.title}</h3>
                <div className={styles.progressWrapper}>
                  <div className={styles.progressHeader}>
                    <span>Progreso del curso</span>
                    <span>{continueCourse.progress}%</span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div className={styles.progressBarFill} style={{ width: `${continueCourse.progress}%` }}></div>
                  </div>
                </div>
              </div>
              <button className={styles.continueBtn}>
                <PlayCircle size={20} /> Continuar Clase
              </button>
            </div>
          </section>
        )}

        <div className={styles.layout}>
          <div className={styles.mainContent}>
            
            {/* 1, 2, 3. Filters and Search Bar */}
            <div className={styles.filtersContainer}>
              <div className={styles.searchBar}>
                <Search size={20} className={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Buscar rutas de aprendizaje..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              
              <div className={styles.filterGroup}>
                <div className={styles.selectWrapper}>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={styles.filterSelect}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <ChevronDown size={16} className={styles.selectIcon} />
                </div>
                
                <div className={styles.selectWrapper}>
                  <select 
                    value={selectedLevel} 
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className={styles.filterSelect}
                  >
                    {levels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                  </select>
                  <ChevronDown size={16} className={styles.selectIcon} />
                </div>
              </div>
            </div>

            <section className={styles.coursesSection}>
              <h2 className={styles.sectionTitle}>Descubrir Cursos</h2>
              <div className={styles.courseGrid}>
                {filteredCourses.length > 0 ? filteredCourses.map(course => (
                  <div key={course.id} className={`glass-panel ${styles.courseCard}`}>
                    <div className={styles.courseImage}>
                      {/* 10. Insignias de Estado */}
                      {course.completed ? (
                        <div className={styles.completedBadge}><Check size={14} /> Completado</div>
                      ) : course.enrolled ? (
                        <div className={styles.enrolledBadge}>En curso</div>
                      ) : null}
                      
                      {/* 8. Botón Guardar / Bookmark */}
                      <button 
                        className={`${styles.saveBtn} ${savedCourses.includes(course.id) ? styles.saved : ''}`}
                        onClick={() => toggleSave(course.id)}
                        aria-label="Guardar curso"
                      >
                        <Heart size={20} fill={savedCourses.includes(course.id) ? "currentColor" : "none"} />
                      </button>

                      <div className={styles.playBtn}><Play size={24} className={styles.playIcon} /></div>
                      <span className={styles.categoryTag}>{course.category}</span>
                    </div>
                    <div className={styles.courseInfo}>
                      <div className={styles.metaHeader}>
                        <span className={`${styles.level} ${styles[course.level.toLowerCase()]}`}>{course.level}</span>
                        {course.isPremium && <span className={styles.premiumTag}>Premium - {course.price}</span>}
                      </div>
                      <h3>{course.title}</h3>
                      
                      {/* 5, 6, 7. Stats: Rating, Duration, Instructor, Episodes con iconos */}
                      <div className={styles.courseStats}>
                        <div className={styles.statItem}><Star size={14} className={styles.starIcon} /> {course.rating} ({course.reviews})</div>
                        <div className={styles.statItem}><Clock size={14} /> {course.duration}</div>
                        <div className={styles.statItem}><BookOpen size={14} /> {course.episodes} Clases</div>
                        <div className={styles.statItem}><User size={14} /> {course.instructor}</div>
                      </div>

                      {/* 4. Barra de Progreso Miniatura */}
                      {course.enrolled && !course.completed && (
                        <div className={styles.miniProgress}>
                          <div className={styles.miniProgressFill} style={{ width: `${course.progress}%` }}></div>
                        </div>
                      )}

                      <div className={styles.cardActions}>
                        <button 
                          className={course.isPremium && !course.enrolled ? styles.buyBtn : styles.startBtn}
                          onClick={() => {
                            if (course.isPremium && !course.enrolled) {
                              openPaymentModal(course);
                            }
                          }}
                        >
                          {course.isPremium && !course.enrolled && <CreditCard size={16} />}
                          {course.completed ? 'Ver de nuevo' : course.enrolled ? 'Continuar' : course.isPremium ? ` Comprar Curso` : 'Comenzar Ruta'}
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className={styles.noResults}>
                    <BookOpen size={48} className={styles.noResultsIcon} />
                    <p>No se encontraron cursos con estos filtros.</p>
                    <button onClick={() => {setSearchTerm(''); setSelectedCategory('Todas'); setSelectedLevel('Todos');}} className={styles.secondaryBtn}>Limpiar Filtros</button>
                  </div>
                )}
              </div>
            </section>

            {/* 12. FAQ Section */}
            <section className={styles.faqSection}>
              <h2 className={styles.sectionTitle}>Preguntas Frecuentes</h2>
              <div className={styles.faqList}>
                {faqs.map((faq, index) => (
                  <div key={index} className={`glass-panel ${styles.faqItem}`}>
                    <button 
                      className={styles.faqQuestion} 
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    >
                      {faq.question}
                      {openFaq === index ? <ChevronUp size={20} className={styles.faqIconActive} /> : <ChevronDown size={20} className={styles.faqIcon} />}
                    </button>
                    <div className={`${styles.faqAnswer} ${openFaq === index ? styles.open : ''}`}>
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className={styles.sidebar}>
            {/* Payment Methods Info */}
            <div className={`glass-panel ${styles.toolCard} ${styles.paymentInfoCard}`}>
              <h3><CreditCard size={18} /> Métodos de Pago</h3>
              <p>Compra cursos premium de forma segura con tu tarjeta de crédito o débito.</p>
              <div className={styles.cardLogos}>
                <div className={styles.cardLogo}>
                  <div className={styles.visaLogo}>VISA</div>
                </div>
                <div className={styles.cardLogo}>
                  <div className={styles.mcLogo}>MC</div>
                </div>
                <div className={styles.cardLogo}>
                  <div className={styles.amexLogo}>AMEX</div>
                </div>
              </div>
              <div className={styles.securityBadge}>
                <Shield size={14} /> Pago Seguro SSL 256-bit
              </div>
            </div>

            {/* 14. Mentoria IA con link real moderno */}
            <div className={`glass-panel ${styles.toolCard} ${styles.aiCard}`}>
              <div className={styles.aiCardGlow}></div>
              <h3>🧠 Mentoría IA (AVA)</h3>
              <p>Envía tus dudas de los módulos y AVA te guiará creando un plan de estudio personalizado basado en tus propiedades de interés.</p>
              <Link href="/dashboard/ai-chat" className={styles.aiLinkBtn}>
                <MessageSquare size={18} /> Hablar con AVA <ArrowRight size={18} className={styles.arrowIcon} />
              </Link>
            </div>

            <div className={`glass-panel ${styles.toolCard}`}>
              <h3>Herramientas Prácticas</h3>
              <p>Úsalas para seguir las clases paso a paso resolviendo casos reales.</p>
              <ul className={styles.toolList}>
                <li><a href="/#calculadora"><CheckCircle size={14} className={styles.toolIcon}/> Simulador Hipotecario</a></li>
                <li><a href="#" className={styles.disabledTool}><Lock size={14} className={styles.toolIcon}/> Calculadora de ROI (Pronto)</a></li>
                <li><a href="#" className={styles.disabledTool}><Lock size={14} className={styles.toolIcon}/> Proyección Infonavit (Pronto)</a></li>
              </ul>
            </div>
          </aside>
        </div>

        {/* Payment Modal */}
        {paymentCourse && (
          <div className={styles.paymentOverlay} onClick={() => !paymentProcessing && closePaymentModal()}>
            <div className={styles.paymentModal} onClick={(e) => e.stopPropagation()}>
              {paymentSuccess ? (
                <div className={styles.paymentSuccess}>
                  <div className={styles.successCheckIcon}>
                    <CheckCircle size={72} />
                  </div>
                  <h2>¡Pago Exitoso!</h2>
                  <p>Has adquirido <strong>&ldquo;{paymentCourse.title}&rdquo;</strong> exitosamente. Ya puedes acceder al contenido completo del curso.</p>
                  <button className={styles.successCloseBtn} onClick={closePaymentModal}>
                    Comenzar Curso
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.paymentHeader}>
                    <h2><CreditCard size={22} /> Comprar Curso</h2>
                    <button className={styles.paymentClose} onClick={closePaymentModal}>
                      <X size={22} />
                    </button>
                  </div>

                  {/* Course Summary */}
                  <div className={styles.courseSummary}>
                    <div className={styles.summaryInfo}>
                      <span className={styles.summaryCategory}>{paymentCourse.category}</span>
                      <h3>{paymentCourse.title}</h3>
                      <div className={styles.summaryMeta}>
                        <span><Clock size={14} /> {paymentCourse.duration}</span>
                        <span><BookOpen size={14} /> {paymentCourse.episodes} clases</span>
                        <span><Star size={14} className={styles.starIcon} /> {paymentCourse.rating}</span>
                      </div>
                    </div>
                    <div className={styles.summaryPrice}>
                      {paymentCourse.price}
                    </div>
                  </div>

                  {/* Payment Form */}
                  <form className={styles.paymentForm} onSubmit={handlePaymentSubmit}>
                    <div className={styles.paymentFormGroup}>
                      <label>Correo Electrónico</label>
                      <input
                        type="email"
                        required
                        placeholder="tu@correo.com"
                        value={paymentForm.email}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>

                    <div className={styles.paymentFormGroup}>
                      <label>Nombre en la Tarjeta</label>
                      <input
                        type="text"
                        required
                        placeholder="Como aparece en tu tarjeta"
                        value={paymentForm.cardName}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, cardName: e.target.value }))}
                      />
                    </div>

                    <div className={styles.paymentFormGroup}>
                      <label>Número de Tarjeta</label>
                      <div className={styles.cardInputWrapper}>
                        <input
                          type="text"
                          required
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          value={paymentForm.cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          className={styles.cardInput}
                        />
                        {cardType && (
                          <span className={`${styles.cardTypeIcon} ${styles[cardType]}`}>
                            {cardType === 'visa' ? 'VISA' : cardType === 'mastercard' ? 'MC' : 'AMEX'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.paymentFormRow}>
                      <div className={styles.paymentFormGroup}>
                        <label>Vencimiento</label>
                        <input
                          type="text"
                          required
                          placeholder="MM/AA"
                          maxLength={5}
                          value={paymentForm.expiry}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                        />
                      </div>
                      <div className={styles.paymentFormGroup}>
                        <label>CVV</label>
                        <input
                          type="password"
                          required
                          placeholder="•••"
                          maxLength={4}
                          value={paymentForm.cvv}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, cvv: e.target.value.replace(/[^0-9]/g, '') }))}
                        />
                      </div>
                    </div>

                    <div className={styles.securityNote}>
                      <Shield size={16} />
                      <span>Tu información de pago está protegida con encriptación SSL de 256 bits. No almacenamos datos de tarjetas.</span>
                    </div>

                    <button type="submit" className={styles.payBtn} disabled={paymentProcessing}>
                      {paymentProcessing ? (
                        <span className={styles.processingSpinner}>
                          <span className={styles.spinner}></span> Procesando pago...
                        </span>
                      ) : (
                        <>
                          <CreditCard size={18} /> Pagar {paymentCourse.price}
                        </>
                      )}
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
