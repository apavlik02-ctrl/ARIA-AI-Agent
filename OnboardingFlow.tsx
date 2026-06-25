import React, { useState } from 'react';

interface OnboardingFlowProps {
  onComplete: (data: any) => void;
  user?: any;
}

export default function OnboardingFlow({ onComplete, user }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    examType: '',
    state: '',
    examDate: '',
    currentReadiness: 50,
    weakAreas: [] as string[],
    studyTimePerDay: 45,
  });

  const examTypes = [
    'Life Insurance',
    'Accident & Health',
    'Life + Health Combined',
    'Property & Casualty',
    'Other',
  ];

  const commonStates = [
    'California', 'Texas', 'Florida', 'New York', 'Illinois', 
    'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'
  ];

  const weakAreaOptions = [
    'Life Insurance Types',
    'Policy Provisions & Riders',
    'Health Insurance / Managed Care',
    'Annuities',
    'Federal Tax Considerations',
    'Qualified Plans',
    'State Regulations',
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleWeakArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      weakAreas: prev.weakAreas.includes(area)
        ? prev.weakAreas.filter(a => a !== area)
        : [...prev.weakAreas, area]
    }));
  };

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const completeOnboarding = () => {
    // In real app, save to Supabase / create initial progress record
    onComplete({
      ...formData,
      completedAt: new Date().toISOString(),
    });
  };

  return (
    <div style={{
      maxWidth: 620,
      margin: '40px auto',
      padding: '40px 32px',
      background: '#1A120A',
      borderRadius: 20,
      border: '1px solid rgba(201,135,79,0.15)',
      color: '#EDE0D4',
    }}>
      {/* Progress Bar */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ 
          height: 4, 
          background: 'rgba(255,255,255,0.08)', 
          borderRadius: 999,
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(step / 5) * 100}%`,
            height: '100%',
            background: '#C9874F',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <div style={{ 
          textAlign: 'right', 
          fontSize: 12, 
          color: 'rgba(237,224,212,0.4)', 
          marginTop: 8 
        }}>
          Step {step} of 5
        </div>
      </div>

      {/* Step 1: Welcome */}
      {step === 1 && (
        <div>
          <h2 style={{ fontSize: 28, marginBottom: 12 }}>Welcome to ARIA</h2>
          <p style={{ color: 'rgba(237,224,212,0.7)', fontSize: 17, marginBottom: 32 }}>
            Let's get you set up with a personalized study experience.
          </p>
          <p style={{ marginBottom: 24 }}>
            This will only take a minute. We'll ask about your exam and create your starting point.
          </p>
          <button 
            onClick={nextStep}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: 16 }}
          >
            Let's get started →
          </button>
        </div>
      )}

      {/* Step 2: Exam Details */}
      {step === 2 && (
        <div>
          <h2 style={{ fontSize: 26, marginBottom: 24 }}>Tell us about your exam</h2>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#C9874F' }}>
              What exam are you preparing for?
            </label>
            <select 
              value={formData.examType}
              onChange={(e) => handleInputChange('examType', e.target.value)}
              style={{ width: '100%', padding: 14, background: '#2A2018', border: '1px solid #4A3C2E', borderRadius: 10, color: '#EDE0D4', fontSize: 15 }}
            >
              <option value="">Select exam type</option>
              {examTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#C9874F' }}>
              Which state are you testing in?
            </label>
            <select 
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              style={{ width: '100%', padding: 14, background: '#2A2018', border: '1px solid #4A3C2E', borderRadius: 10, color: '#EDE0D4', fontSize: 15 }}
            >
              <option value="">Select state</option>
              {commonStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
              <option value="Other">Other / Multiple States</option>
            </select>
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#C9874F' }}>
              Target exam date (optional)
            </label>
            <input 
              type="date" 
              value={formData.examDate}
              onChange={(e) => handleInputChange('examDate', e.target.value)}
              style={{ width: '100%', padding: 14, background: '#2A2018', border: '1px solid #4A3C2E', borderRadius: 10, color: '#EDE0D4', fontSize: 15 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={prevStep} className="btn-secondary" style={{ flex: 1, padding: '14px' }}>Back</button>
            <button 
              onClick={nextStep} 
              disabled={!formData.examType || !formData.state}
              className="btn-primary" 
              style={{ flex: 2, padding: '14px' }}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Self Assessment */}
      {step === 3 && (
        <div>
          <h2 style={{ fontSize: 26, marginBottom: 12 }}>How are you feeling about the exam?</h2>
          <p style={{ color: 'rgba(237,224,212,0.6)', marginBottom: 32 }}>
            This helps us create a better starting point. You can always update this later.
          </p>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', marginBottom: 12, fontSize: 14, color: '#C9874F' }}>
              Current estimated readiness
            </label>
            <input 
              type="range" 
              min="20" 
              max="90" 
              step="5"
              value={formData.currentReadiness}
              onChange={(e) => handleInputChange('currentReadiness', parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(237,224,212,0.5)' }}>
              <div>Just starting</div>
              <div style={{ fontWeight: 600, color: '#C9874F' }}>{formData.currentReadiness}%</div>
              <div>Very confident</div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 12, fontSize: 14, color: '#C9874F' }}>
              Which areas feel weakest? (Select all that apply)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {weakAreaOptions.map(area => (
                <button
                  key={area}
                  onClick={() => toggleWeakArea(area)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 999,
                    border: formData.weakAreas.includes(area) 
                      ? '1px solid #C9874F' 
                      : '1px solid rgba(201,135,79,0.2)',
                    background: formData.weakAreas.includes(area) 
                      ? 'rgba(201,135,79,0.15)' 
                      : 'transparent',
                    color: formData.weakAreas.includes(area) ? '#C9874F' : '#EDE0D4',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
            <button onClick={prevStep} className="btn-secondary" style={{ flex: 1, padding: '14px' }}>Back</button>
            <button onClick={nextStep} className="btn-primary" style={{ flex: 2, padding: '14px' }}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 4: Study Habits */}
      {step === 4 && (
        <div>
          <h2 style={{ fontSize: 26, marginBottom: 24 }}>How much time can you study?</h2>
          
          <div style={{ marginBottom: 40 }}>
            <label style={{ display: 'block', marginBottom: 12, fontSize: 14, color: '#C9874F' }}>
              Average study time per day
            </label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[30, 45, 60, 90].map(minutes => (
                <button
                  key={minutes}
                  onClick={() => handleInputChange('studyTimePerDay', minutes)}
                  style={{
                    flex: 1,
                    minWidth: 100,
                    padding: '14px',
                    borderRadius: 12,
                    background: formData.studyTimePerDay === minutes 
                      ? 'rgba(201,135,79,0.2)' 
                      : 'rgba(255,255,255,0.04)',
                    border: formData.studyTimePerDay === minutes 
                      ? '1px solid #C9874F' 
                      : '1px solid rgba(201,135,79,0.15)',
                    color: '#EDE0D4',
                    cursor: 'pointer',
                  }}
                >
                  {minutes} min
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={prevStep} className="btn-secondary" style={{ flex: 1, padding: '14px' }}>Back</button>
            <button onClick={nextStep} className="btn-primary" style={{ flex: 2, padding: '14px' }}>Create my plan →</button>
          </div>
        </div>
      )}

      {/* Step 5: Summary & Launch */}
      {step === 5 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <h2 style={{ fontSize: 26, marginBottom: 12 }}>Your personalized plan is ready</h2>
          <p style={{ color: 'rgba(237,224,212,0.7)', marginBottom: 32 }}>
            Based on what you shared, we've created your starting point.
          </p>

          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: 12, 
            padding: 24, 
            textAlign: 'left',
            marginBottom: 32 
          }}>
            <div style={{ marginBottom: 12 }}><strong>Exam:</strong> {formData.examType} • {formData.state}</div>
            <div style={{ marginBottom: 12 }}><strong>Starting Readiness:</strong> {formData.currentReadiness}%</div>
            <div style={{ marginBottom: 12 }}><strong>Daily Study Time:</strong> {formData.studyTimePerDay} minutes</div>
            {formData.weakAreas.length > 0 && (
              <div><strong>Focus Areas:</strong> {formData.weakAreas.join(', ')}</div>
            )}
          </div>

          <button 
            onClick={completeOnboarding}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: 17 }}
          >
            Start my first quiz →
          </button>
          
          <p style={{ fontSize: 13, color: 'rgba(237,224,212,0.4)', marginTop: 16 }}>
            You can always update your preferences later in settings.
          </p>
        </div>
      )}
    </div>
  );
}
