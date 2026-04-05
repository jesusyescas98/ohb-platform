import Header from "../../components/Header";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y Condiciones generales de uso de la plataforma OHB Asesorías y Consultorías. Regulaciones de uso, propiedad intelectual, pagos, reembolsos y responsabilidad.",
  keywords: [
    "términos y condiciones OHB",
    "condiciones de uso plataforma inmobiliaria",
    "términos legales bienes raíces",
    "reglamento plataforma OHB",
  ],
  openGraph: {
    title: "Términos y Condiciones | OHB Asesorías y Consultorías",
    description: "Términos y Condiciones de uso de la plataforma OHB.",
    url: "https://www.ohbasesores.com/terms",
    type: "website",
    locale: "es_MX",
  },
  twitter: {
    card: "summary",
    title: "Términos y Condiciones | OHB",
    description: "Consulta los términos y condiciones de la plataforma OHB.",
  },
  alternates: {
    canonical: "https://www.ohbasesores.com/terms",
  },
};

export default function TermsPage() {
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
            background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)',
            fontSize: '0.8rem', color: '#60a5fa'
          }}>
            📋 Documento Legal Vigente
          </div>
          <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '2.2rem', marginBottom: '0.5rem' }}>
            Términos y <span className="text-gradient-silver">Condiciones</span> Generales
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Última actualización: {lastUpdated}
          </p>
        </div>

        {/* Content Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <Section title="1. Aceptación de los Términos" icon="✅">
            <p>
              Al acceder y utilizar la plataforma de OHB Asesorías y Consultorías (en adelante &quot;la Plataforma&quot;),
              usted acepta quedar vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguna
              parte de estos términos, le solicitamos abstenerse de utilizar la Plataforma.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              El uso continuado de la Plataforma después de la publicación de cambios constituye la aceptación
              de los términos modificados.
            </p>
          </Section>

          <Section title="2. Descripción del Servicio" icon="🏢">
            <p>OHB ofrece a través de su Plataforma los siguientes servicios:</p>
            <ul>
              <li>Información y asesoría sobre bienes raíces e inversiones en Ciudad Juárez y alrededores.</li>
              <li>Herramientas de cálculo financiero (hipoteca, ROI, inversión fija) de carácter informativo.</li>
              <li>Portafolio de propiedades disponibles para compra, venta y renta.</li>
              <li>Academia OHB con contenido educativo sobre inversión inmobiliaria.</li>
              <li>Asistente de Inteligencia Artificial (AVA) para consultas informativas.</li>
              <li>Panel de control (Dashboard) para asesores y administradores autorizados.</li>
            </ul>
          </Section>

          <Section title="3. Registro y Cuentas de Usuario" icon="👤">
            <p>Para acceder a ciertas funcionalidades, usted deberá crear una cuenta proporcionando información veraz y actualizada.</p>
            <ul>
              <li>Es su responsabilidad mantener la confidencialidad de sus credenciales de acceso.</li>
              <li>Debe notificar de inmediato cualquier uso no autorizado de su cuenta.</li>
              <li>Las contraseñas deben cumplir con los requisitos mínimos de seguridad establecidos por la Plataforma.</li>
              <li>OHB se reserva el derecho de suspender o cancelar cuentas que violen estos términos.</li>
              <li>Cada cuenta es personal e intransferible.</li>
            </ul>
          </Section>

          <Section title="4. Uso Aceptable" icon="📐">
            <p>Al usar la Plataforma, usted se compromete a:</p>
            <ul>
              <li>No utilizar la Plataforma para fines ilícitos o no autorizados.</li>
              <li>No intentar acceder a áreas restringidas de la Plataforma sin autorización.</li>
              <li>No realizar ingeniería inversa, descompilar o desensamblar el software de la Plataforma.</li>
              <li>No transmitir virus, malware o código malicioso.</li>
              <li>No realizar ataques de denegación de servicio (DDoS) o intentos de saturación.</li>
              <li>No suplantar la identidad de otra persona o entidad.</li>
              <li>No recopilar información de otros usuarios sin su consentimiento.</li>
              <li>No publicar contenido ofensivo, difamatorio o que viole derechos de terceros.</li>
            </ul>
          </Section>

          <Section title="5. Propiedad Intelectual" icon="©️">
            <p>
              Todo el contenido de la Plataforma, incluyendo pero no limitado a textos, gráficos, logotipos,
              iconos, imágenes, clips de audio, descargas digitales, compilaciones de datos y software,
              es propiedad de OHB o de sus proveedores de contenido y está protegido por las leyes mexicanas
              e internacionales de propiedad intelectual.
            </p>
            <ul>
              <li>La marca &quot;OHB Asesorías y Consultorías&quot; y su logotipo son marcas registradas.</li>
              <li>Queda prohibida la reproducción total o parcial del contenido sin autorización escrita.</li>
              <li>Los cursos de la Academia OHB tienen licencia de uso personal y no transferible.</li>
            </ul>
          </Section>

          <Section title="6. Herramientas Financieras" icon="🧮">
            <p>
              Las calculadoras de hipoteca, inversión y demás herramientas financieras disponibles en
              la Plataforma son de carácter <strong>estrictamente informativo y orientativo</strong>.
            </p>
            <ul>
              <li>Los resultados generados no constituyen una oferta financiera vinculante.</li>
              <li>Las tasas de interés, rendimientos y proyecciones son estimaciones basadas en datos públicos.</li>
              <li>OHB recomienda consultar con un asesor financiero certificado antes de tomar decisiones de inversión.</li>
              <li>OHB no se hace responsable por decisiones financieras tomadas basándose exclusivamente en estas herramientas.</li>
            </ul>
          </Section>

          <Section title="7. Chatbot AVA (Inteligencia Artificial)" icon="🤖">
            <p>El asistente de IA &quot;AVA&quot; está sujeto a las siguientes condiciones:</p>
            <ul>
              <li>Las respuestas de AVA son informativas y no constituyen asesoría profesional.</li>
              <li>AVA no tiene capacidad para realizar transacciones ni comprometer a OHB contractualmente.</li>
              <li>La información proporcionada por AVA puede no estar actualizada en tiempo real.</li>
              <li>OHB no garantiza la exactitud completa de las respuestas generadas por IA.</li>
            </ul>
          </Section>

          <Section title="8. Limitación de Responsabilidad" icon="⚠️">
            <p>OHB no será responsable por:</p>
            <ul>
              <li>Interrupciones temporales en el servicio por mantenimiento o fuerza mayor.</li>
              <li>Pérdidas derivadas del uso inadecuado de la Plataforma por parte del usuario.</li>
              <li>La exactitud de la información de propiedades publicadas por terceros.</li>
              <li>Daños indirectos, incidentales o consecuentes derivados del uso de la Plataforma.</li>
              <li>Contenido generado por el asistente de IA que resulte inexacto.</li>
            </ul>
            <p style={{ marginTop: '0.8rem' }}>
              La responsabilidad máxima de OHB en cualquier caso estará limitada al monto pagado por
              el usuario por los servicios contratados durante los últimos 12 meses.
            </p>
          </Section>

          <Section title="9. Pagos y Reembolsos" icon="💳">
            <p>Para servicios de pago (cursos premium de la Academia OHB):</p>
            <ul>
              <li>Los precios están expresados en Pesos Mexicanos (MXN) e incluyen IVA.</li>
              <li>Los pagos se procesan a través de plataformas de pago seguras con encriptación SSL/TLS.</li>
              <li>Puede solicitar reembolso dentro de los primeros 7 días naturales posteriores a la compra.</li>
              <li>No aplica reembolso si ha completado más del 30% del contenido del curso.</li>
              <li>OHB no almacena datos de tarjetas de crédito/débito en sus servidores.</li>
            </ul>
          </Section>

          <Section title="10. Privacidad y Datos Personales" icon="🔒">
            <p>
              El tratamiento de datos personales se rige por nuestro{' '}
              <Link href="/privacy" style={{ color: 'var(--accent-silver)', textDecoration: 'underline' }}>
                Aviso de Privacidad
              </Link>, 
              el cual forma parte integral de estos Términos y Condiciones.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              Al aceptar estos Términos, usted también acepta las prácticas de privacidad descritas
              en el Aviso de Privacidad.
            </p>
          </Section>

          <Section title="11. Seguridad de la Plataforma" icon="🛡️">
            <p>OHB implementa medidas de seguridad de nivel empresarial:</p>
            <ul>
              <li>Comunicaciones encriptadas mediante HTTPS/TLS obligatorio.</li>
              <li>Headers de seguridad HTTP (CSP, HSTS, X-Frame-Options, X-Content-Type-Options).</li>
              <li>Protección contra ataques XSS, CSRF e inyección de código.</li>
              <li>Bloqueo temporal de cuentas tras intentos fallidos de acceso.</li>
              <li>Sesiones con expiración automática por inactividad.</li>
              <li>Monitoreo de actividad sospechosa y registro de auditoría.</li>
            </ul>
          </Section>

          <Section title="12. Ley Aplicable y Jurisdicción" icon="⚖️">
            <p>
              Estos Términos y Condiciones se rigen por las leyes vigentes de los Estados Unidos Mexicanos.
            </p>
            <p style={{ marginTop: '0.8rem' }}>
              Para la resolución de cualquier controversia derivada de la interpretación o cumplimiento
              de estos Términos, ambas partes se someten a la jurisdicción de los tribunales competentes
              en Ciudad Juárez, Chihuahua, México, renunciando a cualquier otro fuero que pudiera corresponderles.
            </p>
          </Section>

          <Section title="13. Contacto" icon="📧">
            <p>Para cualquier consulta sobre estos Términos y Condiciones:</p>
            <div style={{
              padding: '1rem', borderRadius: '12px', marginTop: '0.8rem',
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)'
            }}>
              <p><strong>📧 Correo:</strong> legal@ohb.com</p>
              <p><strong>📞 Teléfono:</strong> +52 656 123 4567</p>
              <p><strong>📍 Dirección:</strong> Tomás Fernández #7818, local 19, C.P. 32460, Cd. Juárez, Chih.</p>
            </div>
          </Section>

          {/* Acceptance banner */}
          <div style={{
            padding: '2rem', borderRadius: '16px', marginTop: '1rem',
            background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)',
            textAlign: 'center'
          }}>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              📋 Aceptación de Términos
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '700px', margin: '0 auto' }}>
              Al utilizar nuestra Plataforma, usted confirma que ha leído, entendido y aceptado estos
              Términos y Condiciones en su totalidad.
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
      }} className="terms-section-content">
        {children}
      </div>
    </div>
  );
}
