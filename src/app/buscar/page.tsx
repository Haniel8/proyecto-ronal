"use client";

// ╔══════════════════════════════════════════════════════════════╗
// ║  BUSCAR DESTINOS  —  src/app/buscar/page.tsx                ║
// ╠══════════════════════════════════════════════════════════════╣
// ║  ÍNDICE DE ANIMACIONES                                       ║
// ║                                                              ║
// ║  #1  HEADER FADE-IN         → línea ~130                    ║
// ║      Título y subtítulo entran con fade+slide hacia arriba  ║
// ║      al montar la página (200ms delay entre ellos).         ║
// ║                                                              ║
// ║  #2  SIDEBAR SLIDE-IN       → línea ~145                    ║
// ║      El panel de filtros entra desde la izquierda al        ║
// ║      cargar la página.                                       ║
// ║                                                              ║
// ║  #3  RESULT CARDS SCROLL    → línea ~60  (SearchCard)       ║
// ║      Cada card de resultado entra desde abajo en cascada    ║
// ║      al aparecer en el viewport. threshold=0.05 para que    ║
// ║      cargue lo más rápido posible.                          ║
// ║      delay = índice × 55ms                                  ║
// ║                                                              ║
// ║  #4  RESULT CARDS HOVER     → línea ~70  (SearchCard)       ║
// ║      • Card: sube -5px + sombra profunda                    ║
// ║      • Imagen: zoom scale(1.07)                             ║
// ║      • Gradiente: se intensifica                            ║
// ║      • Badge "Ver destino": aparece desde abajo             ║
// ║                                                              ║
// ║  #5  FILTROS PULSE          → línea ~148                    ║
// ║      Los inputs de filtro tienen focus-ring animado         ║
// ║      (focus:ring-2 focus:ring-blue-500 con transition).     ║
// ║                                                              ║
// ║  #6  CONTADOR RESULTADO     → línea ~185                    ║
// ║      El contador "X destinos encontrados" hace fade         ║
// ║      cada vez que cambian los filtros (key en el div).      ║
// ║                                                              ║
// ║  #7  EMPTY STATE BOUNCE     → línea ~230                    ║
// ║      Cuando no hay resultados, el ícono de búsqueda         ║
// ║      hace bounce continuo con keyframe `bounce`.            ║
// ║                                                              ║
// ║  #8  RATING BUTTONS HOVER   → línea ~175                    ║
// ║      Botones de valoración tienen scale al hover.           ║
// ║                                                              ║
// ║  KEYFRAMES (al final):                                       ║
// ║      bounce     → empty state icon  (#7)                    ║
// ║      fadeCount  → contador resultados (#6)                  ║
// ╚══════════════════════════════════════════════════════════════╝

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search, MapPin, Star, SlidersHorizontal, ChevronDown,
} from "lucide-react";
import { destinations } from "@/lib/destinations";
import Navbar from "@/components/Navbar";

const categories   = ["Todas las categorías","Historia","Playa","Cultura","Museos","Experiencias","Aventura"];
const ratingOptions = ["Todas","4+","4.5+","4.8+"];

