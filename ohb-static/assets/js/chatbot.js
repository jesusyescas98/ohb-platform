/* ===================================
   OHB CHATBOT - AI Chatbot Widget (AVA)
   Pattern matching responses
   =================================== */

const CHATBOT_RESPONSES = {
  hipoteca: {
    keywords: ['hipoteca', 'mortgage', 'crédito', 'financiamiento', 'tasa'],
    response: '💰 Excelente pregunta sobre hipotecas. Ofrecemos asesoría personalizada para obtener las mejores tasas. ¿Cuál es el monto aproximado que necesitas?',
  },
  precio: {
    keywords: ['precio', 'costo', 'cuánto cuesta', 'valor', 'presupuesto'],
    response: '🏷️ Tenemos propiedades en diferentes rangos de precio. Desde $800k hasta $2.5M+. ¿Qué tipo de propiedad te interesa?',
  },
  asesor: {
    keywords: ['asesor', 'consultor', 'ayuda', 'hablar con', 'necesito asesoría'],
    response: '👨‍💼 Claro, nuestro equipo de asesores está disponible. Puedo conectarte con Juan Yeskas directamente por WhatsApp. ¿Prefieres que te envíe su contacto?',
  },
  inversión: {
    keywords: ['inversión', 'invertir', 'roi', 'rendimiento', 'ganancia'],
    response: '📈 La inversión inmobiliaria es excelente. Nuestro análisis de mercado muestra ROI promedio del 12-15% anual. ¿Quieres conocer propiedades con potencial de inversión?',
  },
  ubicación: {
    keywords: ['ubicación', 'dónde', 'localización', 'zona', 'área'],
    response: '📍 Contamos con propiedades en las mejores zonas de Juárez: Lomas Altas, Centro, Buscari, Futurama y más. ¿Hay alguna zona específica que prefieras?',
  },
  documentación: {
    keywords: ['documentación', 'escritura', 'trámite', 'papeles', 'requisito'],
    response: '📋 Nos encargamos de toda la documentación y trámites legales. Nuestro equipo es experto en procesos inmobiliarios mexicanos. ¿Necesitas asesoría legal?',
  },
  departamento: {
    keywords: ['departamento', 'apt', 'apartamento', 'depa'],
    response: '🏢 Tenemos departamentos disponibles desde $950k en zonas premium. ¿Quieres ver opciones?',
  },
  casa: {
    keywords: ['casa', 'vivienda', 'hogar', 'residencia'],
    response: '🏠 Contamos con hermosas casas de 3-4 recámaras. Desde $1.1M hasta $2.5M. ¿Cuántos dormitorios necesitas?',
  },
  comercial: {
    keywords: ['comercial', 'local', 'oficina', 'negocio'],
    response: '🏬 Tenemos locales y oficinas comerciales en ubicaciones estratégicas. Ideales para negocios o inversión. ¿Te interesa?',
  },
  contacto: {
    keywords: ['contacto', 'contactar', 'llamar', 'agendar', 'cita'],
    response: '📞 ¡Perfecto! Puedes contactarnos por:\n📱 WhatsApp: +526561327685\n📧 Email: jyeskas1111@gmail.com\n📞 Teléfono: 656-132-7685',
  },
  academy: {
    keywords: ['curso', 'academia', 'aprender', 'educación', 'capacitación'],
    response: '🎓 Contamos con cursos de inversión inmobiliaria, negociación avanzada y análisis de mercado. ¿Te interesa alguno?',
  },
  vender: {
    keywords: ['vender', 'venta', 'vendo', 'debo vender'],
    response: '💼 Si necesitas vender tu propiedad, nos encargamos de todo: tasación, marketing y negociación. ¿Cuándo te gustaría vender?',
  },
};

const FALLBACK_RESPONSE = 'No estoy completamente seguro de tu pregunta. ¿Podrías reformularla? O puedo conectarte directamente con nuestro equipo. 😊';

/**
 * Initialize chatbot widget
 */
