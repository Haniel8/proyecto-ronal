"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin, Star, ArrowLeft, Share2, Heart, CheckCircle,
  Utensils, X, ChevronLeft, ChevronRight,
  Calendar, Users, Clock, ShoppingCart, Loader2,
  MessageSquare, Camera, Send, Pause, Play,
} from "lucide-react";
import { destinations } from "@/lib/destinations";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/ToastProvider";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import DestinationMap from "@/components/DestinationMap";

type Review = {
  id: string; userName: string; rating: number;
  comment: string; date: string; photos: string[];
};

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS   = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const tabs   = ["Descripción","Restaurantes","Características","Reseñas","Mapa"];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}
function addDays(year: number, month: number, day: number, n: number) {
  const d = new Date(year, month, day + n);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day:"numeric", month:"long", year:"numeric" });
}
function useNearbyRestaurants(lat: number, lng: number) {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  useEffect(() => {
    const run = async () => {
      setLoading(true); setError(false);
      try {
        const q = `[out:json][timeout:10];node["amenity"="restaurant"](around:1500,${lat},${lng});out 6;`;
        const res  = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`);
        const data = await res.json();
        setRestaurants((data.elements||[]).filter((el:any)=>el.tags?.name).slice(0,6));
      } catch { setError(true); }
      finally { setLoading(false); }
    };
    run();
  }, [lat, lng]);
  return { restaurants, loading, error };
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button key={i} onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(0)} onClick={()=>onChange(i)}>
          <Star size={26} className={`${i<=(hovered||value)?"text-yellow-400 fill-yellow-400":"text-gray-300"} transition-colors`}/>
        </button>
      ))}
    </div>
  );
}

// ─── Beautiful Carousel with Lightbox ─────────────────────────────────────
function SplitCarousel({ images, name }: { images: string[]; name: string }) {
  const [current, setCurrent]   = useState(0);
  const [setPaused]     = useState(false);
  const [lightbox, setLightbox] = useState<string|null>(null);
  const timerRef = useRef<NodeJS.Timeout|null>(null);

  const next = useCallback(()=>setCurrent(c=>(c+1)%images.length),[images.length]);
  const prev = useCallback(()=>setCurrent(c=>(c-1+images.length)%images.length),[images.length]);

 useEffect(()=>{
  if(lightbox) return;
  timerRef.current = setInterval(next, 3500);
  return ()=>{ if(timerRef.current) clearInterval(timerRef.current); };
},[next,lightbox]);

  // keyboard nav for lightbox
  useEffect(()=>{
    if(!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if(e.key==="Escape") setLightbox(null);
      if(e.key==="ArrowRight"){ next(); setLightbox(images[(current+1)%images.length]); }
      if(e.key==="ArrowLeft"){ prev(); setLightbox(images[(current-1+images.length)%images.length]); }
    };
    window.addEventListener("keydown", handler);
    return ()=>window.removeEventListener("keydown", handler);
  },[lightbox, current, images, next, prev]);

  return (
    <>
      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
          onClick={()=>setLightbox(null)}>
          {/* Close */}
          <button className="absolute top-5 right-5 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors z-10">
            <X size={20}/>
          </button>
          {/* Nav arrows */}
          <button className="absolute left-5 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors z-10"
            onClick={e=>{e.stopPropagation(); prev(); setLightbox(images[(current-1+images.length)%images.length]);}}>
            <ChevronLeft size={22}/>
          </button>
          <button className="absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors z-10"
            onClick={e=>{e.stopPropagation(); next(); setLightbox(images[(current+1)%images.length]);}}>
            <ChevronRight size={22}/>
          </button>
          {/* Counter */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
            {current+1} / {images.length}
          </div>
          <img src={lightbox} alt="Imagen ampliada"
            className="max-w-[92vw] max-h-[88vh] object-contain rounded-2xl shadow-2xl"
            onClick={e=>e.stopPropagation()}/>
        </div>
      )}

      {/* ── Main carousel ── */}
      <div className="w-full select-none">
        <div className="relative rounded-2xl overflow-hidden group shadow-xl bg-gray-900" style={{height:310}}>

            {/* Full width image */}
          <div className="absolute inset-0 cursor-zoom-in" onClick={()=>setLightbox(images[current])}>
            {images.map((img,i)=>(
              <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i===current?"opacity-100":"opacity-0"}`}>
                <img src={img} alt={`${name} ${i+1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"/>
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none"/>
            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg
              opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1.5">
              Clic para ampliar
            </div>
          </div>

          {/* Left arrow */}
          <button onClick={e=>{e.stopPropagation(); prev();}}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200">
            <ChevronLeft size={18}/>
          </button>

          {/* Right arrow */}
          <button onClick={e=>{e.stopPropagation(); next();}}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200">
            <ChevronRight size={18}/>
          </button>

          {/* Counter top-right */}
          <div className="absolute top-3 right-3 z-20">
            <span className="bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {current+1}/{images.length}
            </span>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center items-center gap-1.5 mt-3">
          {images.map((_,i)=>(
            <button key={i} onClick={()=>{setCurrent(i); }}
              className={`transition-all duration-300 rounded-full ${i===current?"w-6 h-2 bg-blue-600":"w-2 h-2 bg-gray-300 hover:bg-gray-500"}`}/>
          ))}
        </div>

        {/* Thumbnail strip */}
        <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((img,i)=>(
            <button key={i} onClick={()=>{setCurrent(i);}}
              className={`flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 ${i===current?"border-blue-600 shadow-md scale-105":"border-transparent opacity-55 hover:opacity-90 hover:scale-105"}`}
              style={{width:52,height:38}}>
              <img src={img} alt="" className="w-full h-full object-cover"/>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Booking Modal ──────────────────────────────────────────────────────────
function BookingModal({ destination, onClose }: { destination: any; onClose: ()=>void }) {
  const { isLoggedIn, addReservation } = useApp();
  const toast = useToast();
  const today = new Date();
  const [year, setYear]               = useState(today.getFullYear());
  const [month, setMonth]             = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number|null>(null);
  const [people, setPeople]           = useState(1);
  const [step, setStep]               = useState<"calendar"|"availability"|"summary"|"needAuth">("calendar");

  const days = getCalendarDays(year, month);
  const prevM = ()=>{ if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); setSelectedDay(null); };
  const nextM = ()=>{ if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); setSelectedDay(null); };
  const isPast = (d:number)=>{ const dt=new Date(year,month,d); const t=new Date(); t.setHours(0,0,0,0); return dt<t; };

  const dateStr    = selectedDay?`${selectedDay} de ${MONTHS[month]} de ${year}`:"";
  const checkOut   = selectedDay?addDays(year,month,selectedDay,7):"";
  const total      = destination.price*people;
  const cur        = destination.priceLabel.split(" ").pop();
  const totalLabel = `${total.toLocaleString("es-CO")} ${cur}`;

  const handleReserve = () => {
    if(!isLoggedIn){ setStep("needAuth"); return; }
    addReservation({ destinationId:destination.id, destinationName:destination.name, destinationLocation:destination.location, destinationImage:destination.image, date:dateStr, checkOut, people, totalPrice:total, totalPriceLabel:totalLabel, status:"Confirmada" });
    toast.success("¡Reserva confirmada! 🎉",`${destination.name} — ${dateStr}`);
    setStep("summary");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">{destination.name}</h2>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin size={11}/>{destination.location}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>
        <div className="p-5">
          {step==="needAuth"&&(<div className="text-center py-4">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4"><Calendar size={26} className="text-blue-600"/></div>
            <h3 className="text-lg font-bold mb-2">Inicia sesión para reservar</h3>
            <p className="text-sm text-gray-500 mb-5">Necesitas una cuenta para guardar tu reserva.</p>
            <div className="flex gap-3">
              <button onClick={()=>setStep("availability")} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm">Volver</button>
              <button onClick={onClose} className="flex-1 bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm">Iniciar sesión</button>
            </div>
          </div>)}





          {step==="calendar"&&(<>
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Calendar size={16} className="text-blue-500"/>Selecciona la fecha</p>
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevM} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronLeft size={18}/></button>
              <span className="text-sm font-bold">{MONTHS[month]} {year}</span>
              <button onClick={nextM} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronRight size={18}/></button>
            </div>
            <div className="grid grid-cols-7 mb-1">{DAYS.map(d=><div key={d} className="text-center text-xs text-gray-400 font-semibold py-1">{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-0.5">
              {days.map((day,i)=>{
                if(!day) return <div key={i}/>;
                const past=isPast(day),sel=selectedDay===day;
                return <button key={i} disabled={past} onClick={()=>setSelectedDay(day)}
                  className={`aspect-square flex items-center justify-center text-sm rounded-xl font-medium transition-colors ${past?"text-gray-300 cursor-not-allowed":"hover:bg-blue-50 text-gray-700"} ${sel?"bg-blue-600 text-white":""}`}>{day}</button>;
              })}
            </div>
            <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <span className="text-sm font-semibold flex items-center gap-2"><Users size={16} className="text-blue-500"/>Personas</span>
              <div className="flex items-center gap-3">
                <button onClick={()=>setPeople(p=>Math.max(1,p-1))} className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold">-</button>
                <span className="text-sm font-bold w-4 text-center text-black">{people}</span>
                <button onClick={()=>setPeople(p=>Math.min(10,p+1))} className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">+</button>
              </div>
            </div>
            <button onClick={()=>selectedDay&&setStep("availability")} disabled={!selectedDay}
              className={`w-full mt-4 py-3 rounded-xl font-semibold text-sm ${selectedDay?"bg-blue-600 hover:bg-blue-700 text-white":"bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
              Verificar disponibilidad
            </button>
          </>)}
          
          {step==="availability"&&(<>
            <button onClick={()=>setStep("calendar")} className="flex items-center gap-1 text-sm text-gray-500 mb-4"><ChevronLeft size={15}/>Cambiar fecha</button>
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 mb-4">
              <CheckCircle size={18} className="text-green-500"/>
              <div><p className="text-sm font-bold text-green-700">¡Disponible!</p><p className="text-xs text-green-600">{dateStr}</p></div>
            </div>
            <div className="border border-blue-200 rounded-xl p-4 mb-4 text-sm text-gray-600 space-y-2">
              <p className="flex items-center gap-2"><Clock size={14} className="text-gray-400"/>Hora de inicio: 8:00 AM</p>
              <p className="flex items-center gap-2"><Users size={14} className="text-gray-400"/>Guía en español</p>
              <p className="flex items-center gap-2"><ShoppingCart size={14} className="text-gray-400"/>Reserva ahora y paga después</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 text-lg">{totalLabel}</p>
                <p className="text-xs text-gray-500">{people} persona{people>1?"s":""} × {destination.priceLabel}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleReserve} className="border border-blue-500 text-blue-600 text-sm font-semibold px-4 py-2 rounded-full">Reservar</button>
                <button onClick={handleReserve} className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-1.5"><ShoppingCart size={13}/>Carrito</button>
              </div>
            </div>
          </>)}
          {step==="summary"&&(<div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-green-500"/></div>
            <h3 className="text-xl font-bold mb-2">¡Reserva confirmada!</h3>
            <div className="bg-gray-50 rounded-xl p-4 text-left mb-5 space-y-2">
              {[["Destino",destination.name],["Check-in",dateStr],["Check-out",checkOut],["Personas",people],["Total",totalLabel]].map(([k,v])=>(
                <div key={k as string} className="flex justify-between text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className={`font-semibold ${k==="Total"?"text-blue-600":"text-gray-800"}`}>{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm">Cerrar</button>
              <Link href="/reservas" className="flex-1"><button onClick={onClose} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm">Ver reservas</button></Link>
            </div>
          </div>)}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function DestinoDetalle() {
  const params  = useParams();
  const router  = useRouter();
  const { isLoggedIn, userName } = useApp();
  const toast   = useToast();

  const id          = Number(params.id);
  const destination = destinations.find(d=>d.id===id);

  const [activeTab, setActiveTab]     = useState("Descripción");
  const [saved, setSaved]             = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showAuth, setShowAuth]       = useState(false);

  const [reviews, setReviews] = useState<Review[]>([
    { id:"d1", userName:"María González", rating:5, comment:"¡Increíble! Las murallas al atardecer son absolutamente mágicas. Totalmente recomendado, una experiencia que no olvidarás.", date:new Date(Date.now()-86400000*3).toISOString(), photos:[] },
    { id:"d2", userName:"Carlos Ruiz",    rating:4, comment:"Muy buen lugar, lleno de historia y cultura. La visita guiada vale cada peso. Volveré sin duda.", date:new Date(Date.now()-86400000*7).toISOString(), photos:[] },
  ]);
  const [newRating, setNewRating]   = useState(0);
  const [newComment, setNewComment] = useState("");
  const [newPhotos, setNewPhotos]   = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { restaurants:realR, loading:loadR, error:errR } =
    useNearbyRestaurants(destination?.lat??0, destination?.lng??0);

  const handleSave  = () => { setSaved(!saved); toast[saved?"info":"success"](saved?"Eliminado de favoritos":"Guardado ❤️",destination?.name); };
  const handleShare = () => { navigator.clipboard?.writeText(window.location.href); toast.info("Enlace copiado 🔗"); };
  const getCuisine  = (c?:string)=>!c?"Restaurante":c.split(";")[0].trim().replace(/_/g," ");
  const showReal    = !loadR&&!errR&&realR.length>0;

  const avgRating = reviews.length>0
    ? (reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(1) : "—";

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files??[]).forEach(file=>{
      const reader=new FileReader();
      reader.onload=ev=>setNewPhotos(prev=>[...prev,ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };
  const handleSubmitReview = async () => {
    if(!newRating||!newComment.trim()){ toast.error("Completa la reseña","Selecciona calificación y escribe un comentario."); return; }
    if(!isLoggedIn){ setShowAuth(true); return; }
    setSubmitting(true);
    await new Promise(r=>setTimeout(r,500));
    setReviews(prev=>[{ id:Math.random().toString(36).slice(2), userName, rating:newRating, comment:newComment.trim(), date:new Date().toISOString(), photos:newPhotos },...prev]);
    setNewRating(0); setNewComment(""); setNewPhotos([]); setSubmitting(false);
    toast.success("¡Reseña publicada! ⭐","Gracias por compartir tu experiencia.");
  };

  if(!destination) return (
    <div className="min-h-screen bg-gray-50"><Navbar/>
      <div className="flex items-center justify-center py-20 text-center">
        <div><p className="text-2xl font-bold text-gray-800 mb-2">Destino no encontrado</p>
          <Link href="/buscar" className="text-blue-600 hover:underline text-sm">← Volver</Link></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {showBooking&&<BookingModal destination={destination} onClose={()=>setShowBooking(false)}/>}
      {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onSuccess={()=>setShowBooking(true)}/>}
      <Navbar/>

      <div className="max-w-7xl mx-auto px-6 pt-6 pb-12">

        {/* ── Header: back + title + meta ── */}
        <div className="flex items-center gap-3 mb-1">
          <button onClick={()=>router.back()}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm font-semibold transition-colors flex-shrink-0">
            <ArrowLeft size={16}/>Volver
          </button>
        </div>
        <div className="text-center mb-5">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{destination.name}</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><MapPin size={13} className="text-blue-500"/>{destination.location}</span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1"><Star size={13} className="text-yellow-400 fill-yellow-400"/>{destination.ratingLabel}</span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1"><MessageSquare size={13} className="text-gray-400"/>{reviews.length} reseñas</span>
          </div>
        </div>

        {/* ── TOP SPLIT: Carousel LEFT + Reviews RIGHT ── */}
        <div className="flex gap-7 items-start mb-8">

          {/* LEFT: Carousel */}
          <div className="w-[460px] flex-shrink-0">
            <SplitCarousel images={destination.images??[destination.image]} name={destination.name}/>
          </div>

          {/* RIGHT: Reviews panel — fills the blank space */}
          <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 self-stretch flex flex-col">

            {/* Rating summary */}
            <div className="flex items-center gap-5 mb-5 pb-5 border-b border-gray-100">
              <div className="text-center flex-shrink-0">
                <p className="text-5xl font-bold text-gray-900 leading-none">{avgRating}</p>
                <div className="flex gap-0.5 justify-center mt-2">
                  {[1,2,3,4,5].map(i=><Star key={i} size={15} className={i<=Math.round(Number(avgRating))?"text-yellow-400 fill-yellow-400":"text-gray-200"}/>)}
                </div>
                <p className="text-xs text-gray-400 mt-1">{reviews.length} reseñas</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5,4,3,2,1].map(star=>{
                  const count=reviews.filter(r=>r.rating===star).length;
                  const pct=reviews.length>0?(count/reviews.length)*100:0;
                  return(
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-3 text-right">{star}</span>
                      <Star size={11} className="text-yellow-400 fill-yellow-400 flex-shrink-0"/>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-yellow-400 h-2 rounded-full transition-all duration-500" style={{width:`${pct}%`}}/>
                      </div>
                      <span className="text-xs text-gray-400 w-3">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Write review form */}
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <MessageSquare size={15} className="text-blue-500"/>Escribe tu reseña
            </h3>
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1.5">Calificación</p>
              <StarSelector value={newRating} onChange={setNewRating}/>
            </div>
            <textarea value={newComment} onChange={e=>setNewComment(e.target.value)}
              placeholder={`¿Cómo fue tu experiencia en ${destination.name}?`} rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none mb-3"/>
            <button onClick={()=>fileRef.current?.click()}
              className="flex items-center gap-2 border border-dashed border-gray-300 hover:border-blue-400 text-gray-500 hover:text-blue-600 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors w-full justify-center mb-3">
              <Camera size={15}/>Añadir fotos de tu visita
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload}/>
            {newPhotos.length>0&&(
              <div className="flex gap-2 mb-3 flex-wrap">
                {newPhotos.map((p,i)=>(
                  <div key={i} className="relative">
                    <img src={p} className="w-14 h-14 object-cover rounded-xl border border-gray-200" alt=""/>
                    <button onClick={()=>setNewPhotos(prev=>prev.filter((_,pi)=>pi!==i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs leading-none">×</button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={handleSubmitReview} disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl text-sm transition-colors mb-4">
              {submitting?<Loader2 size={15} className="animate-spin"/>:<Send size={15}/>}
              {submitting?"Publicando...":"Publicar reseña"}
            </button>

            {/* Recent reviews — compact scrollable */}
            {reviews.length>0&&(
              <div className="flex-1 overflow-y-auto space-y-3 border-t border-gray-100 pt-4 min-h-0" style={{maxHeight:180}}>
                {reviews.map(r=>(
                  <div key={r.id} className="flex gap-2.5">
                    <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{r.userName[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-bold text-gray-800 truncate">{r.userName}</p>
                        <p className="text-xs text-gray-400 ml-2 flex-shrink-0">{formatDate(r.date)}</p>
                      </div>
                      <div className="flex gap-0.5 mb-0.5">
                        {[1,2,3,4,5].map(i=><Star key={i} size={10} className={i<=r.rating?"text-yellow-400 fill-yellow-400":"text-gray-200"}/>)}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{r.comment}</p>
                      {r.photos.length>0&&<div className="flex gap-1 mt-1 flex-wrap">{r.photos.map((p,i)=><img key={i} src={p} className="w-10 h-10 object-cover rounded-lg" alt=""/>)}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── BOTTOM: Tabs + Sidebar (unchanged) ── */}
        <div className="flex gap-8 items-start">
          <div className="flex-1 min-w-0">

            {/* Tabs */}
            <div className="bg-gray-100 rounded-xl p-1 flex gap-1 mb-6 overflow-x-auto">
              {tabs.map(tab=>(
                <button key={tab} onClick={()=>setActiveTab(tab)}
                  className={`flex-shrink-0 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors min-w-[90px] ${activeTab===tab?"bg-white text-gray-900 shadow-sm":"text-gray-500 hover:text-gray-700"}`}>
                  {tab}
                  {tab==="Reseñas"&&<span className="ml-1.5 bg-blue-100 text-blue-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{reviews.length}</span>}
                </button>
              ))}
            </div>

            {/* DESCRIPCIÓN */}
            {activeTab==="Descripción"&&(
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Sobre {destination.name}</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{destination.description}</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{destination.longDescription}</p>
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-800 mb-2">Categoría</h3>
                  <span className="inline-block bg-gray-100 text-gray-700 text-sm font-medium px-4 py-1.5 rounded-lg">{destination.category}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-2">Tags</h3>
                  <div className="flex gap-2 flex-wrap">{destination.tags.map(t=><span key={t} className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-md font-medium">{t}</span>)}</div>
                </div>
              </div>
            )}




            {/* RESTAURANTES */}
            {activeTab==="Restaurantes"&&(
              <div className="space-y-4">
                {loadR&&<div className="flex items-center justify-center py-10 gap-2 text-gray-400"><Loader2 size={20} className="animate-spin"/><span className="text-sm">Buscando restaurantes...</span></div>}
                {showReal&&realR.map(r=>{
                  const url=`https://www.google.com/maps/search/${encodeURIComponent((r.tags.name??"")+` ${destination.location}`)}`;
                  return(<a key={r.id} href={url} target="_blank" rel="noopener noreferrer">
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0"><Utensils size={18} className="text-orange-500"/></div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{r.tags.name}</h3>
                        <p className="text-xs text-blue-600 font-medium mb-1 capitalize">{getCuisine(r.tags.cuisine)}</p>
                        <p className="text-sm text-gray-500">{r.tags["addr:street"]??"Ver en Google Maps"}</p>
                      </div>
                    </div>
                  </a>);
                })}
                {!loadR&&!showReal&&destination.restaurants.map((r,i)=>{
                  const url=`https://www.google.com/maps/search/${encodeURIComponent(r.name+` ${destination.location}`)}`;
                  return(<a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0"><Utensils size={18} className="text-orange-500"/></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{r.name}</h3>
                          <div className="flex items-center gap-1"><Star size={14} className="text-yellow-400 fill-yellow-400"/><span className="text-sm font-semibold text-gray-700">{r.rating}</span><span className="text-gray-400 text-sm ml-2">{r.price}</span></div>
                        </div>
                        <p className="text-xs text-blue-600 font-medium mb-1">{r.type}</p>
                        <p className="text-sm text-gray-500">{r.description}</p>
                      </div>
                    </div>
                  </a>);
                })}
                <p className="text-xs text-gray-400 text-center pt-1">Clic para ver en Google Maps</p>
              </div>
            )}

            {/* CARACTERÍSTICAS */}
            {activeTab==="Características"&&(
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Información del destino</h2>
                <div className="grid grid-cols-2 gap-4">
                  {destination.features.map((f,i)=>(
                    <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs text-gray-400 font-medium mb-1">{f.label}</p>
                      <p className="text-sm font-semibold text-gray-800">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RESEÑAS — full list */}
            {activeTab==="Reseñas"&&(
              <div className="space-y-4">
                {reviews.map(review=>(
                  <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{review.userName[0]}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-gray-800">{review.userName}</p>
                          <p className="text-xs text-gray-400">{formatDate(review.date)}</p>
                        </div>
                        <div className="flex gap-0.5 mt-0.5">{[1,2,3,4,5].map(i=><Star key={i} size={13} className={i<=review.rating?"text-yellow-400 fill-yellow-400":"text-gray-200"}/>)}</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{review.comment}</p>
                    {review.photos.length>0&&<div className="flex gap-2 flex-wrap">{review.photos.map((p,i)=><img key={i} src={p} className="w-20 h-20 object-cover rounded-xl border border-gray-100 cursor-zoom-in" alt=""/>)}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* MAPA */}
            {activeTab==="Mapa"&&(
              <DestinationMap name={destination.name} lat={destination.lat} lng={destination.lng}/>
            )}
          </div>

          {/* Sidebar — unchanged */}
          <div className="w-[320px] flex-shrink-0 sticky top-[76px]">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Precio desde</p>
              <p className="text-3xl font-bold text-blue-600 mb-1">{destination.priceLabel}</p>
              <p className="text-xs text-gray-400 mb-5">por persona</p>

              <button onClick={()=>isLoggedIn?setShowBooking(true):setShowAuth(true)}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-colors mb-3">
                Reservar Ahora
              </button>

              <div className="flex gap-3 mb-5">
                <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium py-2.5 rounded-xl">
                  <Share2 size={15}/>Compartir
                </button>
                <button onClick={handleSave}
                  className={`flex-1 flex items-center justify-center gap-1.5 border text-sm font-medium py-2.5 rounded-xl transition-colors ${saved?"border-red-200 text-red-500 bg-red-50":"border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  <Heart size={15} className={saved?"fill-red-500 text-red-500":""}/>
                  {saved?"Guardado":"Guardar"}
                </button>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-bold text-gray-800 mb-3">¿Por qué reservar con nosotros?</p>
                <ul className="space-y-2">
                  {["Cancelación gratuita hasta 24 horas antes","Mejor precio garantizado","Atención al cliente 24/7","Pago seguro y encriptado"].map((item,i)=>(
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5"/>{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
