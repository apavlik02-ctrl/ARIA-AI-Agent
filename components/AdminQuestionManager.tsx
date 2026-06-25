import React, { useState } from 'react';

interface Question {
  id: number;
  domain: string;
  difficulty: string;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
  know_this: string;
}

interface AdminQuestionManagerProps {
  initialQuestions?: Question[];
  onQuestionsChange?: (questions: Question[]) => void;
}

export default function AdminQuestionManager({ 
  initialQuestions = [], 
  onQuestionsChange 
}: AdminQuestionManagerProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [showForm, setShowForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    domain: "life_types",
    difficulty: "medium",
    options: ["", "", "", ""],
  });

  const domains = [
    "life_types", "policy_provisions", "health_insurance", 
    "riders", "regulations", "annuities", "federal_tax", "qualified_plans"
  ];

  const addQuestion = () => {
    if (!newQuestion.question || !newQuestion.correct) return;

    const questionToAdd: Question = {
      id: Date.now(),
      domain: newQuestion.domain || "life_types",
      difficulty: newQuestion.difficulty || "medium",
      question: newQuestion.question,
      options: newQuestion.options || ["", "", "", ""],
      correct: newQuestion.correct,
      explanation: newQuestion.explanation || "",
      know_this: newQuestion.know_this || "",
    };

    const updated = [...questions, questionToAdd];
    setQuestions(updated);
    onQuestionsChange?.(updated);
    
    // Reset form
    setNewQuestion({
      domain: "life_types",
      difficulty: "medium",
      options: ["", "", "", ""],
    });
    setShowForm(false);
  };

  return (
    <div style={{ padding: 24, background: "#1A120A", color: "#EDE0D4", borderRadius: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Question Bank Manager</div>
          <div style={{ fontSize: 13, color: "rgba(201,135,79,0.6)" }}>
            {questions.length} questions • For ARIA tool system
          </div>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{
            background: "#C9874F",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          {showForm ? "Cancel" : "+ Add Question"}
        </button>
      </div>

      {/* Add Question Form */}
      {showForm && (
        <div style={{ 
          background: "rgba(255,255,255,0.03)", 
          padding: 20, 
          borderRadius: 12, 
          marginBottom: 24,
          border: "1px solid rgba(201,135,79,0.15)"
        }}>
          <div style={{ display: "grid", gap: 12 }}>
            <input
              placeholder="Question text"
              value={newQuestion.question || ""}
              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
              style={{ padding: 10, background: "#2A2018", border: "1px solid #4A3C2E", color: "#EDE0D4", borderRadius: 6 }}
            />

            <div style={{ display: "flex", gap: 8 }}>
              <select 
                value={newQuestion.domain} 
                onChange={(e) => setNewQuestion({ ...newQuestion, domain: e.target.value })}
                style={{ flex: 1, padding: 10, background: "#2A2018", border: "1px solid #4A3C2E", color: "#EDE0D4", borderRadius: 6 }}
              >
                {domains.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select 
                value={newQuestion.difficulty} 
                onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                style={{ padding: 10, background: "#2A2018", border: "1px solid #4A3C2E", color: "#EDE0D4", borderRadius: 6 }}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {[0,1,2,3].map(i => (
              <input
                key={i}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                value={newQuestion.options?.[i] || ""}
                onChange={(e) => {
                  const opts = [...(newQuestion.options || ["","","",""])];
                  opts[i] = e.target.value;
                  setNewQuestion({ ...newQuestion, options: opts });
                }}
                style={{ padding: 10, background: "#2A2018", border: "1px solid #4A3C2E", color: "#EDE0D4", borderRadius: 6 }}
              />
            ))}

            <input
              placeholder="Correct answer (A, B, C, or D)"
              value={newQuestion.correct || ""}
              onChange={(e) => setNewQuestion({ ...newQuestion, correct: e.target.value.toUpperCase() })}
              style={{ padding: 10, background: "#2A2018", border: "1px solid #4A3C2E", color: "#EDE0D4", borderRadius: 6 }}
            />

            <textarea
              placeholder="Explanation"
              value={newQuestion.explanation || ""}
              onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
              style={{ padding: 10, background: "#2A2018", border: "1px solid #4A3C2E", color: "#EDE0D4", borderRadius: 6, minHeight: 60 }}
            />

            <button 
              onClick={addQuestion}
              style={{
                background: "#4ade80",
                color: "#1A120A",
                border: "none",
                padding: "12px",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Add to Question Bank
            </button>
          </div>
        </div>
      )}

      {/* Question List */}
      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        {questions.length === 0 ? (
          <div style={{ color: "rgba(237,224,212,0.4)", textAlign: "center", padding: 40 }}>
            No questions yet. Add some above.
          </div>
        ) : (
          questions.map((q, index) => (
            <div key={index} style={{
              background: "rgba(255,255,255,0.02)",
              padding: 14,
              borderRadius: 10,
              marginBottom: 8,
              border: "1px solid rgba(201,135,79,0.08)",
            }}>
              <div style={{ fontSize: 13, color: "#C9874F", marginBottom: 4 }}>
                {q.domain} • {q.difficulty}
              </div>
              <div style={{ fontSize: 15, marginBottom: 8 }}>{q.question}</div>
              <div style={{ fontSize: 12, color: "rgba(237,224,212,0.5)" }}>
                Correct: {q.correct} • {q.know_this}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