function initChatbot() {
  // Create chatbot HTML
  const chatbotHTML = `
    <button class="chatbot-button" id="chatbot-toggle" title="Chat con AVA">
      💬
    </button>
    
    <div class="chatbot-window" id="chatbot-window">
      <div class="chatbot-header">
        <div>
          <h3>AVA</h3>
          <p>Asistente Virtual OHB</p>
        </div>
      </div>
      
      <div class="chatbot-messages" id="chatbot-messages">
        <div class="chatbot-message message-bot">
          ¡Hola! Soy AVA, tu asistente virtual de OHB. ¿Cómo puedo ayudarte hoy? 😊
        </div>
      </div>
      
      <div class="chatbot-input">
        <input 
          type="text" 
          id="chatbot-input" 
          placeholder="Escribe tu pregunta..."
          autocomplete="off"
        >
        <button id="chatbot-send">Enviar</button>
      </div>
    </div>
  `;
  
  // Add chatbot to page
  document.body.insertAdjacentHTML('beforeend', chatbotHTML);
  
  // Setup event listeners
  const toggleBtn = document.getElementById('chatbot-toggle');
  const sendBtn = document.getElementById('chatbot-send');
  const input = document.getElementById('chatbot-input');
  const window = document.getElementById('chatbot-window');
  
  // Toggle chatbot window
  toggleBtn.addEventListener('click', () => {
    window.classList.toggle('active');
    toggleBtn.classList.toggle('active');
    
    if (window.classList.contains('active')) {
      input.focus();
    }
  });
  
  // Send message on button click
  sendBtn.addEventListener('click', sendChatbotMessage);
  
  // Send message on Enter key
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendChatbotMessage();
    }
  });
}

/**
 * Send message and get response
 */
function sendChatbotMessage() {
  const input = document.getElementById('chatbot-input');
  const messages = document.getElementById('chatbot-messages');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Add user message
  const userMsg = document.createElement('div');
  userMsg.className = 'chatbot-message message-user';
  userMsg.textContent = message;
  messages.appendChild(userMsg);
  
  // Clear input
  input.value = '';
  input.focus();
  
  // Scroll to bottom
  messages.scrollTop = messages.scrollHeight;
  
  // Get response
  setTimeout(() => {
    const response = generateChatbotResponse(message);
    
    const botMsg = document.createElement('div');
    botMsg.className = 'chatbot-message message-bot';
    botMsg.innerHTML = response;
    messages.appendChild(botMsg);
    
    // Scroll to bottom
    messages.scrollTop = messages.scrollHeight;
  }, 500);
}

/**
 * Generate chatbot response based on keywords
 * @param {string} message - User message
 * @returns {string} Chatbot response
 */
function generateChatbotResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Check for matching keywords
  for (const [key, data] of Object.entries(CHATBOT_RESPONSES)) {
    for (const keyword of data.keywords) {
      if (lowerMessage.includes(keyword)) {
        return data.response;
      }
    }
  }
  
  // Fallback response
  return FALLBACK_RESPONSE;
}

/**
 * Add quick reply buttons
 */
function addQuickReplies() {
  const messagesDiv = document.getElementById('chatbot-messages');
  
  const quickReplies = `
    <div style="display: flex; flex-direction: column; gap: 0.5rem; margin: 1rem 0;">
      <p style="font-size: 0.75rem; color: var(--color-text-muted);">Preguntas rápidas:</p>
      <button class="quick-reply" onclick="setQuickReply('¿Cuáles son las propiedades disponibles?')" style="text-align: left; padding: 0.5rem; background: var(--color-surface-light); border: 1px solid var(--color-surface-light); border-radius: var(--radius-md); cursor: pointer; color: var(--color-text-secondary);">
        📌 Ver propiedades disponibles
      </button>
      <button class="quick-reply" onclick="setQuickReply('Quiero asesoría para invertir')" style="text-align: left; padding: 0.5rem; background: var(--color-surface-light); border: 1px solid var(--color-surface-light); border-radius: var(--radius-md); cursor: pointer; color: var(--color-text-secondary);">
        📈 Asesoría de inversión
      </button>
      <button class="quick-reply" onclick="setQuickReply('Necesito hablar con un asesor')" style="text-align: left; padding: 0.5rem; background: var(--color-surface-light); border: 1px solid var(--color-surface-light); border-radius: var(--radius-md); cursor: pointer; color: var(--color-text-secondary);">
        👨‍💼 Hablar con asesor
      </button>
    </div>
  `;
  
  messagesDiv.insertAdjacentHTML('beforeend', quickReplies);
}

