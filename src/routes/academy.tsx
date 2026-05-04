import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { BookOpen, Award, CheckCircle, ShieldCheck, GraduationCap, Play, Lock, ChevronRight, Zap } from "lucide-react";

export const Route = createFileRoute("/academy")({
  component: AcademyPage,
});

function AcademyPage() {
  const { data: courses } = useSuspenseQuery(convexQuery((api as any).academy.list, {}) as any);
  const enroll = useMutation((api as any).academy.enroll);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const handleEnroll = async (courseId: any) => {
    // Simulación de pasarela de pago (Stripe/PayPal)
    const paymentId = "SIM_" + Math.random().toString(36).substr(2, 9);
    try {
      await enroll({ courseId, paymentId });
      alert("¡Inscripción exitosa! Bienvenido al curso.");
    } catch (e) {
      alert("Inicia sesión para inscribirte.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 font-sans overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-[#d4af37]/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[#d4af37]/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] text-sm font-medium mb-6"
          >
            <GraduationCap className="w-4 h-4" />
            <span>OHB Academy Elite</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-[#d4af37]/60 bg-clip-text text-transparent"
          >
            Formación Estratégica Inmobiliaria
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Domina el mercado de inversiones de alto nivel con nuestra metodología certificada por expertos de OHB Asesorías & Consultorías.
          </motion.p>
        </header>

        {/* Benefits Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {[
            { icon: ShieldCheck, title: "Certificado Oficial", desc: "Obtén validación institucional de OHB al finalizar cada módulo." },
            { icon: Award, title: "Contenido Exclusivo", desc: "Accede a estrategias de inversión que no encontrarás en ningún otro lugar." },
            { icon: Zap, title: "Pago Seguro", desc: "Plataforma de pagos encriptada con acceso instantáneo 24/7." }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#d4af37]/30 transition-all duration-500 group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <item.icon className="w-6 h-6 text-[#d4af37]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </section>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {(courses as any[]).length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
                <p className="text-gray-500 text-lg">Próximamente nuevos cursos disponibles...</p>
              </div>
            ) : (
              (courses as any[]).map((course: any, idx: number) => (
                <motion.div
                  layoutId={course._id}
                  key={course._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative rounded-3xl bg-white/5 border border-white/10 overflow-hidden hover:shadow-[0_0_40px_-10px_rgba(212,175,55,0.15)] transition-all duration-500"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={course.image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt={course.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
                    <div className="absolute top-4 right-4 bg-[#d4af37] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      Academy
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex items-center gap-2 text-[#d4af37] text-xs font-bold uppercase tracking-widest mb-4">
                      <CheckCircle className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-400 text-sm mb-8 line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-white/10">
                      <div>
                        <span className="block text-gray-500 text-xs uppercase font-bold mb-1 tracking-widest">Inversión</span>
                        <span className="text-2xl font-bold">${course.price} <span className="text-sm font-normal text-gray-400">MXN</span></span>
                      </div>
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="p-4 rounded-2xl bg-[#d4af37] text-black hover:bg-white transition-all group-hover:scale-105 duration-300"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Course Detail Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              layoutId={selectedCourse._id}
              className="relative bg-[#0a0a0a] border border-white/10 rounded-[32px] max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-8 right-8 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                <Lock className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="h-full">
                  <img
                    src={selectedCourse.image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80"}
                    className="w-full h-full object-cover rounded-l-[31px]"
                    alt={selectedCourse.title}
                  />
                </div>
                <div className="p-10">
                  <span className="text-[#d4af37] font-bold text-sm tracking-widest uppercase mb-4 block">Detalle del Curso</span>
                  <h2 className="text-4xl font-bold mb-6">{selectedCourse.title}</h2>
                  <p className="text-gray-400 mb-8 leading-relaxed">{selectedCourse.description}</p>
                  
                  <div className="space-y-4 mb-10">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#d4af37]" />
                      Estructura del Programa
                    </h4>
                    {selectedCourse.modules?.map((mod: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] text-sm font-bold">
                          {i + 1}
                        </div>
                        <span className="text-gray-300 font-medium">{mod.title}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleEnroll(selectedCourse._id)}
                    className="w-full py-6 rounded-2xl bg-[#d4af37] text-black font-bold text-lg hover:bg-white transition-all flex items-center justify-center gap-3"
                  >
                    <Play className="w-6 h-6 fill-current" />
                    Adquirir Curso Ahora
                  </button>
                  <p className="mt-4 text-center text-gray-500 text-sm">Pago único • Acceso de por vida • Certificado incluido</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
