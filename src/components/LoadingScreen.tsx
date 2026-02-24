"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setFadeOut(true), 1800);
    const timer2 = setTimeout(() => setVisible(false), 2300);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 z-[100] bg-blue-600 flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}>
      {/* Animated globe */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full border-4 border-white/30 border-t-white animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Globe size={32} className="text-white" />
        </div>
      </div>

      <h1 className="text-white font-bold text-2xl italic mb-2">New Tourism</h1>
      <p className="text-blue-200 text-sm">Descubriendo tu próxima aventura...</p>

      {/* Progress bar */}
      <div className="mt-8 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-white rounded-full animate-[loading_1.8s_ease-in-out_forwards]" />
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