// ─────────────────────────────────────────────────────────────
// ANIM #3 — Hook useInView (threshold bajo = carga rápida)
// Activa `visible` la primera vez que el elemento aparece
// en el viewport. threshold=0.05 = apenas asoma = dispara.
// ─────────────────────────────────────────────────────────────
function useInView(threshold = 0.05) {
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
// ANIM #3 + #4 — SearchCard
// #3 SCROLL: entra desde abajo al aparecer en viewport.
//    delay = índice × 55ms (cascada rápida).
// #4 HOVER: card sube, imagen zoom, gradiente, badge CTA.
// ─────────────────────────────────────────────────────────────
function SearchCard({ dest, index }: { dest: any; index: number }) {
  const { ref, visible } = useInView(0.05);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      // ANIM #3 — Entrada escalonada desde abajo
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.48s ease ${index * 55}ms, transform 0.48s ease ${index * 55}ms`,
      }}
    >
      <Link href={`/destino/${dest.id}`}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="bg-white rounded-2xl overflow-hidden border border-gray-100 cursor-pointer"
          // ANIM #4a — Card: sube + sombra profunda
          style={{
            boxShadow:  hovered ? "0 16px 40px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.05)",
            transform:  hovered ? "translateY(-5px)" : "translateY(0)",
            transition: "box-shadow 0.3s ease, transform 0.3s ease",
          }}
        >
          <div className="relative h-52 overflow-hidden">
            {/* ANIM #4b — Imagen: zoom al hover */}
            <img src={dest.image} alt={dest.name} className="w-full h-full object-cover"
              style={{ transform: hovered ? "scale(1.07)" : "scale(1)", transition: "transform 0.5s ease" }}
            />
            {/* ANIM #4c — Gradiente: se intensifica al hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
              style={{ opacity: hovered ? 1 : 0.3, transition: "opacity 0.3s ease" }}
            />
            {/* Badge categoría — siempre visible */}
            <span className="absolute top-3 right-3 bg-white text-gray-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
              {dest.category}
            </span>
            {/* ANIM #4d — Badge "Ver destino": aparece desde abajo al hover */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ opacity: hovered ? 1 : 0, transform: hovered ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.25s ease, transform 0.25s ease" }}
            >
              Ver destino →
            </div>
          </div>

          {/* Contenido — DISEÑO ORIGINAL sin cambios */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-gray-900">{dest.name}</h3>
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-semibold text-gray-700">{dest.rating}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
              <MapPin size={14} />{dest.location}
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">{dest.description}</p>
            <div className="flex items-end justify-between">
              <div className="flex gap-2 flex-wrap">
                {dest.tags.map((tag: string) => (
                  <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md font-medium">{tag}</span>
                ))}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Desde</p>
                <p className="text-blue-600 font-bold text-base">{dest.priceLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL DE BÚSQUEDA
// ─────────────────────────────────────────────────────────────
export default function BuscarDestinos() {
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("Todas las categorías");
  const [maxPrice, setMaxPrice] = useState(200000);
  const [rating,   setRating]   = useState("Todas");

  // ANIM #1 — Activa entradas del header al montar
  const [pageReady, setPageReady] = useState(false);
  useEffect(() => { setTimeout(() => setPageReady(true), 60); }, []);

  // ANIM #2 — Sidebar slide-in al montar
  const [sidebarReady, setSidebarReady] = useState(false);
  useEffect(() => { setTimeout(() => setSidebarReady(true), 120); }, []);

  // ANIM #6 — Key cambiante para re-triggerear fade del contador
  const [countKey, setCountKey] = useState(0);

  const filtered = destinations.filter((d) => {
    const matchSearch   = search === "" || d.name.toLowerCase().includes(search.toLowerCase()) || d.location.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "Todas las categorías" || d.category === category || d.tags.includes(category);
    const matchPrice    = d.price <= maxPrice;
    const matchRating   =
      rating === "Todas"  ? true :
      rating === "4+"     ? d.rating >= 4 :
      rating === "4.5+"   ? d.rating >= 4.5 :
      rating === "4.8+"   ? d.rating >= 4.8 : true;
    return matchSearch && matchCategory && matchPrice && matchRating;
  });

  // Cada vez que cambian filtros, re-triggerear contador fade
  useEffect(() => { setCountKey(k => k + 1); }, [search, category, maxPrice, rating]);

  const handleClear = () => {
    setSearch(""); setCategory("Todas las categorías");
    setMaxPrice(200000); setRating("Todas");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      {/* ══════════════════════════════════════
          ANIM #1 — HEADER FADE-IN
          Título entra con delay 100ms,
          subtítulo con delay 250ms.
      ══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        <h1 className="text-3xl font-bold text-gray-900"
          style={{ opacity: pageReady?1:0, transform: pageReady?"translateY(0)":"translateY(18px)", transition:"opacity 0.55s ease 0.1s, transform 0.55s ease 0.1s" }}>
          Buscar Destinos
        </h1>
        <p className="text-gray-500 mt-1"
          style={{ opacity: pageReady?1:0, transform: pageReady?"translateY(0)":"translateY(14px)", transition:"opacity 0.55s ease 0.25s, transform 0.55s ease 0.25s" }}>
          Encuentra tu destino perfecto en Cartagena de Indias
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16 flex gap-6 items-start">

        {/* ══════════════════════════════════════
            ANIM #2 — SIDEBAR SLIDE-IN
            Entra desde la izquierda al cargar.
            ANIM #5 — FILTROS: focus-ring animado
                       en inputs/selects (Tailwind
                       focus:ring-2 + transition).
            ANIM #8 — RATING BUTTONS: hover scale.
        ══════════════════════════════════════ */}
        <aside
          className="w-[300px] flex-shrink-0 bg-white rounded-2xl border border-gray-200 p-6 sticky top-[76px]"
          // ANIM #2 — Slide desde la izquierda
          style={{
            opacity:   sidebarReady ? 1 : 0,
            transform: sidebarReady ? "translateX(0)" : "translateX(-28px)",
            transition:"opacity 0.55s ease 0.15s, transform 0.55s ease 0.15s",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 font-semibold text-gray-800">
              <SlidersHorizontal size={18} />Filtros
            </div>
            <button onClick={handleClear}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
              Limpiar
            </button>
          </div>

          {/* Búsqueda — ANIM #5: focus ring animado */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Destino, zona..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-shadow duration-200"
              />
            </div>
          </div>

          {/* Categoría — ANIM #5: focus ring animado */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
            <div className="relative">
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 transition-shadow duration-200">
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Presupuesto — slider con valor animado */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Presupuesto máximo
            </label>
            <input type="range" min={0} max={200000} step={5000} value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 COP</span>
              {/* El valor cambia suavemente porque el número se actualiza en state */}
              <span className="font-semibold text-blue-600">{maxPrice.toLocaleString("es-CO")} COP</span>
            </div>
          </div>

          {/* Valoración — ANIM #8: hover scale en botones */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Valoración mínima</label>
            <div className="flex gap-2">
              {ratingOptions.map(r => (
                <button key={r} onClick={() => setRating(r)}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    rating === r ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  // ANIM #8 — Scale al hover
                  onMouseEnter={e => { if(rating !== r) (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ══════════════════════════════════════
            RESULTADOS
            ANIM #6 — Contador hace fade al cambiar.
            ANIM #3 + #4 — Cada card en cascada.
            ANIM #7 — Empty state con bounce.
        ══════════════════════════════════════ */}
        <div className="flex-1">

          {/* ANIM #6 — Contador: key cambia → React remonta → fade in */}
          <p key={countKey} className="text-sm text-gray-500 mb-4"
            style={{ animation: "fadeCount 0.4s ease" }}>
            {filtered.length} destino{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* ANIM #3 + #4 — Cards con entrada en cascada y hover */}
            {filtered.map((dest, i) => (
              <SearchCard key={dest.id} dest={dest} index={i} />
            ))}

            {/* ANIM #7 — Empty state: ícono bounce continuo */}
            {filtered.length === 0 && (
              <div className="col-span-2 text-center py-20 text-gray-400">
                <div style={{ animation: "bounce 1.8s ease-in-out infinite", display: "inline-block" }}>
                  <Search size={44} className="mx-auto mb-3 opacity-30" />
                </div>
                <p className="text-lg font-medium">No se encontraron destinos</p>
                <p className="text-sm mt-1">Intenta con otros filtros</p>
                <button onClick={handleClear}
                  className="mt-4 text-blue-600 text-sm font-semibold hover:underline transition-all">
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          KEYFRAMES GLOBALES
          bounce    → ANIM #7 (empty state icon)
          fadeCount → ANIM #6 (contador resultados)
      ══════════════════════════════════════ */}
      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes fadeCount {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
