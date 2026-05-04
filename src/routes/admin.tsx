import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation, useConvexAuth } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState, useMemo, useEffect } from 'react'
import Logo from '../components/Logo'

export const Route = createFileRoute('/admin')({
  component: AdminDashboard,
})

function ConfigSection() {
  const configs = useSuspenseQuery(convexQuery((api as any).config.listAll, {})).data as any[];
  const setConfig = useMutation((api as any).config.set);
  const [localConfig, setLocalConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    const map: Record<string, string> = {};
    configs.forEach(c => map[c.key] = c.value);
    setLocalConfig(map);
  }, [configs]);

  const handleSave = async (key: string) => {
    await setConfig({ key, value: localConfig[key] || "" });
    alert(`Configuración "${key}" actualizada.`);
  };

  return (
    <div className="bg-white rounded-[4rem] shadow-3xl border border-blue-50 overflow-hidden">
      <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
        <div>
          <h2 className="text-2xl font-black text-blue-950 tracking-tighter uppercase flex items-center gap-3 italic">
            <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs not-italic">⚙️</span>
            Configuración Global HQ
          </h2>
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1 italic">Gestión de variables de entorno y API Keys</p>
        </div>
      </div>

      <div className="p-12 space-y-10">
        {[
          { key: 'whatsapp', label: 'WhatsApp de Atención', type: 'text', placeholder: '521XXXXXXXXXX' },
          { key: 'stripe_public', label: 'Stripe Public Key', type: 'text', placeholder: 'pk_test_...' },
          { key: 'stripe_secret', label: 'Stripe Secret Key', type: 'password', placeholder: 'sk_test_...' },
          { key: 'billing_email', label: 'Email de Facturación', type: 'email', placeholder: 'admin@ohb.com' },
          { key: 'admin_password_reset', label: 'Nueva Contraseña Admin', type: 'password', placeholder: '********' },
        ].map((item) => (
          <div key={item.key} className="group">
            <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest mb-4 opacity-40">{item.label}</label>
            <div className="flex gap-4">
              <input 
                type={item.type}
                placeholder={item.placeholder}
                value={localConfig[item.key] || ""}
                onChange={(e) => setLocalConfig({...localConfig, [item.key]: e.target.value})}
                className="flex-1 p-5 bg-gray-50 rounded-2xl border-2 border-gray-100 outline-none focus:border-blue-600 transition-all font-bold text-sm"
              />
              <button 
                onClick={() => handleSave(item.key)}
                className="px-8 bg-blue-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-xl"
              >
                Guardar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AcademyAdminSection({ showModal, setShowModal }: { showModal: boolean, setShowModal: (s: boolean) => void }) {
  const courses = useSuspenseQuery(convexQuery((api as any).academy.list, {})).data as any[];
  const createCourse = useMutation((api as any).academy.create);
  const deleteCourse = useMutation((api as any).academy.remove);
  
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    price: 0,
    instructor: "Asesor OHB",
    duration: "4 Semanas",
    status: "active" as const,
    modules: [{ title: "Módulo 1: Introducción", content: "", type: "video" as const }]
  });

  const handleAddCourse = async () => {
    await createCourse(newCourse);
    setShowModal(false);
    setNewCourse({
      title: "",
      description: "",
      price: 0,
      instructor: "Asesor OHB",
      duration: "4 Semanas",
      status: "active",
      modules: [{ title: "Módulo 1: Introducción", content: "", type: "video" }]
    });
  };

  return (
    <div className="bg-white rounded-[4rem] shadow-3xl border border-blue-50 overflow-hidden">
      <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
        <div>
          <h2 className="text-2xl font-black text-blue-950 tracking-tighter uppercase flex items-center gap-3 italic">
            <span className="w-8 h-8 bg-[#d4af37] text-black rounded-lg flex items-center justify-center text-xs not-italic">A</span>
            OHB Academy Management
          </h2>
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1 italic">Control de certificados y programas académicos</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-8 py-4 bg-[#d4af37] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
        >
          + Crear Nuevo Curso
        </button>
      </div>

      <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {courses.map((course: any) => (
          <div key={course._id} className="p-8 rounded-3xl bg-gray-50 border border-gray-100 flex justify-between items-start group">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] bg-white px-3 py-1 rounded-full shadow-sm">Certificable</span>
                <span className="text-blue-950 font-bold text-sm">${course.price} MXN</span>
              </div>
              <h3 className="text-xl font-black text-blue-950 italic uppercase">{course.title}</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">{course.duration} • {course.instructor}</p>
            </div>
            <button 
              onClick={() => deleteCourse({ id: course._id })}
              className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-blue-950/40 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] p-12 max-w-2xl w-full shadow-4xl border border-white">
            <h2 className="text-3xl font-black text-blue-950 italic uppercase tracking-tighter mb-8">Nuevo Curso Elite</h2>
            <div className="space-y-6">
              <input 
                placeholder="Título del Curso"
                className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-gray-100 outline-none focus:border-blue-600 transition-all font-bold"
                value={newCourse.title}
                onChange={e => setNewCourse({...newCourse, title: e.target.value})}
              />
              <textarea 
                placeholder="Descripción estratégica"
                className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-gray-100 outline-none focus:border-blue-600 transition-all font-bold h-32"
                value={newCourse.description}
                onChange={e => setNewCourse({...newCourse, description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number"
                  placeholder="Precio (MXN)"
                  className="p-5 bg-gray-50 rounded-2xl border-2 border-gray-100 outline-none focus:border-blue-600 transition-all font-bold"
                  value={newCourse.price}
                  onChange={e => setNewCourse({...newCourse, price: Number(e.target.value)})}
                />
                <input 
                  placeholder="Duración (ej. 4 Semanas)"
                  className="p-5 bg-gray-50 rounded-2xl border-2 border-gray-100 outline-none focus:border-blue-600 transition-all font-bold"
                  value={newCourse.duration}
                  onChange={e => setNewCourse({...newCourse, duration: e.target.value})}
                />
              </div>
              <div className="flex gap-4">
                <button onClick={handleAddCourse} className="flex-1 py-5 bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-800 transition-all shadow-xl">Publicar en Academy</button>
                <button onClick={() => setShowModal(false)} className="px-10 py-5 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const { data: viewer } = useSuspenseQuery(convexQuery(api.users.viewer, {}))
  const { data: users } = useSuspenseQuery(convexQuery(api.users.listAll, {}))
  const { data: properties } = useSuspenseQuery(convexQuery(api.properties.list, {}))
  const { data: prospects } = useSuspenseQuery(convexQuery(api.admin.listAllProfiles, {}))
  
  const updateRole = useMutation(api.users.updateRole)
  const addNote = useMutation(api.admin.addProspectNote)
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'leads' | 'users' | 'inventory' | 'academy' | 'analytics' | 'settings'>('leads')
  const [showAcademyModal, setShowAcademyModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [showToast, setShowToast] = useState<string | null>(null)

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  const totalBudget = useMemo(() => prospects.reduce((acc, p) => acc + (p.budget || 0), 0), [prospects])
  const avgScore = useMemo(() => prospects.length ? (prospects.reduce((acc, p) => acc + (p.score || 0), 0) / prospects.length).toFixed(1) : 0, [prospects])

  const filteredProspects = useMemo(() => 
    prospects.filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())),
    [prospects, searchTerm]
  )

  if (isLoading) return (
    <div className="min-h-screen bg-blue-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-24 h-24 border-8 border-blue-400 border-t-transparent rounded-full animate-spin shadow-2xl"></div>
        <div className="text-white font-black text-xs uppercase tracking-[0.5em] animate-pulse">Sincronizando Terminal HQ...</div>
      </div>
    </div>
  )
  
  if (!isAuthenticated || viewer?.role !== 'admin') {
    return <div className="min-h-screen bg-blue-50 flex items-center justify-center p-10">
      <div className="glass p-12 rounded-[3.5rem] text-center max-w-lg border border-white shadow-3xl">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8 text-3xl shadow-inner">🔒</div>
        <h1 className="text-4xl font-black text-blue-950 mb-4 tracking-tighter italic uppercase">Terminal Bloqueada</h1>
        <p className="text-blue-800/40 font-bold mb-10 leading-relaxed uppercase text-xs tracking-widest">Se requiere autorización nivel 1 (Admin) para acceder a los activos digitales de Juárez HQ.</p>
        <button onClick={() => navigate({ to: '/' })} className="w-full py-5 bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:scale-105 active:scale-95 transition-all shadow-2xl">Regresar al Portal</button>
      </div>
    </div>
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-8 font-sans selection:bg-blue-200 selection:text-blue-900">
      
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-500">
          <div className="bg-blue-950 text-white px-8 py-4 rounded-2xl shadow-3xl border border-white/10 flex items-center gap-4">
             <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
             <span className="font-black text-[10px] uppercase tracking-[0.2em]">{showToast}</span>
          </div>
        </div>
      )}

      <div className="max-w-[1650px] mx-auto space-y-8">
        
        <header className="glass p-8 rounded-[3.5rem] shadow-[0_40px_100px_-15px_rgba(30,58,138,0.1)] border border-white flex flex-col lg:flex-row justify-between items-center gap-8 sticky top-4 z-[90]">
          <div className="flex items-center gap-6 group cursor-default">
            <Logo className="h-14" variant="full" />
            <div>
              <h1 className="text-3xl font-black text-blue-950 tracking-tighter italic uppercase hidden xl:block">Command <span className="text-blue-600">Center</span></h1>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mt-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                Juárez HQ Terminal | Chihuahua, MX
              </p>
            </div>
          </div>

          <nav className="flex gap-2 bg-gray-200/50 p-2 rounded-[2.5rem] shadow-inner border border-gray-200/30 backdrop-blur-xl">
            {(['leads', 'users', 'inventory', 'academy', 'analytics', 'settings'] as const).map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-10 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === tab ? 'bg-blue-700 text-white shadow-xl scale-105' : 'text-blue-900/40 hover:text-blue-800 hover:bg-white/50'}`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-5">
             <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest italic">Operations Director</p>
                <p className="text-blue-950 font-black text-sm">{viewer.name || viewer.email}</p>
             </div>
             <button onClick={() => navigate({ to: '/' })} className="w-14 h-14 bg-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border border-gray-100 flex items-center justify-center text-2xl">🏠</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { l: 'Prospectos Activos', v: prospects.length, d: '+12% Mensual', c: 'text-blue-600', i: '👤', b: 'bg-blue-50' },
             { l: 'Score Promedio', v: avgScore, d: 'Calificación IA', c: 'text-green-600', i: '⭐', b: 'bg-green-50' },
             { l: 'Capital Proyectado', v: `$${(totalBudget / 1000000).toFixed(1)}M`, d: 'Budget Acumulado', c: 'text-purple-600', i: '💎', b: 'bg-purple-50' },
             { l: 'Tasa Respuesta', v: '98%', d: 'SLA Digital', c: 'text-orange-600', i: '⚡', b: 'bg-orange-50' }
           ].map(stat => (
             <div key={stat.l} className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-white hover:border-blue-100 transition-all group relative overflow-hidden">
               <div className={`absolute top-0 right-0 w-32 h-32 ${stat.b} rounded-full -mr-16 -mt-16 opacity-40 blur-3xl group-hover:opacity-80 transition-opacity`}></div>
               <div className="relative z-10 flex flex-col justify-between h-full">
                 <div className="flex justify-between items-start">
                   <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">{stat.l}</div>
                   <span className="text-xl grayscale group-hover:grayscale-0 transition-all opacity-30 group-hover:opacity-100">{stat.i}</span>
                 </div>
                 <div className="mt-6">
                   <div className={`text-5xl font-black text-blue-950 tracking-tighter italic`}>{stat.v}</div>
                   <div className={`text-[10px] font-black uppercase tracking-widest ${stat.c} mt-3 flex items-center gap-2`}>
                      <span className="w-1 h-1 bg-current rounded-full"></span> {stat.d}
                   </div>
                 </div>
               </div>
             </div>
           ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            
            {activeTab === 'settings' && (
              <ConfigSection />
            )}

            {activeTab === 'academy' && (
              <AcademyAdminSection showModal={showAcademyModal} setShowModal={setShowAcademyModal} />
            )}

            {activeTab === 'leads' && (
              <div className="bg-white rounded-[4rem] shadow-3xl border border-blue-50 overflow-hidden">
                <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/20">
                   <div>
                      <h2 className="text-2xl font-black text-blue-950 tracking-tighter uppercase flex items-center gap-3 italic">
                        <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs not-italic">L</span>
                        Intelligence Pipeline
                      </h2>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1 italic">Segmentación automática vía Gemini 2.0 Flash</p>
                   </div>
                   <div className="relative w-full md:w-96 group">
                      <input 
                        className="w-full bg-white border-2 border-gray-200 rounded-3xl py-4 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-600 focus:ring-8 focus:ring-blue-100 transition-all shadow-inner"
                        placeholder="Buscar por ID o Nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg grayscale group-hover:grayscale-0 transition-all opacity-20">🔍</span>
                   </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100/50">
                        <th className="p-10 text-left text-[10px] font-black text-blue-900/40 uppercase tracking-widest">Digital ID / Prospect</th>
                        <th className="p-10 text-left text-[10px] font-black text-blue-900/40 uppercase tracking-widest italic">IA Status</th>
                        <th className="p-10 text-left text-[10px] font-black text-blue-900/40 uppercase tracking-widest">Financial Profile</th>
                        <th className="p-10 text-right text-[10px] font-black text-blue-900/40 uppercase tracking-widest">Action Center</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredProspects.map((p) => (
                        <tr key={p._id} className="hover:bg-blue-50/20 transition-all group">
                          <td className="p-10">
                             <div className="flex items-center gap-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black italic shadow-lg ${p.score && p.score > 3 ? 'bg-blue-950 text-white' : 'bg-white border-2 border-gray-100 text-blue-300'}`}>
                                  {p.name ? p.name[0] : 'U'}
                                </div>
                                <div>
                                   <div className="font-black text-blue-950 text-xl tracking-tighter uppercase italic">{p.name || 'Incógnito'}</div>
                                   <div className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mt-1 italic opacity-60">{p._id.slice(-8)} • {new Date(p._creationTime).toLocaleDateString()}</div>
                                </div>
                             </div>
                          </td>
                          <td className="p-10">
                             <div className="flex items-center gap-2">
                                {[1,2,3,4,5].map(s => (
                                  <div key={s} className={`w-3 h-3 rounded-full shadow-inner ${s <= (p.score || 0) ? 'bg-blue-600 animate-pulse' : 'bg-gray-200'}`}></div>
                                ))}
                                <span className="ml-3 text-[10px] font-black text-blue-900 italic uppercase tracking-widest">{p.score ? `Calificado ${p.score}/5` : 'Analizando...'}</span>
                             </div>
                          </td>
                          <td className="p-10">
                            <div className="space-y-2">
                               <div className="text-[11px] font-black text-blue-950 italic uppercase tracking-widest flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                  {p.location || 'Búsqueda Global'}
                               </div>
                               <div className="text-xl font-black text-blue-600 tracking-tighter italic">${p.budget?.toLocaleString() || '---'} MXN</div>
                            </div>
                          </td>
                          <td className="p-10 text-right">
                             <button 
                               onClick={() => {
                                 setSelectedLead(p._id)
                                 setNoteText('')
                               }}
                               className="px-8 py-4 bg-white border-2 border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-950 hover:text-white hover:border-blue-950 transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
                             >
                               Gestionar File
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {properties.map((prop: any) => (
                    <div key={prop._id} className="bg-white rounded-[4rem] shadow-xl border border-white overflow-hidden hover:scale-[1.02] transition-all group">
                       <div className="aspect-[4/3] relative overflow-hidden">
                          <img src={prop.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={prop.title} />
                          <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-transparent to-transparent opacity-80"></div>
                          <div className="absolute bottom-8 left-8">
                             <div className="text-[9px] font-black text-blue-300 uppercase tracking-[0.5em] mb-2">{prop.location}</div>
                             <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{prop.title}</h3>
                          </div>
                          <div className="absolute top-8 right-8 bg-white/20 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/30 text-white font-black text-[10px] uppercase tracking-widest italic shadow-2xl">
                             Elite Asset
                          </div>
                       </div>
                       <div className="p-10 flex justify-between items-center border-t border-gray-50">
                          <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Mercado MXN</p>
                            <p className="text-3xl font-black text-blue-950 tracking-tighter italic">${prop.price?.toLocaleString()}</p>
                          </div>
                          <button className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center text-2xl hover:bg-blue-700 hover:text-white transition-all shadow-inner rotate-3 hover:rotate-0">✏️</button>
                       </div>
                    </div>
                  ))}
                  <div className="bg-gradient-to-br from-blue-700 to-blue-950 rounded-[4rem] shadow-[0_40px_80px_-20px_rgba(30,58,138,0.5)] p-12 text-white flex flex-col justify-center items-center text-center space-y-8 group cursor-pointer hover:scale-[1.03] transition-all relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
                    <div className="w-28 h-24 border-4 border-dashed border-white/20 rounded-[2.5rem] flex items-center justify-center text-5xl font-light group-hover:border-white/60 group-hover:rotate-6 transition-all">+</div>
                    <div className="relative z-10">
                      <h3 className="text-3xl font-black tracking-tighter uppercase italic">Nuevo Activo</h3>
                      <p className="text-blue-200/50 text-[10px] font-bold uppercase tracking-[0.4em] mt-3">Expansión de Inventario HQ</p>
                    </div>
                  </div>
               </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white rounded-[4rem] shadow-3xl border border-blue-50 overflow-hidden">
                <div className="p-12 border-b border-gray-50 flex justify-between items-center bg-gray-50/10">
                   <div>
                      <h2 className="text-2xl font-black text-blue-950 tracking-tighter uppercase italic">Control de Roles</h2>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Gestión de privilegios y accesos a la red</p>
                   </div>
                   <div className="px-10 py-4 bg-blue-950 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Red Operativa: {users.length}</div>
                </div>
                <div className="divide-y divide-gray-50">
                  {users.map((u: any) => (
                    <div key={u._id} className="p-12 flex items-center justify-between hover:bg-blue-50/10 transition-all group">
                       <div className="flex items-center gap-8">
                          <div className="relative">
                            <div className="w-20 h-20 bg-white rounded-full border-4 border-gray-100 shadow-xl overflow-hidden group-hover:scale-110 transition-transform">
                              <img src={u.image || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name || u.email}`} className="w-full h-full object-cover" alt="user" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-lg"></div>
                          </div>
                          <div>
                            <p className="font-black text-blue-950 text-xl tracking-tight">{u.name || 'Personal OHB'}</p>
                            <p className="text-[11px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-1">{u.email}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                         <div className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-inner ${
                           u.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 
                           u.role === 'sales_rep' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 
                           'bg-gray-100 text-gray-500'
                         }`}>
                           {u.role || 'prospect'}
                         </div>
                         <select 
                           className="bg-white border-2 border-gray-100 rounded-2xl px-6 py-4 text-[10px] font-black uppercase outline-none focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer shadow-sm"
                           value={u.role || 'prospect'}
                           onChange={async (e) => {
                             await updateRole({ userId: u._id, role: e.target.value as any })
                             setShowToast("Privilegios de usuario modificados")
                           }}
                         >
                           <option value="prospect">Prospecto</option>
                           <option value="sales_rep">Sales Rep</option>
                           <option value="admin">Administrador</option>
                         </select>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
             <div className="bg-blue-950 rounded-[4rem] p-12 text-white shadow-[0_40px_100px_-20px_rgba(30,58,138,0.4)] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full -mr-32 -mt-32 opacity-20 blur-[100px] group-hover:scale-150 transition-transform duration-1000"></div>
                <h2 className="text-3xl font-black tracking-tighter uppercase italic mb-10 flex items-center gap-4 relative z-10">
                   <span className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-sm not-italic shadow-xl">H</span>
                   Network Health
                </h2>
                <div className="space-y-10 relative z-10">
                   {[
                     { l: 'Database Status', s: 'Operational', c: 'bg-green-500' },
                     { l: 'IA Engine (Gemini)', s: 'Latency 12ms', c: 'bg-green-500' },
                     { l: 'Auth (Convex)', s: 'Secured/RSA', c: 'bg-blue-400' },
                     { l: 'CDN Performance', s: 'Juárez Node High', c: 'bg-orange-400' }
                   ].map(n => (
                     <div key={n.l} className="flex justify-between items-center group/item cursor-default">
                        <div>
                          <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1 italic opacity-60">{n.l}</p>
                          <p className="text-xs font-black uppercase tracking-widest">{n.s}</p>
                        </div>
                        <div className={`w-3 h-3 ${n.c} rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] group-hover/item:scale-150 transition-transform`}></div>
                     </div>
                   ))}
                </div>
                <div className="mt-16 pt-10 border-t border-white/10">
                   <button className="w-full py-5 bg-white/5 hover:bg-white text-white hover:text-blue-950 rounded-2xl font-black uppercase tracking-[0.3em] text-[9px] transition-all border border-white/10 shadow-2xl">Reiniciar Nodos Digitales</button>
                </div>
             </div>

             <div className="bg-white rounded-[4rem] p-12 shadow-3xl border border-blue-50">
                <h2 className="text-2xl font-black text-blue-950 tracking-tighter uppercase italic mb-10 flex items-center gap-4">
                  <span className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-sm not-italic shadow-inner">B</span>
                  Lead Bitácora
                </h2>
                <div className="space-y-8 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                   {prospects.flatMap(p => (p.notes || []).map((n: any, idx: number) => (
                      <div key={`${p._id}-${idx}`} className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100 relative group animate-in fade-in duration-700">
                         <div className="flex justify-between items-start mb-4">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">{p.name || 'Anónimo'}</p>
                            <p className="text-[8px] font-bold text-blue-300 uppercase tracking-widest">{new Date(n.timestamp).toLocaleTimeString()}</p>
                         </div>
                         <p className="text-blue-950 font-bold text-sm leading-relaxed">{n.text}</p>
                         <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                      </div>
                   ))).reverse()}
                   {prospects.every(p => !p.notes?.length) && (
                     <div className="text-center py-20 opacity-20 italic font-bold uppercase text-[10px] tracking-[0.4em] text-blue-900">Sin entradas operativas recientes</div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>

      {selectedLead && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-blue-950/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[4rem] p-14 max-w-2xl w-full shadow-4xl border border-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full -mr-24 -mt-24 opacity-50 blur-3xl"></div>
              <button 
                onClick={() => setSelectedLead(null)}
                className="absolute top-10 right-10 w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-inner font-black text-xs"
              >
                ✕
              </button>
              
              <div className="relative z-10">
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] mb-4 italic">Update Lead Dossier</div>
                <h3 className="text-4xl font-black text-blue-950 italic uppercase tracking-tighter mb-10">Expediente Digital</h3>
                
                <div className="space-y-8">
                   <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 italic">Nueva Entrada Estratégica</p>
                     <textarea 
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] p-8 text-sm font-bold text-blue-950 outline-none focus:border-blue-600 focus:ring-8 focus:ring-blue-100 transition-all shadow-inner h-40 resize-none"
                        placeholder="Registrar actualización de contacto, perfil financiero o estatus de cierre..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                     />
                   </div>
                   
                   <div className="flex gap-4">
                     <button 
                       onClick={async () => {
                         if(!noteText) return
                         await addNote({ prospectId: selectedLead as any, note: noteText })
                         setSelectedLead(null)
                         setShowToast("Entrada registrada en la bitácora central")
                       }}
                       className="flex-1 py-6 bg-blue-700 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-500/20 italic"
                     >
                        Confirmar Entrada
                     </button>
                     <button 
                       onClick={() => setSelectedLead(null)}
                       className="px-12 py-6 bg-gray-50 text-gray-400 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-gray-100 transition-all shadow-inner italic"
                     >
                       Descartar
                     </button>
                   </div>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
