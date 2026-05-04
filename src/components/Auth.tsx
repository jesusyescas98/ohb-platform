import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function SignIn() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn("password", { email, password, flow: mode });
    } catch (error) {
      console.error(error);
      alert("Error al iniciar sesión. Por favor verifica tus credenciales.");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-8 bg-white rounded-2xl shadow-xl border border-blue-100 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-blue-900 text-center">
        {mode === "signIn" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
      </h2>
      
      <button
        onClick={() => signIn("google")}
        className="flex items-center justify-center gap-3 w-full py-3 border-2 border-blue-100 rounded-xl hover:bg-blue-50 transition-all font-semibold text-blue-900"
      >
        <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
        Continuar con Google
      </button>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-blue-100"></div>
        <span className="flex-shrink mx-4 text-blue-300 text-sm font-medium">O con email</span>
        <div className="flex-grow border-t border-blue-100"></div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />
        <button
          type="submit"
          className="w-full py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          {mode === "signIn" ? "Iniciar Sesión" : "Registrarse"}
        </button>
      </form>

      <p className="text-center text-sm text-blue-600">
        {mode === "signIn" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
        <button
          onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
          className="font-bold hover:underline"
        >
          {mode === "signIn" ? "Regístrate" : "Inicia Sesión"}
        </button>
      </p>
    </div>
  );
}
