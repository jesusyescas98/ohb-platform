import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, Suspense, useRef, lazy } from 'react'
import { useConvexAuth, useMutation, useAction } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { SignIn } from '../components/Auth'
import Logo from '../components/Logo'

const PropertyMap = lazy(() => import('../components/PropertyMap'))

export const Route = createFileRoute('/')({
  component: Home,
})

function Toast({ message, visible, onClose }: { message: string, visible: boolean, onClose: () => void }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [visible, onClose])

  if (!visible) return null
  return (
    <div className="fixed top-24 right-8 z-[300] animate-in slide-in-from-right fade-in">
      <div className="glass px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border-l-4 border-l-blue-600">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">✓</div>
        <span className="font-black text-blue-900 text-xs uppercase tracking-widest">{message}</span>
      </div>
    </div>
  )
}

function ChatBot({ sessionId }: { sessionId: string }) {
  const [input, setInput] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  const historyQuery = useSuspenseQuery(convexQuery(api.agent.getHistory, { sessionId }))
  const history = historyQuery.data
  const sendMessage = useAction(api.agent_actions.chat)

  useEffect(() => {
    if (isOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, isOpen])

  const handleSendMessage = async () => {
    if (!input.trim() || isSending) return
    const text = input.trim()
    setInput("")
    setIsSending(true)
    try {
      await sendMessage({ sessionId, message: text })
    } catch (e) {
      console.error(e)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 left-8 z-[200] bg-blue-950 text-white px-8 py-5 rounded-full shadow-[0_30px_60px_-10px_rgba(30,58,138,0.5)] hover:scale-110 active:scale-95 transition-all flex items-center gap-4 group border border-white/10"
      >
        <div className="relative">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-[360deg] transition-all duration-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-4 border-blue-950 animate-ping"></span>
        </div>
        <span className="font-black text-xs uppercase tracking-[0.3em]">IA Concierge</span>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-8 z-[250] w-[350px] h-[550px] glass rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(30,58,138,0.5)] border border-white/40 flex flex-col overflow-hidden animate-in slide-in-from-bottom-12 zoom-in-95 duration-500">
          <div className="bg-gradient-to-r from-blue-800 to-blue-950 p-8 text-white">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-inner">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_15px_#4ade80]"></div>
                </div>
                <div>
                  <h4 className="font-black text-lg tracking-tighter leading-none">Asistente OHB</h4>
                  <p className="text-[10px] text-blue-300 font-black uppercase tracking-[0.2em] mt-2 italic">Inteligencia Inmobiliaria</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all">✕</button>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-white/20 scrollbar-hide">
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl rounded-tl-none text-sm text-blue-950 shadow-xl border border-white font-bold leading-relaxed">
              Bienvenido a OHB. Estoy listo para mostrarte nuestro inventario exclusivo y perfilar tu inversión. ¿Qué buscas hoy?
            </div>
            {history.map((msg: any) => (
              <div key={msg._id} className={`p-5 rounded-[2rem] text-sm shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 ${msg.role === 'user' ? 'bg-blue-700 text-white ml-10 rounded-tr-none border-b-4 border-blue-900' : 'bg-white text-blue-950 mr-10 rounded-tl-none border border-white font-bold leading-relaxed'}`}>
                {msg.text}
              </div>
            ))}
            {isSending && (
              <div className="flex gap-2 p-4 bg-white/40 rounded-full w-fit animate-pulse border border-white/50">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 bg-white/90 backdrop-blur-2xl border-t border-white/30">
            <div className="flex gap-3 bg-gray-100/50 p-2 rounded-[2rem] border border-gray-200 shadow-inner group focus-within:ring-4 focus-within:ring-blue-100 transition-all">
              <input 
                type="text" 
                placeholder="Pregunta por precios, zonas..." 
                className="flex-1 px-5 py-4 bg-transparent text-sm font-black text-blue-950 placeholder:text-blue-300 outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage() }}
              />
              <button 
                onClick={handleSendMessage}
                disabled={isSending}
                className="bg-blue-700 text-white w-14 h-14 rounded-full flex items-center justify-center hover:bg-blue-800 transition-all shadow-xl active:scale-90 disabled:opacity-50"
              >
                ➔
              </button>
            </div>
          </div>
        </div>
      )}

      <a 
        href={`https://wa.me/${whatsappNumber}?text=Hola%20OHB,%20me%20interesa%20invertir.`}
        target="_blank" 
        className="fixed bottom-8 right-8 z-[200] w-20 h-20 bg-green-500 text-white rounded-full shadow-[0_30px_60px_-10px_rgba(34,197,94,0.5)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-4xl animate-bounce"
      >
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
      </a>
    </>
  )
}

function Home() {
  const whatsappConfig = useSuspenseQuery(convexQuery((api as any).config.get, { key: "whatsapp" })).data;
  const whatsappNumber = whatsappConfig || "6561327685";
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth()
  const { signOut } = useAuthActions()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [sessionId] = useState(() => Math.random().toString(36).substring(7))
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isClient, setIsClient] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [currency, setCurrency] = useState<'MXN' | 'USD'>('MXN')
  const { data: properties } = useSuspenseQuery(convexQuery(api.properties.list, {}))
  const { data: interactionCount } = useSuspenseQuery(convexQuery(api.counters.get, { name: 'inventory_interactions' }))
  const incrementInteractions = useMutation(api.counters.increment)
  const [showCookies, setShowCookies] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: "" })

  const [calcAmount, setCalcAmount] = useState(1000000)
  const [calcTerm, setCalcTerm] = useState(12)

  useEffect(() => {
    setIsClient(true)
    incrementInteractions({ name: 'inventory_interactions' })
    const hasConsent = localStorage.getItem('ohb-cookies')
    if (!hasConsent) setTimeout(() => setShowCookies(true), 2000)

    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      setScrollProgress((winScroll / height) * 100)
    }
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('ohb-cookies', 'true')
    setShowCookies(false)
    setToast({ visible: true, message: "Preferencias guardadas" })
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white text-blue-950 font-sans selection:bg-blue-100 overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-2 z-[350] bg-gray-100/30 backdrop-blur-xl">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.8)] transition-all duration-300 ease-out" 
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      <Toast visible={toast.visible} message={toast.message} onClose={() => setToast({ ...toast, visible: false })} />

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none opacity-30">
        <div className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] bg-blue-50 rounded-full blur-[120px] animate-gradient-x"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30vw] h-[30vw] bg-blue-100 rounded-full blur-[100px] animate-float"></div>
      </div>

      {showCookies && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[400] w-[90%] max-w-4xl animate-in slide-in-from-bottom-20 duration-1000">
          <div className="glass p-8 md:p-10 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(30,58,138,0.4)] border border-white/50 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 space-y-3">
              <h5 className="font-black text-xl tracking-tighter text-blue-950 flex items-center gap-3">
                <span className="text-2xl">🍪</span> Privacidad y Parámetros de Google
              </h5>
              <p className="text-sm text-blue-800/60 font-bold leading-relaxed">
                Utilizamos tecnologías de rastreo y cookies de Google Ads para optimizar tu experiencia y ofrecerte inversiones personalizadas en el mercado mexicano.
              </p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <button onClick={acceptCookies} className="flex-1 md:flex-none px-10 py-5 bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-blue-800 transition-all active:scale-95">Aceptar Todo</button>
              <button onClick={() => setShowCookies(false)} className="flex-1 md:flex-none px-10 py-5 bg-white text-blue-700 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-blue-100">Preferencias</button>
            </div>
          </div>
        </div>
      )}

      <nav className={`fixed w-full z-50 transition-all duration-700 ${scrolled ? 'glass shadow-3xl py-4 mt-6 mx-auto max-w-[90%] left-0 right-0 rounded-[2.5rem] px-10 border border-white/60' : 'bg-transparent py-10'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo className="h-14" />
          
          <div className="hidden lg:flex gap-12 font-black text-[12px] uppercase tracking-[0.2em] text-blue-900/40">
            {['inicio', 'nosotros', 'inversiones', 'academia'].map((item) => (
              <a key={item} href={`#${item}`} onClick={(e) => handleNavClick(e, item)} className="hover:text-blue-700 transition-all relative group">
                {item}
                <span className="absolute -bottom-3 left-0 w-0 h-1.5 bg-blue-600 rounded-full transition-all duration-500 group-hover:w-full shadow-[0_0_10px_#3b82f6]"></span>
              </a>
            ))}
          </div>

          <div className="flex gap-4 items-center">
            <div className="hidden sm:flex items-center gap-3 mr-6 bg-gray-100/50 p-2 rounded-full border border-gray-200 shadow-inner">
              <button onClick={() => setCurrency('MXN')} className={`px-5 py-2 rounded-full text-[11px] font-black transition-all ${currency === 'MXN' ? 'bg-blue-700 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-blue-400'}`}>MXN</button>
              <button onClick={() => setCurrency('USD')} className={`px-5 py-2 rounded-full text-[11px] font-black transition-all ${currency === 'USD' ? 'bg-blue-700 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-blue-400'}`}>USD</button>
            </div>
            
            {!isAuthenticated ? (
              <div className="flex gap-4">
                <button onClick={() => setShowAuth(true)} className="px-8 py-4 text-blue-700 font-black text-xs uppercase tracking-widest hover:text-blue-900 transition-all border-b-2 border-transparent hover:border-blue-700">Login</button>
                <button onClick={() => setShowAuth(true)} className="px-10 py-4 bg-blue-700 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-800 shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-1.5 active:translate-y-0 active:scale-95">Comenzar ➔</button>
              </div>
            ) : (
              <div className="flex items-center gap-5">
                <Link to="/admin" className="w-14 h-14 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center hover:bg-blue-100 transition-all shadow-xl group border border-white/50">
                  <svg className="w-7 h-7 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </Link>
                <button onClick={() => { signOut(); setToast({ visible: true, message: "Cerraste sesión" }) }} className="px-8 py-4 border-2 border-blue-700/20 text-blue-700 rounded-full font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95">Salir</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showAuth && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-2xl" onClick={() => setShowAuth(false)}></div>
          <div className="relative w-full max-w-xl scale-in-center preserve-3d">
             <div className="absolute -top-16 right-0">
               <button onClick={() => setShowAuth(false)} className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl transition-all hover:rotate-90">✕</button>
             </div>
            <SignIn />
          </div>
        </div>
      )}

      <section id="inicio" className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-10 grid lg:grid-cols-2 gap-24 items-center relative z-10">
          <div className="space-y-12 animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-4 px-8 py-4 glass rounded-full text-blue-600 text-[11px] font-black uppercase tracking-[0.4em] shadow-xl animate-float">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600 shadow-[0_0_10px_#3b82f6]"></span>
              </span>
              Consultoría Disruptiva 2024
            </div>

            <div className="flex items-center gap-6 animate-in fade-in duration-1000 delay-500">
               <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-white overflow-hidden shadow-lg">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i*123}`} className="w-full h-full object-cover bg-blue-50" alt="user" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-4 border-white bg-blue-600 flex items-center justify-center text-[10px] text-white font-black shadow-lg">+</div>
               </div>
               <div className="flex flex-col">
                  <span className="text-blue-950 font-black text-sm tracking-tighter leading-none">{interactionCount.toLocaleString()} interacciones</span>
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-1">Analizando inventario en vivo</span>
               </div>
            </div>
            
            <h1 className="text-[5rem] md:text-[10rem] font-black leading-[0.8] text-blue-950 tracking-tighter drop-shadow-2xl">
              Elite <br />
              <span className="text-gradient animate-gradient-x italic">Inmobiliaria.</span>
            </h1>
            
            <p className="text-2xl text-blue-800/40 max-w-xl leading-relaxed font-black border-l-8 border-blue-600 pl-10 py-4 italic">
              Patrimonio, Inteligencia y Redención Financiera en México.
            </p>
            
            <div className="flex flex-wrap gap-8">
               <button
                onClick={() => isAuthenticated ? navigate({ to: '/admin' }) : setShowAuth(true)}
                className="px-12 py-6 bg-blue-700 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-[0_30px_60px_-10px_rgba(37,99,235,0.4)] hover:bg-blue-800 transition-all hover:-translate-y-2 active:translate-y-0 active:scale-95 group relative overflow-hidden"
              >
                <span className="relative z-10">Comenzar Inversión</span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/20 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                <span className="inline-block group-hover:translate-x-3 transition-transform ml-4 relative z-10">➔</span>
              </button>
              <Link to="/academy" className="px-12 py-6 bg-white text-blue-700 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] border-2 border-blue-50 shadow-xl hover:bg-blue-50 transition-all hover:-translate-y-1 flex items-center justify-center">OHB Academy</Link>
            </div>
          </div>

          <div className="relative group animate-in fade-in zoom-in duration-1000 delay-300 perspective-1000">
            <div className="absolute -inset-20 bg-blue-100/30 rounded-full blur-[150px] opacity-60 -z-10 group-hover:opacity-100 transition-opacity duration-[2s]"></div>
            <div 
              className="relative rounded-[5rem] overflow-hidden shadow-[0_80px_150px_-30px_rgba(30,58,138,0.5)] transition-all duration-1000 preserve-3d group-hover:rotate-y-6 group-hover:rotate-x-2"
              style={{ transform: `perspective(2000px) rotateX(${mousePos.y * -0.2}deg) rotateY(${mousePos.x * 0.2}deg)` }}
            >
              <img 
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=90" 
                alt="Luxury Estate" 
                className="w-full h-[750px] object-cover scale-110 group-hover:scale-100 transition-transform duration-[3000ms] ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-transparent to-transparent opacity-90"></div>
              
              <div className="absolute bottom-20 left-16 right-16 text-white space-y-6">
                <div className="flex gap-4">
                  <span className="px-4 py-1.5 glass rounded-full text-[10px] font-black uppercase tracking-widest text-blue-200">Nuevo Ingreso</span>
                  <span className="px-4 py-1.5 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white">Elite Only</span>
                </div>
                <h2 className="text-6xl font-black tracking-tighter leading-none italic">The Glass Mansion</h2>
                <div className="flex justify-between items-center pt-8 border-t border-white/20">
                  <div className="flex gap-10 text-xs font-black uppercase tracking-[0.2em] text-blue-200">
                    <div>1.2k m²</div>
                    <div>Yucatán, MX</div>
                  </div>
                  <div className="text-3xl font-black text-blue-400">$3.8M USD</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-16 top-1/4 p-10 glass rounded-[4rem] shadow-3xl border border-white/60 animate-float shadow-blue-900/10">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-3">Retorno Inv.</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-blue-950 tracking-tighter">+18%</span>
                <span className="text-blue-500 font-black mb-1">↑</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="inversiones" className="py-40 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center mb-32">
            <div className="space-y-8">
              <h2 className="text-blue-600 font-black tracking-[0.4em] uppercase text-xs">Portafolio de Inversión</h2>
              <h3 className="text-6xl font-black text-blue-950 tracking-tighter leading-none">Vehículos de Capital.</h3>
              <p className="text-xl text-blue-800/40 font-bold max-w-md leading-relaxed">
                Estructuramos tu capital con rendimientos reales y gestión profesional de activos en México.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { l: 'Capital Puro', r: '12-16%', d: 'Rendimientos trimestrales por tu efectivo' },
                { l: 'Gestión Rentas', r: '% Mensual', d: 'Administramos tu renta por una comisión' },
                { l: 'Preventas', r: 'Elite', d: 'Acceso exclusivo a desarrollos de alta plusvalía' },
                { l: 'Patrimonial', r: 'Seguro', d: 'Protección legal y fiduciaria de activos' },
              ].map(i => (
                <div key={i.l} className="bg-white p-10 rounded-[3rem] shadow-xl border border-blue-50 hover:-translate-y-3 transition-all duration-500 group">
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">{i.l}</div>
                  <div className="text-3xl font-black text-blue-950 mb-2 group-hover:text-blue-600 transition-colors leading-tight">{i.r}</div>
                  <p className="text-[9px] text-blue-800/30 font-bold uppercase tracking-widest leading-tight">{i.d}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-32 space-y-12">
            <div className="text-center space-y-4">
              <h3 className="text-4xl font-black text-blue-950 tracking-tighter">Mapa de Inventario Exclusivo</h3>
              <p className="text-blue-800/40 font-bold uppercase tracking-[0.2em] text-xs">Ubicaciones estratégicas en el mercado mexicano</p>
            </div>
            {isClient && (
              <Suspense fallback={<div className="w-full h-[600px] bg-gray-100 animate-pulse rounded-[3rem]"></div>}>
                <PropertyMap properties={properties as any} />
              </Suspense>
            )}
          </div>

          <div className="space-y-12">
            <h3 className="text-center font-black text-blue-950 text-2xl uppercase tracking-[0.4em]">Smart Tools OHB</h3>
            <div className="grid lg:grid-cols-3 gap-10">
              <div className="glass p-12 rounded-[4rem] shadow-2xl border border-white/50 space-y-10">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-blue-950 uppercase tracking-widest text-sm">Calculadora Inversión</h4>
                  <span className="text-2xl">📈</span>
                </div>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-blue-400">
                      <span>Capital de Inversión</span>
                      <span>${calcAmount.toLocaleString()}</span>
                    </div>
                    <input type="range" min="50000" max="5000000" step="10000" value={calcAmount} onChange={e => setCalcAmount(Number(e.target.value))} className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-blue-400">
                      <span>Plazo de Retorno</span>
                      <span>{calcTerm} Meses</span>
                    </div>
                    <input type="range" min="3" max="36" step="3" value={calcTerm} onChange={e => setCalcTerm(Number(e.target.value))} className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                  <div className="p-8 bg-blue-950 rounded-[2.5rem] text-center space-y-2 border-b-4 border-blue-600">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Rendimiento Trimestral Est.</p>
                    <p className="text-4xl font-black text-white tracking-tighter">${((calcAmount * 0.14) / 4).toLocaleString()}</p>
                    <p className="text-[9px] text-blue-300/40 font-bold italic">Cálculo basado en tasa anual del 14% con pago cada 90 días.</p>
                  </div>
                </div>
              </div>

              <div className="glass p-12 rounded-[4rem] shadow-2xl border border-white/50 flex flex-col justify-center items-center text-center space-y-8 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-400/10 rounded-full blur-3xl"></div>
                <h4 className="font-black text-blue-950 uppercase tracking-widest text-sm relative z-10">Score Calidad de Vida</h4>
                <div className="w-48 h-48 rounded-full border-[15px] border-blue-50 flex items-center justify-center relative shadow-inner">
                   <div className="text-5xl font-black text-blue-700">92<span className="text-sm">/100</span></div>
                   <div className="absolute inset-0 rounded-full border-[15px] border-blue-600 border-t-transparent animate-spin duration-[3s]"></div>
                </div>
                <p className="text-sm text-blue-800/50 font-bold leading-relaxed px-6">Nuestra IA analiza tráfico, servicios y plusvalía para darte el mejor score de México.</p>
                <button className="w-full py-5 border-2 border-blue-700/20 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all">Analizar mi zona</button>
              </div>

              <div className="bg-gradient-to-br from-blue-700 to-blue-900 p-1 rounded-[4rem] shadow-2xl group">
                <div className="bg-blue-950 h-full w-full rounded-[3.8rem] p-12 flex flex-col">
                  <div className="bg-blue-600 w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-8 shadow-xl group-hover:scale-110 transition-transform">🎓</div>
                  <h4 className="text-3xl font-black text-white tracking-tighter mb-4 leading-none">Aprende a Invertir.</h4>
                  <p className="text-blue-300/50 text-sm font-bold mb-10 leading-relaxed">No necesitas millones para empezar. Accede a los módulos de "Inversión Colectiva" de la Academia OHB.</p>
                  <div className="mt-auto">
                    <button className="w-full py-5 bg-white text-blue-950 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-white/10 transition-all">Ver Módulos</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ChatBot sessionId={sessionId} />

      <a 
        href="https://wa.me/521?text=Hola,%20estoy%20interesado%20en%20las%20inversiones%20de%20OHB" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[200] bg-green-500 text-white w-16 h-16 rounded-full shadow-[0_20px_40px_-10px_rgba(34,197,94,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-bounce"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .081 5.363.079 11.966c0 2.112.553 4.174 1.605 6.023L0 24l6.163-1.617a11.83 11.83 0 005.883 1.554h.005c6.603 0 11.967-5.367 11.97-11.97 0-3.201-1.246-6.212-3.509-8.475z"/></svg>
      </a>

      <footer className="bg-blue-950 text-white pt-40 pb-16 rounded-t-[6rem] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,#1e40af_0%,transparent_50%)] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="grid lg:grid-cols-4 gap-24">
            <div className="space-y-10">
              <Logo className="h-20" variant="full" />
              <div className="space-y-4">
                <p className="text-xl text-blue-300/30 leading-relaxed font-black italic">La digitalización de la confianza.</p>
                <div className="text-[10px] font-bold text-blue-200/50 space-y-2 uppercase tracking-widest">
                  <p>📍 Tomás Fernández #7818, Local 19, Col. Buscari, 32460 Juárez, Chih.</p>
                  <p>📞 656-132-7685</p>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-black text-[12px] uppercase tracking-[0.4em] mb-12 text-blue-500">Inversiones</h5>
              <ul className="space-y-6 text-sm font-black uppercase tracking-widest text-blue-100/60">
                <li><a href="#" className="hover:text-white transition-all inline-block hover:translate-x-3">Propiedades Off-Market</a></li>
                <li><a href="#" className="hover:text-white transition-all inline-block hover:translate-x-3">Consultoría Legal</a></li>
                <li><a href="#" className="hover:text-white transition-all inline-block hover:translate-x-3">Membresía Academy</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-black text-[12px] uppercase tracking-[0.4em] mb-12 text-blue-500">Legal Elite</h5>
              <ul className="space-y-6 text-sm font-black uppercase tracking-widest text-blue-100/60">
                <li><Link to="/legal" className="hover:text-white transition-all inline-block hover:translate-x-3">Protección de Datos</Link></li>
                <li><Link to="/legal" className="hover:text-white transition-all inline-block hover:translate-x-3">Contratos Digitales</Link></li>
              </ul>
            </div>

            <div className="space-y-12">
              <h5 className="font-black text-[12px] uppercase tracking-[0.4em] text-blue-500">Capital Humano</h5>
              <div className="space-y-6">
                <p className="text-xs font-bold text-blue-200/40 uppercase tracking-widest">¿Quieres ser asesor OHB?</p>
                <button className="w-full bg-white text-blue-950 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-50 transition-all active:scale-95">Aplicar ahora</button>
              </div>
            </div>
          </div>
          
          <div className="mt-40 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="text-blue-100/10 text-[10px] font-black uppercase tracking-[0.6em]">© 2024 OHB ASESORÍAS Y CONSULTORÍAS MÉXICO. CERTIFICACIÓN CONOCER.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
