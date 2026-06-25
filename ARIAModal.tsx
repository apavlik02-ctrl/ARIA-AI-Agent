import React, { useState } from 'react';
import ARIAAgentWithQuiz from './aria-agent-with-quiz';

interface ARIAModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any; // Clerk user object
  initialMode?: 'study' | 'quiz' | 'coach';
}

export default function ARIAModal({ isOpen, onClose, user, initialMode = 'study' }: ARIAModalProps) {
  const [mode, setMode] = useState(initialMode);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 10, 7, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: 820,
          maxHeight: '92vh',
          background: 'linear-gradient(160deg, #1A120A 0%, #231509 60%, #1C100A 100%)',
          borderRadius: 24,
          border: '1px solid rgba(201,135,79,0.2)',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(201,135,79,0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #C9874F, #7B3910)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#FFF8F2', fontSize: 14, fontWeight: 700 }}>A</span>
            </div>
            <div>
              <div style={{ color: '#EDE0D4', fontSize: 17, fontWeight: 600, letterSpacing: 2 }}>ARIA</div>
              <div style={{ color: 'rgba(201,135,79,0.6)', fontSize: 11, letterSpacing: 1.5 }}>
                WISCONSIN LIFE + PASSPRO
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(201,135,79,0.2)',
              color: '#EDE0D4',
              padding: '6px 14px',
              borderRadius: 999,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>

        {/* ARIA Chat Component */}
        <div style={{ height: 'calc(92vh - 70px)', overflow: 'hidden' }}>
          <ARIAAgentWithQuiz user={user} />
        </div>
      </div>
    </div>
  );
}
