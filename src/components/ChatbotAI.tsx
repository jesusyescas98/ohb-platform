"use client";

import { useState, useRef, useEffect } from 'react';
import styles from './Chatbot.module.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  quickReplies?: string[];
}

const quickSuggestions = [
  '¿Qué tipos de propiedades tienen?',
  '¿Cómo funciona Infonavit?',
  '¿Cuál es el ROI promedio?',
  '¿Cómo puedo contactar un asesor?',
];

export default function ChatbotAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "Hola. Soy AVA, tu asistente de Inteligencia Artificial de OHB. ¿En qué puedo ayudarte a invertir hoy?", 
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      quickReplies: quickSuggestions
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatHistory, setChatHistory] = useState<number>(0);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Sanitize user input
  const sanitizeInput = (text: string): string => {
    return text.replace(/[<>]/g, '').trim();
  };

  const getTimestamp = () => new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

  const processMessage = (rawInput: string) => {
    const sanitizedInput = sanitizeInput(rawInput);
    if (!sanitizedInput) return;
    
    const userMsg: Message = { 
      id: Date.now(), 
      text: sanitizedInput, 
      sender: 'user',
      timestamp: getTimestamp()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setChatHistory(prev => prev + 1);

    setTimeout(() => {
      const lowerInput = sanitizedInput.toLowerCase();
      let aiResponse = "He registrado tu consulta. Para brindarte una asesoría personalizada sobre este tema, te recomiendo agendar una sesión privada con uno de nuestros especialistas. ¿Te gustaría que te conecte?";
      let quickReplies: string[] = [];
      
      // Enhanced NLP Patterns
      if (lowerInput.includes('hipoteca') || lowerInput.includes('credito') || lowerInput.includes('préstamo') || lowerInput.includes('prestamo')) {
        aiResponse = "💰 Contamos con calculadoras inteligentes y alianzas bancarias. Puedo analizar tu perfil crediticio para encontrar tasas preferenciales. Usa nuestra calculadora en la sección de Herramientas para simular pagos mensuales.";
        quickReplies = ['¿Cómo uso la calculadora?', '¿Qué tasa es mejor?', 'Quiero hablar con un asesor'];
      } else if (lowerInput.includes('infonavit') || lowerInput.includes('cofinavit')) {
        aiResponse = "🏛️ Somos expertos en Infonavit. Te ayudamos a unir tu crédito con entidades bancarias (Cofinavit) y usar tu subcuenta de vivienda para maximizar tu capacidad de compra. Visita nuestra 'Academia OHB' para cursos detallados sobre el tema.";
        quickReplies = ['¿Qué es Cofinavit?', 'Ver cursos de Infonavit', 'Calcular mi crédito'];
      } else if (lowerInput.includes('rentabilidad') || lowerInput.includes('roi') || lowerInput.includes('inversion') || lowerInput.includes('inversión') || lowerInput.includes('invertir')) {
        aiResponse = "📈 El ROI promedio de nuestros proyectos premium (como Costa del Sol) es del 10% al 15% anual con esquemas de rentas cortas. Puedes ver todo el portafolio con proyecciones en nuestra sección de Inventario. También tenemos un Simulador de Inversión Fija en Herramientas.";
        quickReplies = ['Ver el portafolio', 'Usar simulador de inversión', '¿Cuál propiedad recomiendas?'];
      } else if (lowerInput.includes('contacto') || lowerInput.includes('telefono') || lowerInput.includes('teléfono') || lowerInput.includes('asesor') || lowerInput.includes('hablar')) {
        aiResponse = "📞 Puedes contactarnos vía WhatsApp al +52 656 123 4567, o visita nuestra sección de Nosotros para conocer a todo el equipo. Si prefieres, regístrate en la plataforma y un asesor premium se comunicará contigo.";
        quickReplies = ['Conocer al equipo', 'Registrarme', 'Agendar cita'];
      } else if (lowerInput.includes('precio') || lowerInput.includes('cuesta') || lowerInput.includes('cuánto') || lowerInput.includes('cuanto')) {
        aiResponse = "🏷️ Tenemos propiedades desde $850,000 USD (comerciales) hasta $4.8M USD (mansiones de lujo). Todo depende de tus objetivos: ¿es para vivir, rentar o invertir? Puedo mostrarte opciones según tu presupuesto.";
        quickReplies = ['Quiero comprar para vivir', 'Busco inversión', 'Ver propiedades comerciales'];
      } else if (lowerInput.includes('hola') || lowerInput.includes('buenas') || lowerInput.includes('hey') || lowerInput.includes('buenos')) {
        aiResponse = "👋 ¡Hola! Es un placer saludarte. ¿Estás buscando comprar, vender o aprender sobre inversiones inmobiliarias hoy?";
        quickReplies = ['Quiero comprar', 'Quiero vender', 'Quiero aprender'];
      } else if (lowerInput.includes('trabajo') || lowerInput.includes('comision') || lowerInput.includes('empleo') || lowerInput.includes('comisión')) {
        aiResponse = "🤝 Para ser Asesor OHB o manejar propiedades con nosotros, puedes registrarte en nuestro portal creando una cuenta tipo 'Asesor'. Ofrecemos excelentes comisiones, herramientas CRM con IA y capacitación continua.";
        quickReplies = ['¿Cómo me registro?', '¿Cuánto es la comisión?', 'Ver la academia'];
      } else if (lowerInput.includes('academia') || lowerInput.includes('curso') || lowerInput.includes('aprender') || lowerInput.includes('capacitación')) {
        aiResponse = "🎓 La Academia OHB tiene cursos gratuitos y premium sobre inversión inmobiliaria, Infonavit, cálculo de Cap Rate, y certificación de asesores. Puedes acceder desde el menú principal.";
        quickReplies = ['Ver cursos gratuitos', '¿Qué es Cap Rate?', 'Certificación de asesor'];
      } else if (lowerInput.includes('gracias') || lowerInput.includes('thanks') || lowerInput.includes('ok') || lowerInput.includes('perfecto')) {
        aiResponse = "🙏 ¡Con gusto! Si tienes alguna otra consulta, estoy aquí para ayudarte. Recuerda que puedes explorar todas las secciones del sitio para más información detallada.";
        quickReplies = [];
      } else if (lowerInput.includes('vender') || lowerInput.includes('venta')) {
        aiResponse = "🏡 ¿Quieres poner tu propiedad en venta con nosotros? Visita la sección 'Nosotros' y encontrarás un formulario para registrar tu propiedad. Le daremos un tratamiento premium con fotos profesionales y tour virtual.";
        quickReplies = ['¿Cuánto cobra OHB?', 'Registrar mi propiedad', '¿Cómo es el proceso?'];
      } else if (lowerInput.includes('seguro') || lowerInput.includes('seguridad') || lowerInput.includes('privacidad')) {
        aiResponse = "🔒 Tu seguridad es nuestra prioridad. Usamos encriptación de datos, tokens de sesión, protección contra XSS, y rate limiting en todas las operaciones. Consulta nuestro Aviso de Privacidad en el pie de página.";
        quickReplies = ['Ver aviso de privacidad', 'Más sobre seguridad'];
      }

      const aiMsg: Message = { 
        id: Date.now() + 1, 
        text: aiResponse, 
        sender: 'ai',
        timestamp: getTimestamp(),
        quickReplies
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      
      if (!isOpen || isMinimized) {
        setUnreadCount(prev => prev + 1);
      }
    }, 1200 + Math.random() * 800);
  };

  const handleSend = () => {
    processMessage(input);
  };

  const handleQuickReply = (reply: string) => {
    processMessage(reply);
  };

  const handleFeedback = (messageId: number, isPositive: boolean) => {
    setFeedbackGiven(prev => new Set(prev).add(messageId));
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      text: "Chat reiniciado. ¿En qué puedo ayudarte?",
      sender: 'ai',
      timestamp: getTimestamp(),
      quickReplies: quickSuggestions
    }]);
    setChatHistory(0);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  return (
    <div className={styles.chatbotContainer}>
      {!isOpen && (
        <button className={styles.triggerBtn} onClick={handleOpen}>
          <span className={styles.aiGlow}></span>
          AVA AI
          {unreadCount > 0 && (
            <span style={{ 
              position: 'absolute', top: '-5px', right: '-5px', 
              background: '#ef4444', color: '#fff', 
              width: '20px', height: '20px', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 'bold'
            }}>
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div className={`glass-panel ${styles.chatWindow}`} style={isMinimized ? { height: 'auto' } : {}}>
          <div className={styles.header}>
            <div>
              <h4 className="text-gradient-silver">AVA Asistente IA</h4>
              <p className={styles.status}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', marginRight: '4px' }} />
                En línea • {chatHistory} mensajes
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
              <button 
                onClick={clearChat} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', padding: '0.3rem' }}
                title="Reiniciar chat"
              >
                🔄
              </button>
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem', padding: '0.3rem' }}
                title={isMinimized ? "Expandir" : "Minimizar"}
              >
                {isMinimized ? '⬆' : '⬇'}
              </button>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>×</button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className={styles.messagesContainer}>
                {messages.map(msg => (
                  <div key={msg.id}>
                    <div className={`${styles.messageWrapper} ${styles[msg.sender]}`}>
                      <div className={styles.messageBubble}>
                        {msg.text}
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.3rem', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                    
                    {/* Feedback for AI messages */}
                    {msg.sender === 'ai' && msg.id !== 1 && !feedbackGiven.has(msg.id) && (
                      <div style={{ display: 'flex', gap: '0.3rem', paddingLeft: '0.5rem', marginTop: '-0.3rem', marginBottom: '0.3rem' }}>
                        <button onClick={() => handleFeedback(msg.id, true)} style={{ background: 'none', border: 'none', fontSize: '0.7rem', cursor: 'pointer', opacity: 0.5 }}>👍</button>
                        <button onClick={() => handleFeedback(msg.id, false)} style={{ background: 'none', border: 'none', fontSize: '0.7rem', cursor: 'pointer', opacity: 0.5 }}>👎</button>
                      </div>
                    )}
                    {msg.sender === 'ai' && feedbackGiven.has(msg.id) && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem', marginBottom: '0.3rem' }}>
                        ✓ Gracias por tu feedback
                      </div>
                    )}

                    {/* Quick Replies */}
                    {msg.sender === 'ai' && msg.quickReplies && msg.quickReplies.length > 0 && msg.id === messages[messages.length - 1].id && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', padding: '0 0.5rem', marginBottom: '0.5rem' }}>
                        {msg.quickReplies.map((reply, i) => (
                          <button 
                            key={i}
                            onClick={() => handleQuickReply(reply)}
                            style={{
                              padding: '0.3rem 0.6rem', borderRadius: '12px',
                              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                              color: 'var(--accent-silver)', fontSize: '0.7rem', cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className={`${styles.messageWrapper} ${styles.ai}`}>
                    <div className={styles.messageBubble}>
                      <div className={styles.typingIndicator}>
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className={styles.inputArea}>
                <input 
                  type="text" 
                  placeholder="Pregúntale a AVA..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  maxLength={500}
                  disabled={isTyping}
                />
                <button 
                  onClick={handleSend} 
                  className={styles.sendBtn}
                  disabled={!input.trim() || isTyping}
                  style={{ opacity: input.trim() && !isTyping ? 1 : 0.5 }}
                >
                  Enviar
                </button>
              </div>

              {/* Footer info */}
              <div style={{ 
                textAlign: 'center', padding: '0.3rem 0.5rem', 
                fontSize: '0.6rem', color: 'var(--text-secondary)',
                borderTop: '1px solid var(--glass-border)'
              }}>
                🔒 Conversación segura • Sin almacenamiento de datos personales
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
