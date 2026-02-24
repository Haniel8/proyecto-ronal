import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { ToastProvider } from "@/components/ToastProvider";
import LoadingScreen from "@/components/LoadingScreen";

export const metadata: Metadata = {
  title: "New Tourism",
  description: "Tu plataforma inteligente de viajes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body>
        <AppProvider>
          <ToastProvider>
            <LoadingScreen />
            {children}
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
