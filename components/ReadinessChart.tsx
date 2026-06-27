import React from 'react';

interface QuizEntry {
  date: string;
  score: number;
}

interface ReadinessChartProps {
  quizHistory: QuizEntry[];
  currentReadiness: number;
}

export default function ReadinessChart({ quizHistory, currentReadiness }: ReadinessChartProps) {
  if (quizHistory.length < 2) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(201,135,79,0.08)',
        borderRadius: 16,
        padding: '24px 20px',
        textAlign: 'center',
        color: 'rgba(237,224,212,0.35)',
        fontSize: 13,
      }}>
        Take 2+ quizzes to see your progress chart.
      </div>
    );
  }

  const W = 480;
  const H = 120;
  const PAD = { top: 12, right: 16, bottom: 24, left: 32 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const points: { date: string; score: number }[] = [
    ...quizHistory.map(q => ({ date: q.date, score: q.score })),
  ];

  const minScore = Math.max(0, Math.min(...points.map(p => p.score)) - 10);
  const maxScore = Math.min(100, Math.max(...points.map(p => p.score)) + 10);
  const range = maxScore - minScore || 20;

  const toX = (i: number) => PAD.left + (i / (points.length - 1)) * innerW;
  const toY = (score: number) => PAD.top + innerH - ((score - minScore) / range) * innerH;

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(p.score).toFixed(1)}`)
    .join(' ');

  const areaD = `${pathD} L ${toX(points.length - 1).toFixed(1)} ${(PAD.top + innerH).toFixed(1)} L ${PAD.left.toFixed(1)} ${(PAD.top + innerH).toFixed(1)} Z`;

  const latest = points[points.length - 1];
  const first = points[0];
  const delta = Math.round(latest.score - first.score);
  const trend = delta > 0 ? `+${delta}` : `${delta}`;
  const trendColor = delta >= 0 ? '#4ade80' : '#f87171';

  const yLabels = [minScore, Math.round((minScore + maxScore) / 2), maxScore];

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(30,20,12,0.95), rgba(20,12,8,0.95))',
      border: '1px solid rgba(201,135,79,0.15)',
      borderRadius: 16,
      padding: '20px 20px 16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'rgba(201,135,79,0.7)', letterSpacing: 1.5 }}>READINESS TREND</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: trendColor, fontWeight: 600 }}>{trend}% overall</span>
          <span style={{ fontSize: 12, color: 'rgba(237,224,212,0.3)' }}>{points.length} quizzes</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9874F" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#C9874F" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yLabels.map((val, i) => {
          const y = toY(val);
          return (
            <g key={i}>
              <line
                x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y}
                stroke="rgba(255,255,255,0.06)" strokeWidth="1"
              />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fill="rgba(237,224,212,0.3)" fontSize="9">
                {Math.round(val)}
              </text>
            </g>
          );
        })}

        {70 >= minScore && 70 <= maxScore && (
          <g>
            <line
              x1={PAD.left} y1={toY(70)} x2={PAD.left + innerW} y2={toY(70)}
              stroke="rgba(74,222,128,0.25)" strokeWidth="1" strokeDasharray="4 3"
            />
            <text x={PAD.left + innerW + 4} y={toY(70) + 4} fill="rgba(74,222,128,0.5)" fontSize="9">
              70%
            </text>
          </g>
        )}

        <path d={areaD} fill="url(#chartFill)" />
        <path d={pathD} fill="none" stroke="#C9874F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={toX(i)}
            cy={toY(p.score)}
            r={i === points.length - 1 ? 4 : 3}
            fill={i === points.length - 1 ? '#C9874F' : 'rgba(201,135,79,0.6)'}
            stroke="#1A1008"
            strokeWidth="1.5"
          />
        ))}

        <text x={toX(0)} y={H - 4} textAnchor="middle" fill="rgba(237,224,212,0.3)" fontSize="9">
          {new Date(points[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </text>
        <text x={toX(points.length - 1)} y={H - 4} textAnchor="middle" fill="rgba(237,224,212,0.3)" fontSize="9">
          {new Date(points[points.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </text>
      </svg>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize: 12, color: 'rgba(237,224,212,0.4)' }}>Current readiness</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: currentReadiness >= 70 ? '#4ade80' : '#C9874F' }}>
          {currentReadiness}%
        </span>
      </div>
    </div>
  );
}
