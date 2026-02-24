"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  User, Mail, Lock, Eye, EyeOff, Shield,
  BarChart2, MapPin, Calendar, Star, Save,
  CheckCircle,
} from "lucide-react";

const tabs = ["Perfil", "Seguridad", "Mis Datos"];

export default function Perfil() {
  const { userName, userEmail, isLoggedIn, reservations } = useApp();
  const [activeTab, setActiveTab] = useState("Perfil");

  // Perfil
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [savedProfile, setSavedProfile] = useState(false);

  // Seguridad
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSaved, setPassSaved] = useState(false);

  const handleSaveProfile = () => {
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 2500);
  };

  const handleSavePassword = () => {
    setPassError("");
    if (!currentPass || !newPass || !confirmPass) { setPassError("Completa todos los campos."); return; }
    if (newPass.length < 6) { setPassError("La nueva contraseña debe tener al menos 6 caracteres."); return; }
    if (newPass !== confirmPass) { setPassError("Las contraseñas no coinciden."); return; }
    setPassSaved(true);
    setCurrentPass(""); setNewPass(""); setConfirmPass("");
    setTimeout(() => setPassSaved(false), 2500);
  };

  // Stats
  const activeReservations = reservations.filter(r => r.status === "Confirmada").length;
  const totalSpent = reservations.filter(r => r.status !== "Cancelada").reduce((acc, r) => acc + r.totalPrice, 0);
  const uniqueDestinations = new Set(reservations.map(r => r.destinationId)).size;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20 text-center">
          <div>
            <User size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-xl font-bold text-gray-700 mb-3">Inicia sesión para ver tu perfil</p>
            <Link href="/" className="text-blue-600 hover:underline text-sm">← Volver al inicio</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona tu información personal y preferencias</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-200 rounded-xl p-1 mb-6">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── PERFIL ── */}
        {activeTab === "Perfil" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-5">Información Personal</h2>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md">
                {userName[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{userName}</p>
                <p className="text-sm text-gray-500">{userEmail}</p>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre completo</label>
                <div className="relative">
                  <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button onClick={handleSaveProfile}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
                <Save size={15} />Guardar Cambios
              </button>
              {savedProfile && (
                <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                  <CheckCircle size={15} />Guardado correctamente
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── SEGURIDAD ── */}
        {activeTab === "Seguridad" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Shield size={18} className="text-blue-600" />
              <h2 className="text-base font-bold text-gray-800">Cambiar Contraseña</h2>
            </div>

            <div className="space-y-4">
              {[
                { label: "Contraseña actual", value: currentPass, set: setCurrentPass, show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
                { label: "Nueva contraseña", value: newPass, set: setNewPass, show: showNew, toggle: () => setShowNew(!showNew), hint: "Mínimo 6 caracteres" },
                { label: "Confirmar nueva contraseña", value: confirmPass, set: setConfirmPass, show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
              ].map((field, i) => (
                <div key={i}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={field.show ? "text" : "password"}
                      placeholder={field.hint ?? "••••••••"}
                      value={field.value}
                      onChange={(e) => field.set(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <button onClick={field.toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {field.show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}

              {passError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-2.5 rounded-xl">{passError}</div>
              )}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button onClick={handleSavePassword}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
                <Shield size={15} />Actualizar Contraseña
              </button>
              {passSaved && (
                <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                  <CheckCircle size={15} />Contraseña actualizada
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── MIS DATOS ── */}
        {activeTab === "Mis Datos" && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <Calendar size={20} className="text-blue-600" />, bg: "bg-blue-50", label: "Reservas activas", value: activeReservations },
                { icon: <MapPin size={20} className="text-green-600" />, bg: "bg-green-50", label: "Destinos visitados", value: uniqueDestinations },
                { icon: <Star size={20} className="text-yellow-500" />, bg: "bg-yellow-50", label: "Valoración media", value: "4.9 ★" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                  <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>{s.icon}</div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={18} className="text-blue-600" />
                <h2 className="text-base font-bold text-gray-800">Resumen de gastos</h2>
              </div>
              {[
                { label: "Total invertido en viajes", value: `${totalSpent.toLocaleString("es-CO")} US$`, blue: true },
                { label: "Reservas completadas", value: activeReservations },
                { label: "Destinos únicos", value: uniqueDestinations },
              ].map((row, i, arr) => (
                <div key={i} className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}>
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <span className={`font-bold text-lg ${row.blue ? "text-blue-600" : "text-gray-800"}`}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Últimas reservas */}
            {reservations.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-800 mb-4">Últimas reservas</h2>
                <div className="space-y-3">
                  {reservations.slice(0, 3).map((r) => (
                    <div key={r.id} className="flex items-center gap-3">
                      <img src={r.destinationImage} alt={r.destinationName}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{r.destinationName}</p>
                        <p className="text-xs text-gray-400">{r.date}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        r.status === "Confirmada" ? "bg-green-50 text-green-700" :
                        r.status === "Cancelada" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-700"
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
