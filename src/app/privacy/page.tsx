import Header from "../../components/Header";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso de Privacidad",
  description:
    "Aviso de Privacidad integral de OHB Asesorías y Consultorías conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP). Conoce cómo protegemos tus datos.",
  keywords: [
    "aviso de privacidad OHB",
    "protección datos personales",
    "LFPDPPP",
    "privacidad inmobiliaria",
    "derechos ARCO",
  ],
  openGraph: {
    title: "Aviso de Privacidad | OHB Asesorías y Consultorías",
    description: "Aviso de Privacidad conforme a la LFPDPPP. Transparencia y protección de tus datos personales.",
    url: "https://www.ohbasesores.com/privacy",
    type: "website",
    locale: "es_MX",
  },
  twitter: {
    card: "summary",
    title: "Aviso de Privacidad | OHB",
    description: "Conoce cómo OHB protege tus datos personales.",
  },
  alternates: {
    canonical: "https://www.ohbasesores.com/privacy",
  },
};

export default function PrivacyPage() {
  const lastUpdated = "9 de marzo de 2026";

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Header />
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '120px 2rem 4rem' }}>
        {/* Back link */}
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          color: 'var(--accent-silver)', fontSize: '0.9rem', marginBottom: '2rem',
          textDecoration: 'none'
        }}>
          ← Volver al Inicio
        </Link>

        {/* Header */}
        <div style={{
          padding: '2rem', borderRadius: '16px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 1rem', borderRadius: '20px', marginBottom: '1rem',
            background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)',
            fontSize: '0.8rem', color: '#4ade80'
          }}>
            🔒 Documento Legal Vigente
          </div>
          <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '2.2rem', marginBottom: '0.5rem' }}>
            Aviso de <span className="text-gradient-silver">Privacidad</span> Integral
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Última actualización: {lastUpdated}
          </p>
        </div>

        {/* Content Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Identidad del Responsable */}
          <Section title="1. Identidad del Responsable" icon="🏢">
            <p>
              <strong>OHB Asesorías y Consultorías</strong> (en adelante &quot;OHB&quot;), con domicilio en
              Tomás Fernández #7818, local 19, Col. Buscari, C.P. 32460, Ciudad Juárez, Chihuahua, México,
              es responsable del tratamiento de sus datos personales conforme a la Ley Federal de Protección
              de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              Correo de contacto para asuntos de privacidad:{' '}
              <strong style={{ color: 'var(--accent-silver)' }}>privacidad@ohb.com</strong>
            </p>
          </Section>

          {/* Datos que recopilamos */}
          <Section title="2. Datos Personales que Recopilamos" icon="📋">
            <p>OHB podrá recabar los siguientes datos personales:</p>
            <ul>
              <li><strong>Datos de identificación:</strong> Nombre completo, correo electrónico, número telefónico.</li>
              <li><strong>Datos de cuenta:</strong> Contraseña (almacenada en formato hash), rol de usuario, historial de sesiones.</li>
              <li><strong>Datos de navegación:</strong> Dirección IP, tipo de navegador, páginas visitadas, tiempo de sesión (recopilados de forma anonimizada).</li>
              <li><strong>Datos financieros:</strong> Solo cuando usted voluntariamente utiliza herramientas como calculadoras de hipoteca o inversión. Estos datos NO son almacenados en nuestros servidores.</li>
            </ul>
            <InfoBox type="important">
              OHB NO recopila datos personales sensibles como estado de salud, origen étnico, creencias religiosas, 
              preferencias sexuales ni datos biométricos.
            </InfoBox>
          </Section>

          {/* Finalidades */}
          <Section title="3. Finalidades del Tratamiento" icon="🎯">
            <p><strong>Finalidades primarias (necesarias):</strong></p>
            <ul>
              <li>Crear y gestionar su cuenta de usuario.</li>
              <li>Proveer servicios de asesoría inmobiliaria y financiera.</li>
              <li>Procesar y dar seguimiento a sus solicitudes de información.</li>
              <li>Garantizar la seguridad de la plataforma y prevenir fraudes.</li>
              <li>Cumplir con obligaciones legales y regulatorias.</li>
            </ul>
            <p style={{ marginTop: '1rem' }}><strong>Finalidades secundarias (opcionales):</strong></p>
            <ul>
              <li>Envío de boletines informativos y comunicaciones de marketing.</li>
              <li>Realización de estudios de mercado y estadísticas internas.</li>
              <li>Personalización de contenido y recomendaciones de propiedades.</li>
              <li>Invitaciones a eventos, webinars y cursos de la Academia OHB.</li>
            </ul>
            <p style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Si usted no desea que sus datos personales sean tratados para finalidades secundarias,
              puede enviar su solicitud a <strong>privacidad@ohb.com</strong>.
            </p>
          </Section>

          {/* Seguridad */}
          <Section title="4. Medidas de Seguridad" icon="🛡️">
            <p>OHB implementa las siguientes medidas de seguridad para proteger sus datos personales:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <SecurityCard title="Encriptación" detail="Todas las comunicaciones se transmiten mediante protocolo HTTPS/TLS. Los datos sensibles se cifran en reposo." />
              <SecurityCard title="Tokens de Sesión" detail="Sesiones protegidas con tokens únicos de 64 caracteres con expiración automática de 30 minutos." />
              <SecurityCard title="Protección XSS/CSRF" detail="Sanitización de entradas de usuario y tokens CSRF para prevenir ataques de inyección." />
              <SecurityCard title="Content Security Policy" detail="Headers HTTP de seguridad para prevenir ejecución de código no autorizado." />
              <SecurityCard title="Rate Limiting" detail="Protección contra intentos masivos de acceso con bloqueo temporal tras 5 intentos fallidos." />
              <SecurityCard title="Passwording Seguro" detail="Validación de fortaleza de contraseña con requisitos de complejidad mínimos." />
            </div>
          </Section>

          {/* Cookies */}
          <Section title="5. Uso de Cookies y Tecnologías de Rastreo" icon="🍪">
            <p>OHB utiliza cookies y tecnologías similares para:</p>
            <ul>
              <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento de la plataforma (sesión de usuario, preferencias de idioma).</li>
              <li><strong>Cookies analíticas:</strong> Para entender el uso de la plataforma y mejorar nuestros servicios (de forma anonimizada).</li>
            </ul>
            <p style={{ marginTop: '0.8rem' }}>
              OHB <strong>NO</strong> utiliza cookies de publicidad ni comparte datos de navegación con redes publicitarias de terceros.
              Usted puede deshabilitar las cookies en la configuración de su navegador, aunque esto podría afectar la funcionalidad del sitio.
            </p>
          </Section>

          {/* Transferencia */}
          <Section title="6. Transferencia de Datos Personales" icon="🔄">
            <p>
              OHB <strong>NO vende, renta ni comparte</strong> sus datos personales con terceros para fines
              comerciales o publicitarios.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              Sus datos podrán ser compartidos únicamente en los siguientes casos:
            </p>
            <ul>
              <li>Cuando sea requerido por autoridades competentes mediante orden judicial o requerimiento formal.</li>
              <li>Con proveedores de servicios tecnológicos que operan bajo estrictos acuerdos de confidencialidad.</li>
              <li>Con instituciones financieras, únicamente cuando usted autorice expresamente el trámite de un crédito hipotecario.</li>
            </ul>
          </Section>

          {/* Derechos ARCO */}
          <Section title="7. Derechos ARCO" icon="⚖️">
            <p>
              Usted tiene derecho a <strong>Acceder, Rectificar, Cancelar u Oponerse</strong> (Derechos ARCO)
              al tratamiento de sus datos personales, así como a <strong>revocar el consentimiento</strong> otorgado.
            </p>
            <p style={{ marginTop: '0.8rem' }}>Para ejercer sus Derechos ARCO, envíe su solicitud a:</p>
            <div style={{
              padding: '1rem', borderRadius: '12px', marginTop: '0.8rem',
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)'
            }}>
              <p><strong>📧 Correo:</strong> privacidad@ohb.com</p>
              <p><strong>📍 Dirección:</strong> Tomás Fernández #7818, local 19, C.P. 32460, Cd. Juárez, Chih.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Su solicitud será atendida en un plazo máximo de 20 días hábiles.
                Necesitará proporcionar: nombre completo, correo registrado, descripción clara de su solicitud,
                y copia de identificación oficial.
              </p>
            </div>
          </Section>

          {/* Menores */}
          <Section title="8. Datos de Menores de Edad" icon="👶">
            <p>
              OHB no recopila intencionalmente datos personales de menores de 18 años.
              Si detectamos que se ha registrado un menor, procederemos a eliminar su información de forma inmediata.
              Si usted es padre o tutor y cree que un menor ha proporcionado datos en nuestra plataforma,
              contáctenos a <strong>privacidad@ohb.com</strong>.
            </p>
          </Section>

          {/* Chatbot IA */}
          <Section title="9. Uso de Inteligencia Artificial (Chatbot AVA)" icon="🤖">
            <p>
              Nuestro asistente de IA &quot;AVA&quot; es un chatbot informativo que opera localmente en su navegador.
            </p>
            <ul>
              <li>Las conversaciones con AVA <strong>NO son almacenadas</strong> en nuestros servidores.</li>
              <li>AVA no tiene acceso a sus datos personales ni a su historial de navegación.</li>
              <li>Las respuestas de AVA son informativas y no constituyen asesoría legal, financiera ni de inversión.</li>
              <li>Al cerrar el navegador, toda la conversación se elimina permanentemente.</li>
            </ul>
          </Section>

          {/* Modificaciones */}
          <Section title="10. Modificaciones al Aviso de Privacidad" icon="📝">
            <p>
              OHB se reserva el derecho de modificar este Aviso de Privacidad en cualquier momento.
              Las modificaciones estarán disponibles en esta misma página web.
              Se notificará a los usuarios registrados por correo electrónico sobre cambios sustanciales.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              Le recomendamos revisar periódicamente este aviso para mantenerse informado sobre cómo protegemos sus datos.
            </p>
          </Section>

          {/* INAI */}
          <Section title="11. Autoridad Competente" icon="🏛️">
            <p>
              Si considera que ha sido vulnerado su derecho a la protección de datos personales,
              puede interponer una queja ante el Instituto Nacional de Transparencia, Acceso a la
              Información y Protección de Datos Personales (INAI):
            </p>
            <div style={{
              padding: '1rem', borderRadius: '12px', marginTop: '0.8rem',
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)'
            }}>
              <p><strong>🌐 Sitio web:</strong> <a href="https://home.inai.org.mx" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-silver)', textDecoration: 'underline' }}>www.inai.org.mx</a></p>
              <p><strong>📞 Tel INAI:</strong> 800 835 4324 (larga distancia sin costo)</p>
            </div>
          </Section>

          {/* Consentimiento */}
          <div style={{
            padding: '2rem', borderRadius: '16px', marginTop: '1rem',
            background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.2)',
            textAlign: 'center'
          }}>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              ✅ Consentimiento
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '700px', margin: '0 auto' }}>
              Al registrarse en nuestra plataforma y hacer uso de nuestros servicios, usted manifiesta
              su consentimiento para el tratamiento de sus datos personales conforme a lo descrito en
              este Aviso de Privacidad.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Reusable Section Component
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: '1.5rem', borderRadius: '16px',
      background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)',
    }}>
      <h2 style={{
        fontFamily: 'var(--font-outfit)', fontSize: '1.3rem',
        marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
      }}>
        {icon} {title}
      </h2>
      <div style={{
        color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '0.95rem',
      }}>
        {children}
      </div>
    </div>
  );
}

function InfoBox({ type, children }: { type: 'important' | 'info'; children: React.ReactNode }) {
  const colors = type === 'important'
    ? { bg: 'rgba(251, 191, 36, 0.08)', border: 'rgba(251, 191, 36, 0.2)', icon: '⚠️' }
    : { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)', icon: 'ℹ️' };

  return (
    <div style={{
      padding: '1rem', borderRadius: '10px', marginTop: '1rem',
      background: colors.bg, border: `1px solid ${colors.border}`,
      fontSize: '0.9rem', lineHeight: '1.6'
    }}>
      {colors.icon} {children}
    </div>
  );
}

function SecurityCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div style={{
      padding: '1rem', borderRadius: '12px',
      background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.15)',
    }}>
      <p style={{ fontWeight: 'bold', color: '#4ade80', marginBottom: '0.3rem', fontSize: '0.9rem' }}>
        🛡️ {title}
      </p>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
        {detail}
      </p>
    </div>
  );
}
