import React from 'react';
import { SUITORS, suitorVariant, suitorName, suitorPortrait } from '../../gameData.js';

export function PlayerGallery({ state, gender }) {
  const idx = state?.galleryIndex || 0;
  const suitor = SUITORS[idx];
  const variant = suitorVariant(gender, idx);

  if (!suitor) return null;

  return (
    <div
      className="player-bg screen"
      style={{
        minHeight: '100vh',
        padding: '20px 16px 40px',
        boxSizing: 'border-box',
        background: 'linear-gradient(180deg, #2b0008 0%, #150004 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div className="caps" style={{ fontSize: '.6rem', color: '#fbbf24', letterSpacing: '.2em' }}>
          Speed Dating · Suitor {idx + 1} of {SUITORS.length}
        </div>
        <h2 className="display" style={{ fontSize: '1.8rem', color: '#fff', margin: '4px 0' }}>
          {suitorName(suitor, variant)}
        </h2>
        <div style={{ fontSize: '0.8rem', color: suitor.accentLt, fontWeight: 700 }}>
          {suitor.aka}
        </div>
      </div>

      {/* Portrait */}
      <div
        style={{
          width: '100%',
          maxHeight: '280px',
          borderRadius: 18,
          overflow: 'hidden',
          border: `2px solid ${suitor.accent}`,
          marginBottom: 14,
        }}
      >
        <img
          src={suitorPortrait(suitor, variant)}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Info Card */}
      <div
        style={{
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: 16,
          border: '1px solid rgba(251,191,36,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, textAlign: 'center' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 8 }}>
            <div style={{ fontSize: '0.65rem', color: '#aaa' }}>RETURNS</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: suitor.accentLt }}>{suitor.returnLabel}</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 8 }}>
            <div style={{ fontSize: '0.65rem', color: '#aaa' }}>RISK</div>
            <div style={{ fontSize: '1rem', fontWeight: 800 }}>{suitor.riskLabel}</div>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', lineHeight: 1.4, color: 'rgba(255,255,255,0.9)' }}>
          {suitor.bio}
        </p>

        <div style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>
          <strong>🟢 Green:</strong> {(suitor.greenFlags || [])[0]}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#fecdd3' }}>
          <strong>🚩 Red:</strong> {(suitor.redFlags || [])[0]}
        </div>
      </div>
    </div>
  );
}
