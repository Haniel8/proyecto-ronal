"use client";

// ╔══════════════════════════════════════════════════════════════╗
// ║  HOME PAGE  —  src/app/page.tsx                             ║
// ╠══════════════════════════════════════════════════════════════╣
// ║  ÍNDICE DE ANIMACIONES                                       ║
// ║                                                              ║
// ║  #1  PARALLAX HERO          → línea ~150                    ║
// ║      El fondo se mueve 30% más lento que el scroll.         ║
// ║                                                              ║
// ║  #2  ENTRADA HERO           → línea ~165                    ║
// ║      Badge, título, subtítulo y botones entran con          ║
// ║      fade+slide escalonado (delay: 200 → 800ms).            ║
// ║                                                              ║
// ║  #3  PARTÍCULAS HERO        → línea ~158                    ║
// ║      Círculos flotantes con keyframe `float`.               ║
// ║                                                              ║
// ║  #4  BOUNCE SCROLL ARROW    → línea ~212                    ║
// ║      Flecha inferior rebota con keyframe `bounce`.          ║
// ║                                                              ║
// ║  #5  FADEIN ON SCROLL       → línea ~60  (hook+componente)  ║
// ║      Cualquier sección envuelta en <FadeIn> entra suave     ║
// ║      al viewport. Dirección: "up" | "left" | "right".       ║
// ║                                                              ║
// ║  #6  STATS ESCALONADO       → línea ~235                    ║
// ║      Cada stat entra con FadeIn + delay 100ms×índice.       ║
// ║                                                              ║
// ║  #7  CATEGORY PILLS HOVER   → línea ~260                    ║
// ║      Píldoras con color sólido real.                         ║
// ║      Hover: scale(1.08) + sombra via onMouseEnter/Leave.    ║
// ║      Delay de entrada escalonado por índice.                 ║
// ║                                                              ║
// ║  #8  DEST CARDS SCROLL      → línea ~100 (DestCard)         ║
// ║      Cards aparecen desde abajo en cascada al hacer         ║
// ║      scroll. threshold bajo (0.05) = carga MÁS RÁPIDO.     ║
// ║                                                              ║
// ║  #9  DEST CARDS HOVER       → línea ~110 (DestCard)         ║
// ║      • Card: sube + scale + sombra profunda                 ║
// ║      • Imagen: zoom scale(1.08)                             ║
// ║      • Gradiente: se intensifica                            ║
// ║      • Badge rating: aparece desde abajo                    ║
// ║      • Botón CTA: aparece desde abajo                       ║
// ║                                                              ║
// ║  #10 FEATURE CARDS HOVER    → línea ~400 (FeatureCard)      ║
// ║      • Card: sube + sombra                                  ║
// ║      • Ícono: rotate(-5deg) + scale(1.15)                   ║
// ║                                                              ║
// ║  #11 CTA BANNER             → línea ~340                    ║
// ║      Entra con FadeIn. Botón hover: scale + shadow.         ║
// ║                                                              ║
// ║  KEYFRAMES (línea ~370):                                    ║
// ║      float  → partículas hero   (#3)                        ║
// ║      bounce → flecha scroll     (#4)                        ║
// ╚══════════════════════════════════════════════════════════════╝

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search, MapPin, Star, TrendingUp, Sparkles,
  DollarSign, ArrowRight, Wind, Waves, Mountain,
  ChevronDown, Umbrella, Camera,
} from "lucide-react";
import { destinations } from "@/lib/destinations";
import Navbar from "@/components/Navbar";

