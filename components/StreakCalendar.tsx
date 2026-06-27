import React from 'react';

interface StreakCalendarProps {
  quizHistory: Array<{ date: string }>;
  studyStreak: number;
}

export default function StreakCalendar({ quizHistory, studyStreak }: StreakCalendarProps) {
  const WEEKS = 15;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const studiedDates = new Set(quizHistory.map(q => q.date.slice(0, 10)));

  const totalDays = WEEKS * 7;
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - totalDays + 1);

  const days: { date: Date; dateStr: string; studied: boolean; isToday: boolean; isFuture: boolean }[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      date: d,
      dateStr,
      studied: studiedDates.has(dateStr),
      isToday: dateStr === today.toISOString().slice(0, 10),
      isFuture: d > today,
    });
  }

  const weeks: typeof days[] = [];
  for (let i = 0; i < WEEKS; i++) {
    weeks.push(days.slice(i * 7, i * 7 + 7));
  }

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const totalStudied = studiedDates.size;

  function cellColor(day: typeof days[0]) {
    if (day.isFuture) return 'rgba(255,255,255,0.03)';
    if (day.isToday && day.studied) return '#C9874F';
    if (day.isToday) return 'rgba(201,135,79,0.25)';
    if (day.studied) return 'rgba(201,135,79,0.65)';
    return 'rgba(255,255,255,0.05)';
  }

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(30,20,12,0.95), rgba(20,12,8,0.95))',
      border: '1px solid rgba(201,135,79,0.15)',
      borderRadius: 16,
      padding: '20px 20px 16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'rgba(201,135,79,0.7)', letterSpacing: 1.5 }}>STUDY STREAK</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'rgba(237,224,212,0.4)' }}>{totalStudied} days studied</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: studyStreak > 0 ? '#C9874F' : 'rgba(237,224,212,0.3)' }}>
            🔥 {studyStreak} day streak
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 3 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginRight: 4 }}>
          {DAY_LABELS.map((label, i) => (
            <div
              key={label}
              style={{
                height: 11,
                fontSize: 8,
                color: 'rgba(237,224,212,0.25)',
                lineHeight: '11px',
                visibility: i % 2 === 1 ? 'visible' : 'hidden',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map((day, di) => (
              <div
                key={di}
                title={`${day.dateStr}${day.studied ? ' — studied' : ''}`}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 2,
                  background: cellColor(day),
                  border: day.isToday ? '1px solid rgba(201,135,79,0.6)' : 'none',
                  boxSizing: 'border-box',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 9, color: 'rgba(237,224,212,0.25)' }}>Less</span>
        {['rgba(255,255,255,0.05)', 'rgba(201,135,79,0.25)', 'rgba(201,135,79,0.5)', '#C9874F'].map((c, i) => (
          <div key={i} style={{ width: 9, height: 9, borderRadius: 2, background: c }} />
        ))}
        <span style={{ fontSize: 9, color: 'rgba(237,224,212,0.25)' }}>More</span>
      </div>
    </div>
  );
}
