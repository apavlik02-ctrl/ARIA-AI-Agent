'use client';

import React, { useState } from 'react';

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York','North Carolina',
  'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
];

interface OnboardingResult {
  exam_date: string;
  state: string;
  exam_type: string;
  comfort_level: number;
}

interface OnboardingModalProps {
  onComplete: (data: OnboardingResult) => void;
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [examDate, setExamDate] = useState('');
  const [state, setState] = useState('');
  const [examType, setExamType] = useState('Life & Health');
  const [comfort, setComfort] = useState(2);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 3);
  const minDateStr = minDate.toISOString().split('T')[0];

  function handleFinish() {
    onComplete({ exam_date: examDate, state, exam_type: examType, comfort_level: comfort });
  }

  const comfortLabels = ['Very new to this', 'Some background', 'Moderate knowledge', 'Fairly confident', 'Almost ready'];
  const comfortColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: '#1A1008', border: '1px solid rgba(201,135,79,0.3)', borderRadius: 24, width: '100%', maxWidth: 480, padding: '36px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #C9874F, #7B3910)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>A</div>
            <span style={{ color: '#EDE0D4', fontWeight: 600, letterSpacing: 2, fontSize: 14 }}>ARIA</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3].map(n => (
              <div key={n} style={{ width: 28, height: 4, borderRadius: 2, background: n <= step ? '#C9874F' : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>
        </div>

        {step === 1 && (
          <>
            <h2 style={{ color: '#EDE0D4', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>When is your exam?</h2>
            <p style={{ color: 'rgba(237,224,212,0.55)', fontSize: 14, marginBottom: 24 }}>ARIA will build your study plan around this date.</p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'rgba(237,224,212,0.6)', marginBottom: 8 }}>Exam date</label>
              <input type="date" value={examDate} min={minDateStr} onChange={e => setExamDate(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 16px', color: '#EDE0D4', fontSize: 15, outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }} />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'rgba(237,224,212,0.6)', marginBottom: 8 }}>State</label>
              <select value={state} onChange={e => setState(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 16px', color: state ? '#EDE0D4' : 'rgba(237,224,212,0.35)', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}>
                <option value="" disabled>Select your state</option>
                {US_STATES.map(s => <option key={s} value={s} style={{ background: '#1A1008' }}>{s}</option>)}
              </select>
            </div>
            <button onClick={() => setStep(2)} disabled={!examDate || !state}
              style={{ width: '100%', padding: '14px', borderRadius: 14, background: examDate && state ? 'linear-gradient(135deg, #C9874F, #A0522D)' : 'rgba(255,255,255,0.07)', color: examDate && state ? 'white' : 'rgba(237,224,212,0.3)', border: 'none', fontSize: 15, fontWeight: 500, cursor: examDate && state ? 'pointer' : 'not-allowed' }}>
              Continue →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ color: '#EDE0D4', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>What are you studying for?</h2>
            <p style={{ color: 'rgba(237,224,212,0.55)', fontSize: 14, marginBottom: 24 }}>Choose your license type.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {['Life & Health', 'Life Only', 'Health Only', 'Property & Casualty'].map(type => (
                <button key={type} onClick={() => setExamType(type)} style={{ padding: '14px 18px', borderRadius: 12, textAlign: 'left', fontSize: 15, background: examType === type ? 'rgba(201,135,79,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${examType === type ? '#C9874F' : 'rgba(255,255,255,0.1)'}`, color: examType === type ? '#C9874F' : '#EDE0D4', cursor: 'pointer' }}>
                  {type}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', color: '#EDE0D4', border: '1px solid rgba(255,255,255,0.1)', fontSize: 15, cursor: 'pointer' }}>← Back</button>
              <button onClick={() => setStep(3)} style={{ flex: 2, padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg, #C9874F, #A0522D)', color: 'white', border: 'none', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>Continue →</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={{ color: '#EDE0D4', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>How ready do you feel?</h2>
            <p style={{ color: 'rgba(237,224,212,0.55)', fontSize: 14, marginBottom: 28 }}>Be honest — ARIA will calibrate your starting readiness.</p>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {comfortLabels.map((label, i) => (
                  <button key={i} onClick={() => setComfort(i + 1)} style={{ padding: '13px 18px', borderRadius: 12, textAlign: 'left', fontSize: 14, background: comfort === i + 1 ? 'rgba(201,135,79,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${comfort === i + 1 ? comfortColors[i] : 'rgba(255,255,255,0.08)'}`, color: comfort === i + 1 ? comfortColors[i] : 'rgba(237,224,212,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16 }}>{'●'.repeat(i + 1).split('').join(' ')}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', color: '#EDE0D4', border: '1px solid rgba(255,255,255,0.1)', fontSize: 15, cursor: 'pointer' }}>← Back</button>
              <button onClick={handleFinish} style={{ flex: 2, padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg, #C9874F, #A0522D)', color: 'white', border: 'none', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>Build my plan →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
