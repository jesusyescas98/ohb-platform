"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIChatPage() {
  const { user, accessToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hola, soy AVA. Puedo analizar leads, recomendar propiedades, y generar reportes de inversión.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || !accessToken) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: input, timestamp: new Date() },
    ]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: "query",
          payload: { query: input, context: { role: user?.role } },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: data.answer,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>🤖 AVA - Asistente Autónomo</h1>
      <div style={{ height: "400px", overflowY: "auto", marginBottom: "1rem", border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: "1rem", textAlign: msg.role === "user" ? "right" : "left" }}>
            <div style={{
              display: "inline-block",
              padding: "0.75rem",
              borderRadius: "8px",
              backgroundColor: msg.role === "user" ? "#D4A843" : "#f0f0f0",
              color: msg.role === "user" ? "#fff" : "#000",
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <p>Procesando...</p>}
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Pregunta sobre leads, propiedades, inversiones..."
          disabled={loading}
          style={{ flex: 1, padding: "0.75rem", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#D4A843",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
