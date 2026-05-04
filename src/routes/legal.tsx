import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/legal')({
  component: LegalLayout,
})

function LegalLayout() {
  return (
    <div className="min-h-screen bg-blue-50 py-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-12 border border-blue-100">
        <h1 className="text-3xl font-bold text-blue-950 mb-8">Información Legal - OHB</h1>
        
        <section className="mb-12">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Política de Privacidad</h2>
          <p className="text-blue-800/70 leading-relaxed">
            En OHB Asesorías y Consultorías, la protección de sus datos personales es nuestra prioridad. 
            Cumplimos con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares en México.
            Sus datos son utilizados únicamente para la gestión inmobiliaria y el contacto solicitado.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Términos y Condiciones</h2>
          <p className="text-blue-800/70 leading-relaxed">
            Al utilizar nuestra plataforma, usted acepta que OHB es un intermediario en servicios inmobiliarios. 
            La información mostrada sobre propiedades es responsabilidad de los vendedores, aunque OHB realiza filtros de calidad.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Uso de Cookies</h2>
          <p className="text-blue-800/70 leading-relaxed">
            Utilizamos cookies técnicas para mejorar la velocidad de carga y cookies analíticas para entender cómo mejorar nuestra experiencia de usuario (UI-UX).
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-blue-50 text-center">
          <a href="/" className="text-blue-700 font-bold hover:underline">Volver al Inicio</a>
        </div>
      </div>
    </div>
  )
}
