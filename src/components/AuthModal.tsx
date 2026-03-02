"use client";

import { useState } from "react";
import { X, Mail, Lock, User, Eye, EyeOff, Globe, ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";

export default function AuthModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { login, register } = useApp();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "facebook" | null>(null);
  const [error, setError] = useState("");

  // ─── Email / Password ─────────────────────────────────────
  const handleSubmit = async () => {
    setError("");
    if (mode === "login") {
      if (!email || !password) { setError("Completa todos los campos."); return; }
    } else {
      if (!name || !email || !password) { setError("Completa todos los campos."); return; }
      if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    }

    setLoading(true);
    const result = mode === "login"
      ? await login(email, password)
      : await register(name, email, password);
    setLoading(false);

    if (result.error) { setError(result.error); return; }
    onClose();
    onSuccess?.();
  };

  // ─── OAuth Google / Facebook ──────────────────────────────
  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setError("");
    setSocialLoading(provider);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: provider === "google"
          ? { access_type: "offline", prompt: "consent" }
          : {},
      },
    });

    if (error) {
      setError(`Error al conectar con ${provider === "google" ? "Google" : "Facebook"}.`);
      setSocialLoading(null);
    }
    // Si no hay error Supabase redirige automáticamente al proveedor OAuth
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — mismo diseño original */}
      <div className="relative w-full max-w-[880px] bg-white rounded-3xl overflow-hidden shadow-2xl flex min-h-[520px]">

        {/* LEFT — imagen + branding */}
        <div className="hidden md:flex flex-col w-[42%] relative bg-blue-600 p-10 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
            alt="Travel"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700/90 to-blue-500/80" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-auto">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Globe size={20} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg italic">New Tourism</span>
            </div>
            <div className="mt-auto">
              <h2 className="text-3xl font-bold text-white leading-tight mb-3">
                {mode === "login" ? "Bienvenido de vuelta ✈️" : "Empieza tu aventura 🌍"}
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                {mode === "login"
                  ? "Accede a tus reservas, historial de viajes y recomendaciones personalizadas."
                  : "Crea tu cuenta y accede a destinos increíbles con precios exclusivos."}
              </p>
              <div className="flex gap-6 mt-6">
                {[["10+", "Destinos"], ["4.9★", "Valoración"], ["24/7", "Soporte"]].map(([val, label]) => (
                  <div key={label}>
                    <p className="text-white font-bold text-lg">{val}</p>
                    <p className="text-blue-200 text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="flex-1 flex flex-col p-8 md:p-10">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="mb-7">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </h3>
            <p className="text-sm text-gray-500">
              {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
              <button
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                className="text-blue-600 font-semibold hover:underline"
              >
                {mode === "login" ? "Regístrate gratis" : "Inicia sesión"}
              </button>
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-3 flex-1">
            {mode === "register" && (
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all"
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {mode === "login" && (
              <div className="text-right">
                <button className="text-xs text-blue-600 hover:underline font-medium">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-2.5 rounded-xl">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading || !!socialLoading}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-2xl transition-all text-sm shadow-sm shadow-blue-200"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Entrar a mi cuenta" : "Crear cuenta"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">o continúa con</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Botones sociales */}
            <div className="flex gap-3">
              {/* Google */}
              <button
                onClick={() => handleSocialLogin("google")}
                disabled={loading || !!socialLoading}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 disabled:opacity-60 text-gray-600 text-sm font-medium py-2.5 rounded-2xl transition-colors"
              >
                {socialLoading === "google" ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Google
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleSocialLogin("facebook")}
                disabled={loading || !!socialLoading}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 disabled:opacity-60 text-gray-600 text-sm font-medium py-2.5 rounded-2xl transition-colors"
              >
                {socialLoading === "facebook" ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )}
                Facebook
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-400 text-center mt-5">
            Al continuar aceptas nuestros{" "}
            <span className="underline cursor-pointer hover:text-gray-600">Términos de servicio</span>{" "}
            y{" "}
            <span className="underline cursor-pointer hover:text-gray-600">Política de privacidad</span>
          </p>
        </div>
      </div>
    </div>
  );
}