/**
 * Set quick reply text
 * @param {string} text - Text to set
 */
function setQuickReply(text) {
  const input = document.getElementById('chatbot-input');
  input.value = text;
  input.focus();
}

/**
 * Close chatbot
 */
function closeChatbot() {
  const window = document.getElementById('chatbot-window');
  const toggle = document.getElementById('chatbot-toggle');
  
  if (window) window.classList.remove('active');
  if (toggle) toggle.classList.remove('active');
}

/**
 * Clear chat history
 */
function clearChatHistory() {
  const messages = document.getElementById('chatbot-messages');
  if (messages) {
    messages.innerHTML = '<div class="chatbot-message message-bot">¡Hola de nuevo! ¿En qué puedo ayudarte? 😊</div>';
  }
}

/**
 * Minimally styled chatbot (no external CSS needed)
 */
function initMinimalChatbot() {
  const styles = `
    <style>
      .chatbot-button {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--color-secondary-light) 0%, var(--color-secondary) 100%);
        color: var(--color-primary-dark);
        border: none;
        cursor: pointer;
        box-shadow: var(--shadow-lg);
        font-size: var(--font-size-2xl);
        z-index: var(--z-fixed);
        transition: all var(--transition-fast);
      }
      
      .chatbot-button:hover {
        transform: scale(1.1);
      }
      
      .chatbot-button.active {
        background: var(--color-error);
      }
      
      .chatbot-window {
        position: fixed;
        bottom: 100px;
        right: 30px;
        width: 380px;
        height: 500px;
        background: var(--color-surface);
        border-radius: var(--radius-2xl);
        box-shadow: var(--shadow-2xl);
        display: none;
        flex-direction: column;
        z-index: var(--z-fixed);
        border: 1px solid var(--color-surface-light);
      }
      
      .chatbot-window.active {
        display: flex;
      }
      
      .chatbot-header {
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
        padding: var(--spacing-lg);
        border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
      }
      
      .chatbot-header h3,
      .chatbot-header p {
        margin: 0;
        color: var(--color-text-primary);
      }
      
      .chatbot-header p {
        font-size: var(--font-size-sm);
        opacity: 0.9;
      }
      
      .chatbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: var(--spacing-lg);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
      }
      
      .chatbot-message {
        padding: var(--spacing-md);
        border-radius: var(--radius-lg);
        font-size: var(--font-size-sm);
        max-width: 80%;
      }
      
      .message-user {
        background: var(--color-secondary-light);
        color: var(--color-primary-dark);
        align-self: flex-end;
      }
      
      .message-bot {
        background: var(--color-surface-light);
        color: var(--color-text-primary);
        align-self: flex-start;
      }
      
      .chatbot-input {
        display: flex;
        gap: var(--spacing-md);
        padding: var(--spacing-lg);
        border-top: 1px solid var(--color-surface-light);
      }
      
      .chatbot-input input {
        flex: 1;
        background: var(--color-bg-dark);
        border: 1px solid var(--color-surface-light);
        padding: var(--spacing-md);
        border-radius: var(--radius-md);
        color: var(--color-text-primary);
      }
      
      .chatbot-input button {
        background: var(--color-secondary-light);
        color: var(--color-primary-dark);
        border: none;
        padding: var(--spacing-md) var(--spacing-lg);
        border-radius: var(--radius-md);
        cursor: pointer;
        font-weight: 600;
      }
      
      @media (max-width: 768px) {
        .chatbot-window {
          width: 95%;
          right: 2.5%;
          height: 60vh;
        }
      }
    </style>
  `;
  
  document.head.insertAdjacentHTML('beforeend', styles);
  initChatbot();
  addQuickReplies();
}

// Initialize chatbot on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMinimalChatbot);
} else {
  initMinimalChatbot();
}

// Export functions
window.OHB_CHATBOT = {
  initChatbot,
  sendChatbotMessage,
  generateChatbotResponse,
  closeChatbot,
  clearChatHistory,
  setQuickReply,
};
