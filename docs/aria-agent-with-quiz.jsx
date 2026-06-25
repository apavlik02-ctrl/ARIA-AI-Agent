import { useState, useRef, useEffect } from "react";
import QuizRenderer from "./QuizRenderer"; // Adjust path as needed

const SYSTEM = `You are ARIA — Amanda's dedicated AI for Wisconsin insurance licensing exam prep and PassPro development.`;

// You can expand MODES as needed
const MODES = [
  { id: "study", label: "Study", icon: "📚" },
  { id: "quiz", label: "Quiz", icon: "⚡" },
  { id: "coach", label: "Coach", icon: "🎯" },
];

export default function ARIAAgentWithQuiz({ user }) {
  const [mode, setMode] = useState("study");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentQuiz, setCurrentQuiz] = useState(null); // For rendering QuizRenderer
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentQuiz]);

  async function send(text) {
    const t = (text || input).trim();
    if (!t || loading) return;

    setInput("");
    setError("");
    setCurrentQuiz(null); // Clear any active quiz when sending new message

    const userMsg = { role: "user", content: t };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    try {
      const res = await fetch("/api/aria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated,
          mode,
          userId: user?.id, // From Clerk
        }),
      });

      const data = await res.json();

      if (data.type === "tool_result") {
        // Handle structured tool results
        if (data.tool === "generate_practice_questions" && data.data) {
          // Show beautiful quiz instead of text
          setCurrentQuiz({
            questions: data.data,
            onComplete: async (results) => {
              // Submit results to update progress
              await fetch("/api/aria", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "submit_quiz_result",
                  userId: user?.id,
                  payload: { quizResult: results },
                }),
              });

              // Add a message about the result
              const summaryMsg = {
                role: "assistant",
                content: `Quiz complete! You scored ${results.overall_score}%. Your weak areas have been updated.`,
              };
              setMessages((prev) => [...prev, summaryMsg]);
              setCurrentQuiz(null);
            },
          });
        } else {
          // Other tools (readiness, schedule, regulations)
          const assistantMsg = {
            role: "assistant",
            content: data.message || "Tool executed successfully.",
          };
          setMessages([...updated, assistantMsg]);

          // Optionally show current progress
          if (data.current_progress) {
            console.log("Current Progress:", data.current_progress);
          }
        }
      } 
      else if (data.type === "claude_response") {
        const assistantMsg = { role: "assistant", content: data.content };
        setMessages([...updated, assistantMsg]);
      } 
      else if (data.type === "progress_updated") {
        const assistantMsg = { role: "assistant", content: data.message };
        setMessages([...updated, assistantMsg]);
      } 
      else {
        const assistantMsg = { role: "assistant", content: "I processed your request." };
        setMessages([...updated, assistantMsg]);
      }
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  return (
    <div style={{
      minHeight: 660,
      maxHeight: 780,
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
        justifyContent: "space-between",
        alignItems: "center",
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
            <div style={{ color: "rgba(201,135,79,0.7)", fontSize: 11, letterSpacing: 1.5 }}>
              TOOL-POWERED • PROGRESS ENABLED
            </div>
          </div>
        </div>

        <button onClick={() => { setMessages([]); setCurrentQuiz(null); }} style={{
          background: "none", border: "none", color: "rgba(237,224,212,0.3)",
          fontSize: 11, cursor: "pointer",
        }}>
          CLEAR
        </button>
      </div>

      {/* Mode Tabs */}
      <div style={{
        display: "flex", gap: 8, padding: "10px 18px",
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
              padding: "6px 14px",
              color: mode === m.id ? "#C9874F" : "rgba(237,224,212,0.45)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 18px 8px" }}>
        {messages.length === 0 && !currentQuiz && (
          <div style={{ textAlign: "center", paddingTop: 40, color: "rgba(237,224,212,0.5)" }}>
            <div style={{ fontSize: 20, fontStyle: "italic" }}>Ready when you are, Amanda.</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>Progress tracking is now active</div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            marginBottom: 16,
          }}>
            <div style={{
              maxWidth: "72%",
              padding: "12px 16px",
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
              background: m.role === "user" 
                ? "linear-gradient(135deg, #C9874F, #A0522D)" 
                : "rgba(255,255,255,0.06)",
              color: m.role === "user" ? "#FFF8F2" : "#EDE0D4",
              fontSize: 15,
              lineHeight: 1.65,
              whiteSpace: "pre-wrap",
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {/* Render QuizRenderer when active */}
        {currentQuiz && (
          <div style={{ margin: "16px 0", background: "rgba(0,0,0,0.2)", borderRadius: 16, padding: 8 }}>
            <QuizRenderer 
              questions={currentQuiz.questions} 
              onComplete={currentQuiz.onComplete} 
            />
          </div>
        )}

        {loading && (
          <div style={{ padding: "12px 16px", color: "rgba(237,224,212,0.5)" }}>
            ARIA is thinking...
          </div>
        )}

        {error && <div style={{ color: "#F0A090", padding: "8px 12px" }}>{error}</div>}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: "12px 16px 16px",
        borderTop: "1px solid rgba(201,135,79,0.1)",
        background: "rgba(0,0,0,0.22)",
      }}>
        <div style={{
          display: "flex",
          gap: 8,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(201,135,79,0.22)",
          borderRadius: 16,
          padding: "8px 8px 8px 16px",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={`Ask ARIA (${mode} mode)...`}
            rows={1}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              color: "#EDE0D4",
              fontSize: 15,
              resize: "none",
              maxHeight: 100,
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: "none",
              background: input.trim() && !loading 
                ? "linear-gradient(135deg, #C9874F, #A0522D)" 
                : "rgba(255,255,255,0.08)",
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
