"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { supabase, Profile, Booking } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

// ─── Tipos del contexto ───────────────────────────────────────

export type AppReservation = {
  id: string;
  destinationId: string;
  destinationName: string;
  destinationLocation: string;
  destinationImage: string;
  date: string;
  people: number;
  totalPrice: number;
  totalPriceLabel: string;
  status: "Confirmada" | "Pendiente" | "Cancelada";
  createdAt: string;
};

type AppContextType = {
  // Auth
  isLoggedIn: boolean;
  userName: string;
  userEmail: string;
  userId: string | null;
  userAvatar: string | null;
  session: Session | null;
  // Actions auth
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  // Reservas
  reservations: AppReservation[];
  addReservation: (r: Omit<AppReservation, "id" | "createdAt">) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;
  loadingReservations: boolean;
  // Favoritos
  favorites: Set<string>;
  toggleFavorite: (destinationId: string) => Promise<void>;
  // UI
  hydrated: boolean;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // ─── Estado ───────────────────────────────────────────────
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reservations, setReservations] = useState<AppReservation[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(false);

  // ─── Derivados del estado ─────────────────────────────────
  const isLoggedIn = !!session?.user;
  const userId = session?.user?.id ?? null;
  const userEmail = session?.user?.email ?? "";
  const userName = profile?.full_name ?? userEmail.split("@")[0] ?? "";
  const userAvatar = profile?.avatar_url ?? null;

  // ─── 1. Inicializar sesión de Supabase ────────────────────
  useEffect(() => {
    // Obtener sesión actual al montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Escuchar cambios de sesión (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ─── 2. Cargar perfil cuando hay sesión ───────────────────
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setHydrated(true);
      return;
    }
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data as Profile);
        setHydrated(true);
      });
  }, [userId]);

  // ─── 3. Cargar reservas cuando hay sesión ─────────────────
  const loadReservations = useCallback(async () => {
    if (!userId) { setReservations([]); return; }
    setLoadingReservations(true);
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        destination:destinations (
          id, name, city, price_label,
          destination_images (url, sort_order)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mapped: AppReservation[] = (data as any[]).map((b) => ({
        id: b.id,
        destinationId: b.destination_id,
        destinationName: b.destination?.name ?? "Destino",
        destinationLocation: b.destination?.city ?? "Cartagena",
        destinationImage:
          b.destination?.destination_images?.find((i: any) => i.sort_order === 0)?.url ??
          "https://images.unsplash.com/photo-1533050487297-09b450131914?w=800",
        date: b.booking_date,
        people: b.num_people,
        totalPrice: b.total_price,
        totalPriceLabel: `${Number(b.total_price).toLocaleString("es-CO")} COP`,
        status: mapStatus(b.status),
        createdAt: b.created_at,
      }));
      setReservations(mapped);
    }
    setLoadingReservations(false);
  }, [userId]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  // ─── 4. Cargar favoritos cuando hay sesión ────────────────
  useEffect(() => {
    if (!userId) { setFavorites(new Set()); return; }
    supabase
      .from("favorites")
      .select("destination_id")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (data) setFavorites(new Set(data.map((f) => f.destination_id)));
      });
  }, [userId]);

  // ─── Helpers ─────────────────────────────────────────────
  function mapStatus(s: string): AppReservation["status"] {
    if (s === "confirmed") return "Confirmada";
    if (s === "cancelled") return "Cancelada";
    return "Pendiente";
  }

  function parseSpanishDate(dateStr: string): string {
    const months: Record<string, string> = {
      enero: "01", febrero: "02", marzo: "03", abril: "04",
      mayo: "05", junio: "06", julio: "07", agosto: "08",
      septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12",
    };
    // Formato: "15 de enero de 2026"
    const match = dateStr.match(/(\d+)\s+de\s+(\w+)\s+de\s+(\d{4})/i);
    if (match) {
      const day   = match[1].padStart(2, "0");
      const month = months[match[2].toLowerCase()] ?? "01";
      const year  = match[3];
      return `${year}-${month}-${day}`;
    }
    // Si ya es ISO o no se puede parsear, devolver hoy
    return new Date().toISOString().split("T")[0];
  }

  // ─── Auth: Login ──────────────────────────────────────────
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes("Invalid login")) return { error: "Correo o contraseña incorrectos." };
      return { error: error.message };
    }
    return { error: null };
  };

  // ─── Auth: Registro ───────────────────────────────────────
  const register = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) {
      if (error.message.includes("already registered")) return { error: "Este correo ya está registrado." };
      return { error: error.message };
    }
    // Actualizar nombre en profiles (el trigger lo crea pero sin nombre a veces)
    if (data.user) {
      await supabase
        .from("profiles")
        .update({ full_name: name })
        .eq("id", data.user.id);
    }
    return { error: null };
  };

  // ─── Auth: Logout ─────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setReservations([]);
    setFavorites(new Set());
    setProfile(null);
  };

  // ─── Reservas: Agregar ────────────────────────────────────
  const addReservation = async (r: Omit<AppReservation, "id" | "createdAt">) => {
    if (!userId) return;

    // Los destinos locales usan IDs numéricos (1,2,3...)
    // Supabase necesita el UUID real — lo buscamos por nombre
    let supabaseDestinationId: string | null = null;

    const { data: destData } = await supabase
      .from("destinations")
      .select("id")
      .eq("name", r.destinationName)
      .single();

    if (destData) {
      supabaseDestinationId = destData.id;
    } else {
      // Si no existe en Supabase todavía, lo creamos mínimamente
      const { data: newDest } = await supabase
        .from("destinations")
        .insert({
          slug: r.destinationName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          name: r.destinationName,
          category: "General",
          city: r.destinationLocation,
          price: r.totalPrice / r.people,
          currency: "COP",
        })
        .select("id")
        .single();
      supabaseDestinationId = newDest?.id ?? null;
    }

    if (!supabaseDestinationId) return;

    // Convertir fecha legible "15 de enero de 2026" → "2026-01-15"
    const bookingDate = parseSpanishDate(r.date);

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        user_id: userId,
        destination_id: supabaseDestinationId,
        booking_date: bookingDate,
        num_people: r.people,
        unit_price: r.totalPrice / r.people,
        total_price: r.totalPrice,
        status: "confirmed",
      })
      .select()
      .single();

    if (!error && data) {
      const newR: AppReservation = {
        ...r,
        destinationId: supabaseDestinationId,
        id: data.id,
        createdAt: data.created_at,
        status: "Confirmada",
      };
      setReservations((prev) => [newR, ...prev]);
    }
  };

  // ─── Reservas: Cancelar ───────────────────────────────────
  const cancelReservation = async (id: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId!);

    if (!error) {
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Cancelada" } : r))
      );
    }
  };

  // ─── Favoritos: Toggle ────────────────────────────────────
  const toggleFavorite = async (destinationId: string) => {
    if (!userId) return;
    const isFav = favorites.has(destinationId);

    // Optimistic update
    setFavorites((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(destinationId) : next.add(destinationId);
      return next;
    });

    if (isFav) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("destination_id", destinationId);
    } else {
      await supabase
        .from("favorites")
        .insert({ user_id: userId, destination_id: destinationId });
    }
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        userName,
        userEmail,
        userId,
        userAvatar,
        session,
        login,
        register,
        logout,
        reservations,
        addReservation,
        cancelReservation,
        loadingReservations,
        favorites,
        toggleFavorite,
        hydrated,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
