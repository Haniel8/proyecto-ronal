"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Reservation = {
  id: string;
  destinationId: number;
  destinationName: string;
  destinationLocation: string;
  destinationImage: string;
  date: string;
  checkOut: string;
  people: number;
  totalPrice: number;
  totalPriceLabel: string;
  status: "Confirmada" | "Pendiente" | "Cancelada";
  createdAt: string;
};

type AppContextType = {
  isLoggedIn: boolean;
  userName: string;
  userEmail: string;
  login: (name: string, email: string) => void;
  logout: () => void;
  reservations: Reservation[];
  addReservation: (r: Omit<Reservation, "id" | "createdAt">) => void;
  cancelReservation: (id: string) => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("nt_user");
      const storedReservations = localStorage.getItem("nt_reservations");
      if (storedUser) {
        const { name, email } = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setUserName(name);
        setUserEmail(email);
      }
      if (storedReservations) {
        setReservations(JSON.parse(storedReservations));
      }
    } catch (_) {}
    setHydrated(true);
  }, []);

  // Save reservations to localStorage whenever they change
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("nt_reservations", JSON.stringify(reservations));
  }, [reservations, hydrated]);

  const login = (name: string, email: string) => {
    setIsLoggedIn(true);
    setUserName(name);
    setUserEmail(email);
    localStorage.setItem("nt_user", JSON.stringify({ name, email }));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserName("");
    setUserEmail("");
    localStorage.removeItem("nt_user");
  };

  const addReservation = (r: Omit<Reservation, "id" | "createdAt">) => {
    const newR: Reservation = {
      ...r,
      id: Math.random().toString(36).slice(2),
      createdAt: new Date().toISOString(),
    };
    setReservations((prev) => [newR, ...prev]);
  };

  const cancelReservation = (id: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Cancelada" } : r))
    );
  };

  if (!hydrated) return null;

  return (
    <AppContext.Provider
      value={{ isLoggedIn, userName, userEmail, login, logout, reservations, addReservation, cancelReservation }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
