import React from 'react';

interface ReadinessWidgetProps {
  progress: {
    current_readiness: number;
    weak_domains: string[];
    study_streak: number;
    last_quiz_score?: number;
    exam_date?: string;
  };
  onStartQuiz?: () => void;
  onViewSchedule?: () => void;
}

export default function ReadinessWidget({ progress, onStartQuiz, onViewSchedule }: ReadinessWidgetProps) {
  const { current_readiness, weak_domains, study_streak, last_quiz_score, exam_date } = progress;

  const getReadinessColor = (score: number) => {
    if (score >= 80) return '#4ade80';
    if (score >= 65) return '#fbbf24';
    return '#f87171';
  };

  return (
    <div style={{
      background: "linear-gradient(145deg, rgba(30,20,12,0.95), rgba(20,12,8,0.95))",
      border: "1px solid rgba(201,135,79,0.2)",
      borderRadius: 20,
      padding: 24,
      color: "#EDE0D4",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, color: "rgba(201,135,79,0.6)", letterSpacing: 1 }}>YOUR PROGRESS</div>
          <div style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>
            {current_readiness}%
          </div>
          <div style={{ fontSize: 13, color: "rgba(237,224,212,0.5)" }}>
            Overall Readiness
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: 6,
            background: "rgba(201,135,79,0.1)",
            padding: "4px 12px",
            borderRadius: 999,
            fontSize: 13,
          }}>
            🔥 {study_streak} day streak
          </div>
          {last_quiz_score && (
            <div style={{ fontSize: 12, color: "rgba(237,224,212,0.4)", marginTop: 6 }}>
              Last quiz: {last_quiz_score}%
            </div>
          )}
        </div>
      </div>

      {/* Readiness Bar */}
      <div style={{ 
        height: 8, 
        background: "rgba(255,255,255,0.08)", 
        borderRadius: 999, 
        marginBottom: 20,
        overflow: "hidden"
      }}>
        <div style={{
          width: `${current_readiness}%`,
          height: "100%",
          background: getReadinessColor(current_readiness),
          transition: "width 0.4s ease",
        }} />
      </div>

      {/* Weak Domains */}
      {weak_domains?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "rgba(201,135,79,0.6)", marginBottom: 6 }}>
            FOCUS AREAS
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {weak_domains.map((domain, i) => (
              <a
                key={i}
                href={`/quiz?domains=${domain}&count=5&autostart=1`}
                title="Drill down on this topic →"
                style={{
                  background: "rgba(248,113,113,0.15)",
                  color: "#f87171",
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontSize: 12,
                  textDecoration: "none",
                  border: "1px solid transparent",
                  cursor: "pointer",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "#f87171";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(248,113,113,0.25)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(248,113,113,0.15)";
                }}
              >
                {domain.replace(/_/g, " ")} →
              </a>
            ))}
          </div>
          <div style={{ fontSize: 10, color: "rgba(237,224,212,0.25)", marginTop: 6 }}>
            Click any area to drill down with 5 focused questions
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        {onStartQuiz && (
          <button 
            onClick={onStartQuiz}
            style={{
              flex: 1,
              background: "linear-gradient(135deg, #C9874F, #A0522D)",
              color: "white",
              border: "none",
              padding: "12px 16px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Start Diagnostic Quiz
          </button>
        )}
        {onViewSchedule && (
          <button 
            onClick={onViewSchedule}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.06)",
              color: "#EDE0D4",
              border: "1px solid rgba(201,135,79,0.2)",
              padding: "12px 16px",
              borderRadius: 12,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            View Study Plan
          </button>
        )}
      </div>

      {exam_date && (
        <div style={{ 
          fontSize: 12, 
          color: "rgba(237,224,212,0.35)", 
          textAlign: "center", 
          marginTop: 16 
        }}>
          Exam date: {new Date(exam_date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
