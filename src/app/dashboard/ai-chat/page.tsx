"use client";

import { useState, useRef } from 'react';
import Link from 'next/link';
import styles from '../Dashboard.module.css';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  link?: { text: string; url: string };
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  status: 'Procesando' | 'Listo';
}

export default function AVACopilotPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'docs' | 'train'>('chat');

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      sender: 'ai', 
      text: '¡Hola! Soy AVA (Agente Virtual Avanzado) de OHB. Estoy conectada a tu base de datos y lista para ayudarte a analizar propiedades, leer documentos y redactar estrategias. ¿En qué puedo apoyarte hoy?', 
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Docs State
  const [files, setFiles] = useState<UploadedFile[]>([
    { id: 'f1', name: 'Reglamento-Condominio-Mansion.pdf', type: 'PDF', status: 'Listo' },
    { id: 'f2', name: 'Proyecciones_Inversion_Q1.xlsx', type: 'Excel', status: 'Listo' }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Train State
  const [systemPrompt, setSystemPrompt] = useState('Eres AVA, la Inteligencia Artificial líder para los asesores inmobiliarios y administradores de OHB. Tu principal función es:\n1. Proveer cálculos precisos sobre hipotecas y Cap Rate.\n2. Leer y resumir grandes documentos (PDFs y Excels) de forma ejecutiva.\n3. Redactar anuncios comerciales usando un tono persuasivo, premium y profesional.');
  const [isSaved, setIsSaved] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue.trim(),
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      let responseText = "Procesando...";
      let detectedLink: { text: string, url: string } | undefined = undefined;
      const lowerInput = userMsg.text.toLowerCase();
      
      if (lowerInput.includes('documento') || lowerInput.includes('pdf')) {
        responseText = "Revisando el documento 'Reglamento-Condominio-Mansion.pdf'... Según la sección 4, no se permiten modificaciones a la fachada exterior sin votación unánime. ¿Necesitas que te resuma los puntos de cuotas de mantenimiento?";
      } else if (lowerInput.includes('excel') || lowerInput.includes('proyeccion')) {
        responseText = "Analizando 'Proyecciones_Inversion_Q1.xlsx'... Veo un pico de rentabilidad en el mes 3 gracias a la alta ocupación comercial. El promedio del trimestre arroja un TIR de 12.5%.";
      } else if (lowerInput.includes('vender') || lowerInput.includes('estrategia')) {
        responseText = "Para vender esa propiedad más rápido, sugiero resaltar su rentabilidad y publicarla enfocada a inversores. ¿Te genero una descripción para redes sociales basándome en los tokens configurados?";
      } else if (lowerInput.includes('prospecto') || lowerInput.includes('lead') || lowerInput.includes('contacto')) {
        responseText = "Detecté métricas activas en nuestra base. Te recomiendo monitorearlo de cerca para ganar la venta. Te preparé un embudo en el Pipeline de Leads para darle seguimiento inmediato.";
        detectedLink = { text: "Ir al Pipeline de Leads →", url: "/dashboard/leads" };
      } else if (lowerInput.includes('propiedad') || lowerInput.includes('inventario') || lowerInput.includes('catalogo')) {
        responseText = "Excelente, he cargado las estadísticas del catálogo actual. Contamos con propiedades 'En Renta' y 'Disponibles'. Te sugiero visitar la Gestión de Propiedades para actualizar precios.";
        detectedLink = { text: "Gestionar Propiedades →", url: "/dashboard/properties" };
      } else if (lowerInput.includes('llave') || lowerInput.includes('prestamo')) {
        responseText = "He revisado el sistema. Te sugiero ir al panel de control para que notifiques devoluciones o registres un nuevo movimiento.";
        detectedLink = { text: "Ver Control de Llaves →", url: "/dashboard/keys" };
      } else {
        responseText = "Recibido. Según mis parámetros actuales de entrenamiento, registraré esa consulta en el log o puedo ofrecerte un análisis estructurado. O puedes verificar en nuestras analíticas.";
        detectedLink = { text: "Volver a Inicio/Analítica →", url: "/dashboard" };
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        link: detectedLink,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFile = e.target.files[0];
      const type = newFile.name.endsWith('.pdf') ? 'PDF' : newFile.name.includes('.xls') ? 'Excel' : 'Documento';
      
      const fileRecord: UploadedFile = {
        id: Date.now().toString(),
        name: newFile.name,
        type: type,
        status: 'Procesando'
      };
      
      setFiles(prev => [fileRecord, ...prev]);
      
      // Simulating processing
      setTimeout(() => {
        setFiles(prev => prev.map(f => f.id === fileRecord.id ? { ...f, status: 'Listo' } : f));
      }, 3000);
    }
  };

  const handleSavePrompt = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className={styles.container} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header className={styles.header} style={{ marginBottom: '1.5rem' }}>
        <div className={styles.welcomeInfo}>
          <h1>Asistente <span className="text-gradient-silver">AVA</span></h1>
          <p className={styles.subtitle}>IA para asesores. Comprende documentos, redacción y estrategias de negocio.</p>
        </div>
      </header>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('chat')} 
          style={{ background: activeTab === 'chat' ? 'var(--accent-silver)' : 'transparent', color: activeTab === 'chat' ? '#0B0F19' : 'var(--text-secondary)', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}
        >
          Chat IA
        </button>
        <button 
          onClick={() => setActiveTab('docs')} 
          style={{ background: activeTab === 'docs' ? 'var(--accent-silver)' : 'transparent', color: activeTab === 'docs' ? '#0B0F19' : 'var(--text-secondary)', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}
        >
          Carga de Documentos
        </button>
        <button 
          onClick={() => setActiveTab('train')} 
          style={{ background: activeTab === 'train' ? 'var(--accent-silver)' : 'transparent', color: activeTab === 'train' ? '#0B0F19' : 'var(--text-secondary)', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}
        >
          Entrenamiento (Prompt)
        </button>
      </div>

      <div className={`glass-panel`} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1rem', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)' }}>
        
        {/* TABS CONTENT */}

        {/* --- CHAT TAB --- */}
        {activeTab === 'chat' && (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{
                  display: 'flex',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  maxWidth: '85%',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: msg.sender === 'ai' ? 'linear-gradient(135deg, var(--accent-silver) 0%, rgba(255,255,255,0.4) 100%)' : 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    color: msg.sender === 'ai' ? '#0B0F19' : 'var(--text-primary)', fontWeight: 'bold',
                    boxShadow: msg.sender === 'ai' ? '0 0 15px rgba(192, 192, 192, 0.4)' : 'none'
                  }}>
                    {msg.sender === 'ai' ? 'AVA' : 'Tú'}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      background: msg.sender === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(11, 15, 25, 0.6)',
                      border: msg.sender === 'user' ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--accent-silver)',
                      padding: '1rem', borderRadius: msg.sender === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                      color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.5'
                    }}>
                      {msg.text}
                      {msg.link && (
                        <div style={{ marginTop: '0.8rem' }}>
                          <Link href={msg.link.url} style={{ display: 'inline-block', background: 'var(--accent-silver)', color: '#000', padding: '0.4rem 1rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.85rem', transition: 'transform 0.2s' }}>
                            {msg.link.text}
                          </Link>
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{msg.timestamp}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', alignSelf: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-silver) 0%, rgba(255,255,255,0.4) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B0F19', fontWeight: 'bold' }}>AVA</div>
                  <div style={{ background: 'rgba(11, 15, 25, 0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1.2rem', borderRadius: '4px 16px 16px 16px', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                    Procesando inteligencia...
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem' }}>
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Pregunta o pide instrucciones basándote en un archivo cargado..." 
                  style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '1rem', outline: 'none' }}
                />
                <button 
                  type="submit" 
                  disabled={!inputValue.trim() || isTyping}
                  style={{ padding: '0 2rem', background: 'var(--accent-silver)', color: '#0B0F19', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: inputValue.trim() && !isTyping ? 'pointer' : 'not-allowed', opacity: inputValue.trim() && !isTyping ? 1 : 0.5, transition: 'all 0.3s' }}
                >
                  Enviar
                </button>
              </form>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Filtros de modelo:</span>
                <button onClick={() => setInputValue("Genera una imagen ultra-realista de la fachada en color gris para el cliente")} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--accent-silver)', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer' }}>🎨 Modelo de Imagen (Gemini)</button>
                <button onClick={() => setInputValue("Resume el archivo Reglamento-Condominio-Mansion.pdf")} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--accent-silver)', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer' }}>📄 Analizar PDF</button>
                <button onClick={() => setInputValue("Calcula la proyección del archivo excel cargado")} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--accent-silver)', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer' }}>📊 Analizar Excel</button>
              </div>
            </div>
          </>
        )}

        {/* --- DOCS TAB --- */}
        {activeTab === 'docs' && (
          <div style={{ padding: '1rem', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Alimentar Base de Conocimiento (PDF/Excel)</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Carga archivos para que la IA "AVA" pueda leer su contenido, comprender los reportes de ventas, leer reglamentos o sacar métricas de Excels. Esto optimizará el soporte para tu equipo.</p>
            
            <div 
              style={{ border: '2px dashed var(--accent-silver)', padding: '3rem', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', marginBottom: '2rem' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📄</span>
              <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Haz clic para cargar documentos</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Soporta .pdf, .xls, .xlsx (Máx 20MB)</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload}
                accept=".pdf, .xls, .xlsx" 
                style={{ display: 'none' }} 
              />
            </div>

            <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Archivos Compartidos con la Red de AVA</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {files.map(file => (
                <div key={file.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{file.type === 'PDF' ? '📕' : '📗'}</span>
                    <div>
                      <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{file.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Formato: {file.type}</div>
                    </div>
                  </div>
                  <span style={{ 
                    padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
                    background: file.status === 'Listo' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(241, 196, 15, 0.2)',
                    color: file.status === 'Listo' ? '#4ade80' : '#f1c40f'
                  }}>
                    {file.status === 'Listo' ? 'Comprendido por IA' : 'Lectura en proceso...'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TRAIN TAB --- */}
        {activeTab === 'train' && (
          <div style={{ padding: '1rem', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Entrenamiento y Parámetros (System Prompt)</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Define el comportamiento central, tono y reglas éticas de <strong>AVA</strong>. Puedes enlazar este output como metadato a modelos fundacionales (como Gemini GEM) o guardarlo de manera local para su operación de asistencia a asesores.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 'bold', color: 'var(--accent-silver)' }}>Prompt Mestro de Sistema (Instrucciones Generales)</label>
                <textarea 
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={8}
                  style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '0.95rem', resize: 'vertical', lineHeight: '1.6' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Temperatura (Creatividad)</label>
                  <input type="range" min="0" max="1" step="0.1" defaultValue="0.7" style={{ width: '100%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    <span>Más Analítica</span>
                    <span>Más Creativa</span>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    Habilitar Generación de Imágenes (DALL-E / Gemini)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    Habilitar Lectura Continua de Documentos
                  </label>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button 
                  onClick={handleSavePrompt}
                  style={{ padding: '0.8rem 2rem', background: isSaved ? '#4ade80' : 'var(--accent-silver)', color: '#0B0F19', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}
                >
                  {isSaved ? '¡Entrenamiento Guardado!' : 'Guardar y Entrenar AVA'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
