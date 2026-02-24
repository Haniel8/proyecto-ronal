"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search, Home as HomeIcon, Calendar, MessageCircle,
  Bell, LogIn, UserPlus, LogOut,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useState } from "react";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const { isLoggedIn, userName, logout, reservations } = useApp();
  const pathname = usePathname();
  const [showAuth, setShowAuth] = useState(false);

  const activeReservations = reservations.filter(r => r.status !== "Cancelada").length;

  const navItems = [
    { href: "/", label: "Inicio", icon: <HomeIcon size={16} /> },
    { href: "/buscar", label: "Buscar Destinos", icon: <Search size={16} /> },
    ...(isLoggedIn ? [
      { href: "/reservas", label: "Mis Reservas", icon: <Calendar size={16} /> },
      { href: "/chat", label: "Chat IA", icon: <MessageCircle size={16} /> },
    ] : []),
  ];

  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[60px]">

          {/* Logo */}
          <Link href="/">
            <span className="text-blue-600 font-bold text-xl italic cursor-pointer">New Tourism</span>
          </Link>

          {/* Nav items */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                  }`}>
                  {item.icon}{item.label}
                  {item.href === "/reservas" && activeReservations > 0 && (
                    <span className="ml-1 bg-blue-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {activeReservations}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                {/* Bell */}
                <div className="relative">
                  <button className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                    <Bell size={18} />
                  </button>
                  {activeReservations > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {activeReservations}
                    </span>
                  )}
                </div>

                {/* Avatar + name → perfil */}
                <Link href="/perfil" className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1.5 rounded-xl transition-colors">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {userName[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{userName}</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => setShowAuth(true)} className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2">
                  <LogIn size={16} />Iniciar sesión
                </button>
                <button onClick={() => setShowAuth(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
                  <UserPlus size={16} />Registrarse
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
