import { Link } from '@tanstack/react-router';

export default function Logo({ className = "h-12", variant = "full" }: { className?: string, variant?: "full" | "icon" }) {
  // Usamos el logo oficial compartido. 
  // Nota: Se recomienda al usuario subir el archivo a public/logo-ohb.png para máxima fidelidad.
  // Por ahora usamos el recurso visual para que aparezca en el preview.
  return (
    <Link to="/" className={`flex items-center gap-3 group transition-all hover:opacity-90 ${className}`}>
      <img 
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9u_X_J8v_I-G_L7z5G9j9f-v8mY0y3-eU7w&s" 
        alt="OHB Logo" 
        className="h-full object-contain"
      />
      {variant === "full" && (
        <div className="flex flex-col justify-center border-l border-gray-200 pl-3 ml-1 hidden sm:flex">
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-blue-900/40 leading-none mb-1">HQ Terminal</span>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none italic">Elite Real Estate</span>
        </div>
      )}
    </Link>
  );
}
