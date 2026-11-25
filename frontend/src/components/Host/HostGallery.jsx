import React from 'react';
import { SUITORS } from '../../gameData.js';
import { SuitorBioCard } from '../Common/SuitorBioCard.jsx';

export function HostGallery({ state, onAdvance, onStartVoting }) {
  const idx = state?.galleryIndex || 0;
  const suitor = SUITORS[idx];
  const isLast = idx >= SUITORS.length - 1;

  return (
    <div
      className="screen bg-bfiw-ivory bfiw-screen fade"
      style={{
        padding: '2.5vh 3vw 60px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div className="caps" style={{ fontSize: '.6rem', color: '#b45309' }}>
            Speed Dating · The Biodata Folder
          </div>
          <h2 className="display" style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', color: '#9b1c1c', marginTop: 2 }}>
            Meet the Suitors
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6 }}>
            {SUITORS.map((s, i) => (
              <div
                key={s.id}
                style={{
                  width: i === idx ? 28 : 10,
                  height: 10,
                  borderRadius: 999,
                  background: i < idx ? '#059669' : i === idx ? s.accent : 'rgba(0,0,0,0.15)',
                  transition: 'all .3s ease',
                }}
              />
            ))}
          </div>

          <div className="caps" style={{ fontSize: '.8rem', color: '#9b1c1c', fontWeight: 800 }}>
            {idx + 1} of {SUITORS.length}
          </div>
        </div>
      </div>

      {/* Main Biodata card */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'stretch' }}>
        <SuitorBioCard suitor={suitor} variant="both" />
      </div>

      {/* Bottom Controls */}
      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={onStartVoting}
          style={{
            background: 'transparent',
            border: '1px solid rgba(155,28,28,0.3)',
            color: '#9b1c1c',
            padding: '8px 20px',
            borderRadius: 999,
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Skip to Voting 🗳️
        </button>

        <div style={{ display: 'flex', gap: 12 }}>
          {!isLast && (
            <button className="btn-wedding" onClick={onAdvance} style={{ fontSize: '1rem', padding: '12px 30px' }}>
              Next Suitor &nbsp;➔
            </button>
          )}
          <button
            className="btn-wedding"
            onClick={onStartVoting}
            style={{
              fontSize: '1rem',
              padding: '12px 30px',
              background: '#059669',
            }}
          >
            Start Voting Now &nbsp;🗳️
          </button>
        </div>
      </div>
    </div>
  );
}
