import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { BUCKETS, SUITORS } from '../../gameData.js';
import { Petals } from '../Common/Petals.jsx';
import { Ornament } from '../Common/Ornament.jsx';

export function HostFinale({ onReplay }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
    });
  }, []);

  return (
    <div
      className="screen bg-bfiw-dark bfiw-screen fade"
      style={{
        padding: '4vh 4vw 60px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflowY: 'auto',
      }}
    >
      <Petals count={26} />

      <div
        className="invite fade"
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          background: 'linear-gradient(160deg,rgba(90,0,0,.6),rgba(10,0,0,.85))',
          backdropFilter: 'blur(16px)',
          padding: 'clamp(36px,5vh,70px) clamp(30px,6vw,80px)',
          maxWidth: 1040,
          width: '100%',
          borderRadius: 24,
          border: '1px solid rgba(251,191,36,0.3)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: 10 }}>❤️</div>
        <h2 className="display" style={{ color: '#fff', fontSize: 'clamp(2.2rem,5vw,3.8rem)', lineHeight: 1 }}>
          The secret to wealth isn't finding "The One".
        </h2>
        <Ornament style={{ margin: '18px auto', maxWidth: 440 }} />
        <p className="serif ital" style={{ color: 'rgba(253,230,138,.92)', fontSize: '1.4rem', lineHeight: 1.4 }}>
          It's building a portfolio where every personality knows its role.
        </p>

        {/* The 3 Buckets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 28, textAlign: 'left' }}>
          {BUCKETS.map((b) => (
            <div
              key={b.id}
              style={{
                background: b.bg,
                padding: '20px',
                borderRadius: 16,
                border: `1.5px solid ${b.colorLt}44`,
                color: '#fff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.8rem' }}>{b.emoji}</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: b.colorLt }}>{b.name}</span>
              </div>
              <p style={{ fontSize: '0.82rem', marginTop: 10, opacity: 0.9, lineHeight: 1.4 }}>
                {b.purpose}
              </p>
              <div
                style={{
                  marginTop: 12,
                  padding: '6px 10px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: b.colorLt,
                }}
              >
                Rule: {b.rule}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 30,
            padding: '16px 32px',
            background: 'rgba(251,191,36,.12)',
            borderRadius: 999,
            display: 'inline-block',
            border: '1.5px solid rgba(251,191,36,.4)',
          }}
        >
          <div className="display" style={{ color: '#fbbf24', fontSize: '1.8rem', fontWeight: 700 }}>
            Welcome to Asset Allocation 💍
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          <button
            className="btn-wedding"
            onClick={onReplay}
            style={{ fontSize: '1.15rem', padding: '14px 48px' }}
          >
            Start New Game ➔
          </button>
        </div>
      </div>
    </div>
  );
}
