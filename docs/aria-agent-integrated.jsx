import { useState, useRef, useEffect } from "react";

const SYSTEM = `You are ARIA — Amanda's dedicated AI for two things: Wisconsin insurance licensing exam prep and the PassPro platform she is building.

[Same detailed SYSTEM prompt as before - truncated here for brevity. Use the full one from your original aria-agent.jsx]`;

const MODES = [
  { id: "study", label: "Study Mode", icon: "📚" },
  { id: "quiz", label: "Quiz Mode", icon: "⚡" },
  { id: "coach", label: "Coach Mode", icon: "🎯" },
];

export default function ARIAAgentIntegrated() {
  const [mode, setMode] = useState("study");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text) {
    const t = (text || input).trim();
    if (!t || loading) return;

    setInput("");
    setError("");

    const userMsg = { role: "user", content: t };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Call our new smart API route
      const res = await fetch("/api/aria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          mode: mode,
          system: SYSTEM,
        }),
      });

      const data = await res.json();

      let assistantContent = "";

      if (data.type === "tool_result") {
        // Handle structured tool output
        assistantContent = data.message || "Tool executed successfully.";
        
        // You can enhance this to render special components
        // e.g., if (data.tool === "generate_practice_questions") { show quiz UI }
        
        if (data.data) {
          assistantContent += "\n\n" + JSON.stringify(data.data, null, 2);
        }
      } 
      else if (data.type === "claude_response") {
        assistantContent = data.content;
      } 
      else if (data.type === "error") {
        assistantContent = "Error: " + data.message;
      } 
      else {
        assistantContent = "I processed your request but didn't get a clear response.";
      }

      const assistantMsg = { role: "assistant", content: assistantContent };
      setMessages([...updatedMessages, assistantMsg]);

    } catch (e) {
      setError(e.message || "Failed to get response from ARIA");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  return (
    <div style={{
      minHeight: 660,
      maxHeight: 760,
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(160deg, #1A120A 0%, #231509 60%, #1C100A 100%)",
      borderRadius: 20,
      overflow: "hidden",
      fontFamily: "'Crimson Pro', serif",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(201,135,79,0.12)",
        background: "rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "linear-gradient(135deg, #C9874F, #7B3910)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#FFF8F2", fontSize: 15, fontWeight: 600 }}>A</span>
          </div>
          <div>
            <div style={{ color: "#EDE0D4", fontSize: 18, fontWeight: 600, letterSpacing: 3 }}>ARIA</div>
            <div style={{ color: "rgba(201,135,79,0.75)", fontSize: 11, letterSpacing: 1.5 }}>TOOL-POWERED • PASSPRO</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} style={{
              background: "none", border: "none", color: "rgba(237,224,212,0.3)",
              fontSize: 11, cursor: "pointer", padding: "4px 8px",
            }}>CLEAR</button>
          )}
        </div>
      </div>

      {/* Mode Tabs */}
      <div style={{
        display: "flex", gap: 6, padding: "10px 18px",
        borderBottom: "1px solid rgba(201,135,79,0.1)",
        background: "rgba(0,0,0,0.15)",
      }}>
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              background: mode === m.id ? "rgba(201,135,79,0.18)" : "transparent",
              border: `1px solid ${mode === m.id ? "rgba(201,135,79,0.45)" : "rgba(201,135,79,0.15)"}`,
              borderRadius: 20,
              padding: "5px 13px",
              color: mode === m.id ? "#C9874F" : "rgba(237,224,212,0.45)",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 60, color: "rgba(237,224,212,0.5)" }}>
            <div style={{ fontSize: 20, fontStyle: "italic" }}>Ready when you are, Amanda.</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>Tool-powered ARIA is active</div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            marginBottom: 16,
          }}>
            <div style={{
              maxWidth: "73%",
              padding: "11px 15px",
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
              background: m.role === "user" 
                ? "linear-gradient(135deg, #C9874F, #A0522D)" 
                : "rgba(255,255,255,0.06)",
              color: m.role === "user" ? "#FFF8F2" : "#EDE0D4",
              fontSize: 14.5,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ padding: "12px 15px", color: "rgba(237,224,212,0.5)" }}>
            ARIA is thinking...
          </div>
        )}

        {error && (
          <div style={{ color: "#F0A090", padding: "8px 12px", fontSize: 13 }}>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "10px 14px 14px",
        borderTop: "1px solid rgba(201,135,79,0.1)",
        background: "rgba(0,0,0,0.22)",
      }}>
        <div style={{
          display: "flex",
          gap: 8,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(201,135,79,0.22)",
          borderRadius: 15,
          padding: "7px 7px 7px 14px",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Ask ARIA in ${mode} mode...`}
            rows={1}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              color: "#EDE0D4",
              fontSize: 15,
              resize: "none",
              maxHeight: 110,
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              border: "none",
              background: input.trim() && !loading 
                ? "linear-gradient(135deg, #C9874F, #A0522D)" 
                : "rgba(255,255,255,0.06)",
              cursor: input.trim() && !loading ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