// ─────────────────────────────────────────────────────────────
// ANIMACIÓN #5 — Hook useInView
// Observa si un elemento está en pantalla y activa `visible`.
// threshold: fracción del elemento que debe ser visible.
// Se desconecta tras la primera activación (fire-once).
// ─────────────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─────────────────────────────────────────────────────────────
// ANIMACIÓN #5 — Componente FadeIn
// Wrapper que anima su contenido al entrar al viewport.
// Props:
//   delay     → retraso en ms antes de iniciar la transición
//   direction → "up" | "left" | "right" | "none"
//   className → clases adicionales para el div wrapper
// ─────────────────────────────────────────────────────────────
function FadeIn({
  children, delay = 0, direction = "up", className = "",
}: {
  children: React.ReactNode; delay?: number;
  direction?: "up" | "left" | "right" | "none"; className?: string;
}) {
  const { ref, visible } = useInView();
  const from =
    direction === "up"    ? "translateY(36px)" :
    direction === "left"  ? "translateX(-36px)" :
    direction === "right" ? "translateX(36px)"  : "none";
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translate(0,0)" : from,
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ── Datos estáticos ───────────────────────────────────────────
const features = [
  { icon: <Sparkles size={28} className="text-blue-600" />,   bg: "bg-blue-100",   border: "border-blue-200",   title: "IA Personalizada",    description: "Recomendaciones inteligentes basadas en tus preferencias y tu historial de viajes." },
  { icon: <MapPin   size={28} className="text-emerald-600" />, bg: "bg-emerald-100",border: "border-emerald-200",title: "Información Detallada",description: "Datos completos de cada destino, restaurantes, actividades y experiencias únicas." },
  { icon: <DollarSign size={28} className="text-amber-600" />, bg: "bg-amber-100",  border: "border-amber-200",  title: "Mejor Precio",        description: "Alertas automáticas cuando los precios bajan en tus destinos favoritos." },
];

const stats = [
  { value: "10+",  label: "Destinos en Cartagena", icon: <MapPin   size={20} className="text-blue-400"   /> },
  { value: "4.8★", label: "Calificación promedio",  icon: <Star     size={20} className="text-yellow-400" /> },
  { value: "100%", label: "Rutas verificadas",       icon: <Wind     size={20} className="text-emerald-400"/> },
  { value: "24/7", label: "Soporte al viajero",      icon: <Waves    size={20} className="text-purple-400" /> },
];

// ANIMACIÓN #7 — Categorías con color sólido real (sin CSS vars)
const categories = [
  { label: "Playas",       icon: <Umbrella size={14} />, bg: "#0891b2" },
  { label: "Historia",     icon: <Mountain size={14} />, bg: "#d97706" },
  { label: "Cultura",      icon: <Sparkles size={14} />, bg: "#7c3aed" },
  { label: "Museos",       icon: <Camera   size={14} />, bg: "#dc2626" },
  
];

// ─────────────────────────────────────────────────────────────
// ANIMACIÓN #8 + #9 — DestCard
//
// #8 SCROLL: entra desde abajo al hacer scroll.
//    threshold=0.05 → se activa cuando apenas asoma el card,
//    así carga MUCHO MÁS RÁPIDO que antes (era 0.1).
//    delay = índice × 60ms (antes 80ms, ahora más rápido).
//
// #9 HOVER: 5 efectos simultáneos al pasar el cursor:
//    a) Card sube -6px + scale(1.01) + sombra profunda
//    b) Imagen zoom scale(1.08)
//    c) Gradiente de la imagen se intensifica
//    d) Badge de rating aparece desde abajo (translateY)
//    e) Botón "Ver destino" aparece desde abajo
// ─────────────────────────────────────────────────────────────
function DestCard({ dest, index }: { dest: any; index: number }) {
  // threshold muy bajo = el card se activa apenas aparece en pantalla
  const { ref, visible } = useInView(0.05);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      // ANIM #8 — Entrada en cascada: delay = índice × 60ms
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(44px)",
        transition: `opacity 0.5s ease ${index * 60}ms, transform 0.5s ease ${index * 60}ms`,
      }}
    >
      <Link href={`/destino/${dest.id}`}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="bg-white rounded-2xl overflow-hidden border border-gray-100 cursor-pointer"
          // ANIM #9a — Card: sube + scale + sombra
          style={{
            boxShadow: hovered ? "0 20px 45px rgba(0,0,0,0.13)" : "0 2px 8px rgba(0,0,0,0.05)",
            transform:  hovered ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
            transition: "box-shadow 0.32s ease, transform 0.32s ease",
          }}
        >
          <div className="relative h-52 overflow-hidden">
            {/* ANIM #9b — Imagen: zoom al hover */}
            <img src={dest.image} alt={dest.name} className="w-full h-full object-cover"
              style={{ transform: hovered ? "scale(1.08)" : "scale(1)", transition: "transform 0.55s ease" }}
            />
            {/* ANIM #9c — Gradiente: se intensifica al hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"
              style={{ opacity: hovered ? 1 : 0.35, transition: "opacity 0.35s ease" }}
            />
            {/* Badge categoría — siempre visible */}
            <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
              {dest.category}
            </span>
            {/* ANIM #9d — Badge rating: aparece desde abajo al hover */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ opacity: hovered ? 1 : 0, transform: hovered ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.28s ease, transform 0.28s ease" }}
            >
              <Star size={11} className="text-yellow-400 fill-yellow-400" />
              {dest.rating} · {dest.location.split(",")[0]}
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-base font-bold text-gray-900 leading-snug">{dest.name}</h3>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-semibold text-gray-700">{dest.rating}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
              <MapPin size={12} />{dest.location}
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{dest.description}</p>
            <div className="flex items-end justify-between">
              <div className="flex gap-1.5 flex-wrap">
                {dest.tags.slice(0, 2).map((tag: string) => (
                  <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md font-medium">{tag}</span>
                ))}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Desde</p>
                <p className="text-blue-600 font-bold text-sm">{dest.priceLabel}</p>
              </div>
            </div>
            {/* ANIM #9e — Botón CTA: aparece desde abajo al hover */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-blue-600 text-xs font-semibold py-2 rounded-xl border border-blue-100 bg-blue-50"
              style={{ opacity: hovered ? 1 : 0, transform: hovered ? "translateY(0)" : "translateY(5px)", transition: "opacity 0.28s ease 0.04s, transform 0.28s ease 0.04s" }}
            >
              Ver destino <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ANIMACIÓN #10 — FeatureCard
// Hover: card sube, ícono rota y hace scale, sombra profunda.
// ─────────────────────────────────────────────────────────────
function FeatureCard({ feat }: { feat: any }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`bg-white rounded-2xl p-8 text-center border ${feat.border} cursor-default`}
      style={{
        boxShadow:  hovered ? "0 16px 40px rgba(0,0,0,0.10)" : "0 2px 8px rgba(0,0,0,0.04)",
        transform:  hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "box-shadow 0.32s ease, transform 0.32s ease",
      }}
    >
      {/* ANIM #10 — Ícono: rota y hace scale al hover */}
      <div className={`inline-flex items-center justify-center w-16 h-16 ${feat.bg} rounded-2xl mb-5`}
        style={{ transform: hovered ? "scale(1.15) rotate(-5deg)" : "scale(1) rotate(0deg)", transition: "transform 0.38s ease" }}
      >
        {feat.icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-3">{feat.title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{feat.description}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function Home() {
  // ANIM #2 — Activa entradas del hero tras montar el componente
  const [heroReady, setHeroReady] = useState(false);
  useEffect(() => { setTimeout(() => setHeroReady(true), 80); }, []);

  // ANIM #1 — Parallax: trackea el scroll para mover el fondo
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden">
      <Navbar />

      {/* ══════════════════════════════════════
          HERO
          Animaciones: #1 Parallax, #2 Entrada,
                       #3 Partículas, #4 Bounce
      ══════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center overflow-hidden">

        {/* ANIM #1 — Parallax: translateY al 30% del scroll */}
        <div className="absolute inset-0 z-0" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
          <img
              src="https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=1400&q=80"
              className= "w-full h-full object-cover object-[55%_center]"
            />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 via-blue-800/60 to-gray-900/80" />
        </div>

        {/* ANIM #3 — Partículas flotantes (keyframe `float` al final) */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white/10 blur-sm pointer-events-none"
            style={{ width: `${55+i*28}px`, height: `${55+i*28}px`, left: `${8+i*15}%`, top: `${12+(i%3)*22}%`,
              animation: `float ${4+i}s ease-in-out infinite alternate`, animationDelay: `${i*0.4}s` }}
          />
        ))}

        {/* ANIM #2 — Contenido con entradas escalonadas */}
        <div className="relative z-10 px-6 max-w-4xl mx-auto">

          {/* Badge — delay 200ms */}
          <div style={{ opacity: heroReady?1:0, transform: heroReady?"translateY(0)":"translateY(24px)", transition:"opacity 0.9s ease 0.2s,transform 0.9s ease 0.2s" }}>
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-5 py-2 rounded-full mb-6 border border-white/30">
            Cartagena de Indias, Colombia
            </span>
          </div>

          {/* Título — delay 400ms */}
          <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-none tracking-tight"
            style={{ opacity: heroReady?1:0, transform: heroReady?"translateY(0)":"translateY(36px)", transition:"opacity 0.9s ease 0.4s,transform 0.9s ease 0.4s" }}>
            Descubre la <br />
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Ciudad Heroica</span>
          </h1>

          {/* Subtítulo — delay 600ms */}
          <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ opacity: heroReady?1:0, transform: heroReady?"translateY(0)":"translateY(36px)", transition:"opacity 0.9s ease 0.6s,transform 0.9s ease 0.6s" }}>
            Playas paradisíacas, murallas coloniales y cultura caribeña.<br />
            Tu próxima aventura empieza aquí.
          </p>

          {/* Botones — delay 800ms */}
          <div className="flex items-center justify-center gap-4 flex-wrap"
            style={{ opacity: heroReady?1:0, transform: heroReady?"translateY(0)":"translateY(36px)", transition:"opacity 0.9s ease 0.8s,transform 0.9s ease 0.8s" }}>
            <Link href="/buscar">
              <button className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-8 py-4 rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 text-base">
                <Search size={18} />Explorar destinos
              </button>
            </Link>


            <button
                onClick={() => {
                  const section = document.getElementById("destinos");
                  section?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-2xl border border-white/30 hover:bg-white/25 transition-all duration-300 text-base"
              >
                Ver todo
            </button>


          </div>
        </div>

        {/* ANIM #4 — Flecha bounce continuo (keyframe `bounce` al final) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
          style={{ opacity: heroReady?1:0, transition:"opacity 1s ease 1.2s", animation:"bounce 2s ease-in-out infinite" }}>
          <span className="text-white/60 text-xs font-medium object-center">Descubrir más</span>
          <ChevronDown size={20} className="text-white/60" />
        </div>
      </section>

      {/* ══════════════════════════════════════
          ANIM #5 + #6 — STATS BAR
          Cada stat entra con FadeIn escalonado
      ══════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <FadeIn key={i} delay={i * 100} direction="up">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">{s.icon}</div>
                  <div>
                    <p className="text-xl font-black text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          ANIM #7 — CATEGORY PILLS
          Corrección: color sólido con backgroundColor (no CSS vars).
          Hover: scale + shadow via onMouseEnter/Leave inline.
          Delay de entrada escalonado por índice (40ms × i).
      ══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-2">
        <FadeIn direction="up">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-400 mr-1">Explorar por:</span>
            {categories.map((cat, i) => (
              <Link href="/buscar" key={i}>
                <button
                  className="inline-flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm"
                  style={{
                    backgroundColor: cat.bg,
                    // Transición con delay escalonado para la entrada
                    transitionDelay: `${i * 40}ms`,
                    transitionProperty: "transform, box-shadow",
                    transitionDuration: "200ms",
                    transitionTimingFunction: "ease",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "scale(1.08) translateY(-2px)";
                    el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.22)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "scale(1) translateY(0)";
                    el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.1)";
                  }}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              </Link>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ══════════════════════════════════════
          ANIM #5 + #8 + #9 — DESTINOS POPULARES
          Título entra desde la izquierda.
          Cards entran en cascada al hacer scroll.
      ══════════════════════════════════════ */}
      <section  id="destinos" className="max-w-7xl mx-auto px-6 py-8">
        <FadeIn direction="left">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <TrendingUp size={28} className="text-orange-500" />
                Destinos Populares
              </h2>
              <p className="text-gray-400 text-sm mt-1">Los mejores lugares para visitar en Cartagena</p>
            </div>
            <Link href="/buscar">
              <button className="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-sm hover:gap-3 transition-all duration-200">
                Ver todos <ArrowRight size={15} />
              </button>
            </Link>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest, i) => (
            <DestCard key={dest.id} dest={dest} index={i} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          ANIM #5 + #10 — FEATURES
          Título entra desde abajo.
          Cards con delay escalonado + hover (FeatureCard).
      ══════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn direction="up" className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">¿Por qué elegirnos?</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Planifica tu viaje a Cartagena con las mejores herramientas del mercado</p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <FadeIn key={i} delay={i * 150} direction="up">
                <FeatureCard feat={feat} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          ANIM #5 + #11 — CTA BANNER
          Entra desde abajo con FadeIn.
          Botón con hover scale + shadow.
      ══════════════════════════════════════ */}
      <FadeIn direction="up">
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="relative rounded-3xl overflow-hidden min-h-[200px]">
            <img src={destinations[0].image} alt="CTA" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-700/70" />
            <div className="relative z-10 p-12 flex items-center justify-between flex-wrap gap-6">
              <div>
                <h3 className="text-3xl font-black text-white mb-2">¿Listo para tu aventura?</h3>
                <p className="text-blue-200 text-lg">Reserva hoy y vive Cartagena como nunca antes.</p>
              </div>
              <Link href="/buscar">
                <button className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-8 py-4 rounded-2xl hover:scale-105 hover:shadow-2xl transition-all duration-300 text-base flex-shrink-0">
                  <Search size={18} />Comenzar ahora
                </button>
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-white pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">N</div>
                <span className="font-bold text-lg">New Tourism</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">Tu plataforma inteligente para descubrir y reservar los mejores destinos turísticos de Cartagena de Indias.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-100">Empresa</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                {["Sobre nosotros","Carreras","Blog"].map(t=><li key={t}><a href="#" className="hover:text-white transition-colors">{t}</a></li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-100">Soporte</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                {["Centro de ayuda","Términos","Privacidad"].map(t=><li key={t}><a href="#" className="hover:text-white transition-colors">{t}</a></li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-100">Contacto</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>📧 hola@newtourism.co</li>
                <li>📞 +57 300 000 0000</li>
                <li>📍 Cartagena, Colombia</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex items-center justify-between text-xs text-gray-500 flex-wrap gap-2">
            <p>© 2026 New Tourism. Todos los derechos reservados.</p>
            <p>Hecho con ❤️ para Cartagena de Indias 🇨🇴</p>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════
          KEYFRAMES GLOBALES
          float  → ANIM #3 (partículas hero)
          bounce → ANIM #4 (flecha scroll)
      ══════════════════════════════════════ */}
      <style jsx global>{`
        @keyframes float {
          from { transform: translateY(0px) scale(1); }
          to   { transform: translateY(-18px) scale(1.04); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50%       { transform: translateX(-50%) translateY(9px); }
        }
      `}</style>
    </div>
  );
}
