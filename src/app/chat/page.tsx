"use client";

import { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import { Send, Bot, Cpu } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
};

const quickQuestions = [
  "¿Qué destinos me recomiendas?",
  "¿Cuál es el mejor momento para viajar?",
  "Busco restaurantes en mi destino",
  "Actividades recomendadas",
];

function getTime() {
  return new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatIA() {
  const { userName, isLoggedIn } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `¡Hola ${userName || "viajero"}! 👋 Soy tu asistente de viajes con IA. Puedo ayudarte a encontrar destinos, restaurantes, planificar itinerarios y responder tus dudas sobre viajes. ¿En qué puedo ayudarte hoy?`,
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");

    const userMsg: Message = {
      id: Math.random().toString(36).slice(2),
      role: "user",
      content: text,
      time: getTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Eres un asistente de viajes experto llamado TravelBot para la plataforma New Tourism. 
Ayudas a los usuarios a planificar viajes, recomendar destinos, restaurantes e itinerarios.
Los destinos disponibles en la plataforma son: Machu Picchu, París, Maldivas, Santorini, Nueva York, Roma, Tokio, Bali, Safari Kenia y Barcelona.
Responde siempre en español, de forma amigable, concisa y útil. 
Si el usuario pregunta por reservas, dile que puede hacerlo desde la sección "Buscar Destinos".
El usuario se llama ${userName || "viajero"}.`,
          messages: [...history, { role: "user", content: text }],
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text ?? "Lo siento, no pude procesar tu mensaje. Intenta de nuevo.";

      const assistantMsg: Message = {
        id: Math.random().toString(36).slice(2),
        role: "assistant",
        content: reply,
        time: getTime(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: Math.random().toString(36).slice(2),
        role: "assistant",
        content: "Hubo un error al conectar con el asistente. Por favor intenta de nuevo.",
        time: getTime(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-3xl w-full mx-auto px-6 py-8 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bot size={30} className="text-blue-600" />
            Chat con IA
          </h1>
          <p className="text-gray-500 text-sm mt-1">Asistente conversacional impulsado por IA</p>
          <span className="inline-flex items-center gap-1.5 mt-2 bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full border border-purple-200">
            <Cpu size={11} />
            100% privado - Procesamiento local
          </span>
        </div>

        {/* Chat box */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col flex-1 overflow-hidden" style={{ minHeight: 420 }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold ${
                  msg.role === "assistant" ? "bg-purple-600" : "bg-blue-600"
                }`}>
                  {msg.role === "assistant" ? <Bot size={16} /> : (userName[0]?.toUpperCase() ?? "U")}
                </div>

                {/* Bubble */}
                <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "assistant"
                      ? "bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100"
                      : "bg-blue-600 text-white rounded-tr-none"
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-xs text-gray-400 mt-1 px-1">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Loading bubble */}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white flex-shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && (
            <div className="px-6 pb-3">
              <p className="text-xs text-gray-400 mb-2 font-medium">Preguntas rápidas:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q) => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="text-xs border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 px-3 py-1.5 rounded-full transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-100 p-4 flex gap-3">
            <input
              type="text"
              placeholder="Escribe tu pregunta sobre viajes..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              disabled={loading}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
