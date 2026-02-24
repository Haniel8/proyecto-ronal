"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import {
  Calendar, MapPin, Users, Eye, Share2, Trash2,
  CheckCircle, Clock, XCircle, ShoppingBag,
} from "lucide-react";

export default function MisReservas() {
  const { reservations, cancelReservation, isLoggedIn } = useApp();
  const [activeTab, setActiveTab] = useState<"activas" | "pasadas">("activas");
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  const activas = reservations.filter((r) => r.status !== "Cancelada");
  const pasadas = reservations.filter((r) => r.status === "Cancelada");
  const shown = activeTab === "activas" ? activas : pasadas;

  const statusConfig = {
    Confirmada: { label: "Confirmada", icon: <CheckCircle size={14} />, class: "bg-green-50 text-green-700 border-green-200" },
    Pendiente:  { label: "Pendiente",  icon: <Clock size={14} />,        class: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    Cancelada:  { label: "Cancelada",  icon: <XCircle size={14} />,      class: "bg-red-50 text-red-600 border-red-200" },
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Inicia sesión para ver tus reservas</h2>
          <p className="text-gray-500 text-sm">Necesitas una cuenta para gestionar tus viajes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar size={30} className="text-blue-600" />
            Mis Reservas
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona tus viajes reservados y próximos</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-200 rounded-xl p-1 w-fit mb-6">
          <button onClick={() => setActiveTab("activas")}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === "activas" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            Activas ({activas.length})
          </button>
          <button onClick={() => setActiveTab("pasadas")}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === "pasadas" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            Pasadas ({pasadas.length})
          </button>
        </div>

        {/* Empty state */}
        {shown.length === 0 && (
          <div className="text-center py-20">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-semibold text-gray-500">
              {activeTab === "activas" ? "No tienes reservas activas" : "No tienes reservas pasadas"}
            </p>
            {activeTab === "activas" && (
              <Link href="/buscar" className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors">
                Explorar destinos
              </Link>
            )}
          </div>
        )}

        {/* Reservations list */}
        <div className="space-y-4">
          {shown.map((r) => {
            const sc = statusConfig[r.status];
            return (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex">
                  {/* Image */}
                  <div className="w-[260px] flex-shrink-0">
                    <img src={r.destinationImage} alt={r.destinationName} className="w-full h-full object-cover" style={{ minHeight: 200 }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    {/* Title + status */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{r.destinationName}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={13} />{r.destinationLocation}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${sc.class}`}>
                        {sc.icon}{sc.label}
                      </span>
                    </div>

                    {/* Dates + people */}
                    <div className="grid grid-cols-3 gap-4 my-4 border-t border-b border-gray-100 py-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Check-in</p>
                        <p className="text-sm font-semibold text-gray-800">{r.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Check-out</p>
                        <p className="text-sm font-semibold text-gray-800">{r.checkOut}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Viajeros</p>
                        <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                          <Users size={14} />{r.people}
                        </p>
                      </div>
                    </div>

                    {/* Total + actions */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Total</p>
                        <p className="text-xl font-bold text-blue-600">{r.totalPriceLabel}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/destino/${r.destinationId}`}>
                          <button className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium px-4 py-2 rounded-full transition-colors">
                            <Eye size={14} />Ver Destino
                          </button>
                        </Link>
                        <button className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium px-4 py-2 rounded-full transition-colors">
                          <Share2 size={14} />Compartir
                        </button>
                        {r.status !== "Cancelada" && (
                          <button
                            onClick={() => setConfirmCancel(r.id)}
                            className="flex items-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium px-4 py-2 rounded-full transition-colors"
                          >
                            <Trash2 size={14} />Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm cancel modal */}
      {confirmCancel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">¿Cancelar reserva?</h3>
            <p className="text-sm text-gray-500 mb-5">Esta acción no se puede deshacer. Se procesará el reembolso según la política de cancelación.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmCancel(null)}
                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-xl transition-colors text-sm">
                Mantener
              </button>
              <button
                onClick={() => { cancelReservation(confirmCancel); setConfirmCancel(null); }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
