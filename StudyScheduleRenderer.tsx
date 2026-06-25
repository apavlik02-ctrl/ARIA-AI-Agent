import React from 'react';

interface ScheduleItem {
  day: number;
  date: string;
  focus_domains: string[];
  minutes: number;
  event: string;
  spaced_repetition: boolean;
}

interface StudyScheduleRendererProps {
  scheduleData: {
    exam_date: string;
    days_until_exam: number;
    starting_readiness: number;
    target_readiness: number;
    daily_minutes: number;
    weak_domains_focus: string[];
    schedule: ScheduleItem[];
  };
}

export default function StudyScheduleRenderer({ scheduleData }: StudyScheduleRendererProps) {
  if (!scheduleData || !scheduleData.schedule) {
    return <div>No schedule available.</div>;
  }

  const { exam_date, days_until_exam, starting_readiness, target_readiness, schedule } = scheduleData;

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(201,135,79,0.15)",
      borderRadius: 16,
      padding: 20,
      margin: "16px 0",
    }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: "#C9874F", fontSize: 15, fontWeight: 600 }}>
          Personalized Study Schedule
        </div>
        <div style={{ fontSize: 13, color: "rgba(237,224,212,0.6)", marginTop: 4 }}>
          {days_until_exam} days until exam • Target: {target_readiness}% readiness
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
        {schedule.slice(0, 14).map((item, index) => (
          <div 
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              background: item.event.includes("Simulation") 
                ? "rgba(201,135,79,0.12)" 
                : "rgba(255,255,255,0.02)",
              borderRadius: 10,
              border: item.event.includes("Simulation") 
                ? "1px solid rgba(201,135,79,0.3)" 
                : "1px solid rgba(201,135,79,0.08)",
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                Day {item.day} — {item.date}
              </div>
              <div style={{ fontSize: 12, color: "rgba(237,224,212,0.5)", marginTop: 2 }}>
                {item.focus_domains.join(", ")} • {item.minutes} min
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ 
                fontSize: 12, 
                color: item.event.includes("Simulation") ? "#C9874F" : "rgba(237,224,212,0.6)",
                fontWeight: item.event.includes("Simulation") ? 600 : 400,
              }}>
                {item.event}
              </div>
              {item.spaced_repetition && (
                <div style={{ fontSize: 10, color: "rgba(201,135,79,0.5)" }}>
                  Spaced Repetition
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {schedule.length > 14 && (
        <div style={{ 
          textAlign: "center", 
          fontSize: 12, 
          color: "rgba(237,224,212,0.4)", 
          marginTop: 12 
        }}>
          + {schedule.length - 14} more days in full schedule
        </div>
      )}
    </div>
  );
}
