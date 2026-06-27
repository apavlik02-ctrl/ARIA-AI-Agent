import React from 'react';
import ReadinessWidget from './ReadinessWidget';
import StudyScheduleRenderer from './StudyScheduleRenderer';

interface ARIADashboardProps {
  userProgress: {
    current_readiness: number;
    weak_domains: string[];
    study_streak: number;
    last_quiz_score?: number;
    exam_date?: string;
    quiz_history?: Array<{
      date: string;
      score: number;
      domain_scores: Record<string, number>;
    }>;
  };
  userName?: string;
  studySchedule?: any;
  onStartQuiz: () => void;
  onViewFullSchedule: () => void;
  onOpenARIA: () => void;
}

export default function ARIADashboard({
  userProgress,
  userName,
  studySchedule,
  onStartQuiz,
  onViewFullSchedule,
  onOpenARIA,
}: ARIADashboardProps) {
  const recentQuizzes = userProgress.quiz_history?.slice(-3).reverse() || [];
  const displayName = userName || 'there';
  const daysUntilExam = userProgress.exam_date
    ? Math.max(0, Math.ceil((new Date(userProgress.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div style={{
      padding: "32px 24px",
      maxWidth: 1100,
      margin: "0 auto",
      color: "#EDE0D4",
    }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: "rgba(201,135,79,0.6)", letterSpacing: 2 }}>
          ARIA DASHBOARD
        </div>
        <div style={{ fontSize: 32, fontWeight: 600, marginTop: 4 }}>
          Welcome back, {displayName}
        </div>
        <div style={{ color: "rgba(237,224,212,0.5)", marginTop: 6 }}>
          {daysUntilExam !== null
            ? `${daysUntilExam} days until your exam • Keep it up`
            : 'Your insurance exam prep progress'}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
        <div>
          <ReadinessWidget 
            progress={userProgress} 
            onStartQuiz={onStartQuiz}
            onViewSchedule={onViewFullSchedule}
          />

          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#C9874F", marginBottom: 12, paddingLeft: 4 }}>
              RECENT ACTIVITY
            </div>

            {recentQuizzes.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recentQuizzes.map((quiz, index) => (
                  <div key={index} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,135,79,0.1)", borderRadius: 12, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14 }}>Quiz • {new Date(quiz.date).toLocaleDateString()}</div>
                      <div style={{ fontSize: 12, color: "rgba(237,224,212,0.5)" }}>{Object.keys(quiz.domain_scores).length} domains tested</div>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: quiz.score >= 70 ? "#4ade80" : "#fbbf24" }}>
                      {quiz.score}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,135,79,0.08)", borderRadius: 12, padding: 20, textAlign: "center", color: "rgba(237,224,212,0.4)" }}>
                No quizzes yet. Start your first diagnostic to see progress.
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,135,79,0.15)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#C9874F", marginBottom: 14 }}>QUICK ACTIONS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={onStartQuiz} style={{ width: "100%", background: "linear-gradient(135deg, #C9874F, #A0522D)", color: "white", border: "none", padding: "14px 18px", borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                ⚡ Start Diagnostic Quiz
              </button>
              <button onClick={onViewFullSchedule} style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "#EDE0D4", border: "1px solid rgba(201,135,79,0.2)", padding: "14px 18px", borderRadius: 12, fontSize: 15, cursor: "pointer" }}>
                📅 View Full Study Plan
              </button>
              <button onClick={onOpenARIA} style={{ width: "100%", background: "rgba(255,255,255,0.06)", color: "#EDE0D4", border: "1px solid rgba(201,135,79,0.2)", padding: "14px 18px", borderRadius: 12, fontSize: 15, cursor: "pointer" }}>
                💬 Talk to ARIA
              </button>
            </div>
          </div>

          {studySchedule && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#C9874F", marginBottom: 10, paddingLeft: 4 }}>NEXT 7 DAYS</div>
              <StudyScheduleRenderer scheduleData={studySchedule} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
