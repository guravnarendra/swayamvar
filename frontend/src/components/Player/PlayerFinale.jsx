import React from 'react';
import { ROUNDS, SUITORS, suitorVariant, suitorName } from '../../gameData.js';

export function PlayerFinale({ myVotes, player }) {
  const gender = player?.gender || 'P';

  return (
    <div
      className="player-bg screen"
      style={{
        minHeight: '100vh',
        padding: '24px 16px 40px',
        boxSizing: 'border-box',
        background: 'linear-gradient(180deg, #3b0008 0%, #150004 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: '2rem', marginBottom: 4 }}>💍</div>
        <div className="caps" style={{ fontSize: '.6rem', color: '#fbbf24', letterSpacing: '.2em' }}>
          Grand Finale · Your Portfolio
        </div>
        <h2 className="display" style={{ fontSize: '2rem', color: '#fbbf24', margin: '4px 0' }}>
          {player?.displayName || player?.name}'s Matches
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {ROUNDS.map((r) => {
          const suitorId = myVotes[r.id];
          const suitor = SUITORS.find((s) => s.id === suitorId);
          const variant = suitor ? suitorVariant(gender, SUITORS.indexOf(suitor)) : 'm';

          return (
            <div
              key={r.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(251,191,36,0.2)',
              }}
            >
              <span style={{ fontSize: '1.6rem' }}>{suitor?.monogram || '—'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.65rem', color: 'rgba(253,230,138,0.8)' }}>
                  {r.emoji} {r.question}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: suitor ? suitor.accentLt : '#aaa' }}>
                  {suitor ? suitorName(suitor, variant) : 'No vote'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 24,
          padding: 16,
          borderRadius: 16,
          background: 'rgba(251,191,36,0.1)',
          border: '1px solid rgba(251,191,36,0.3)',
          textAlign: 'center',
        }}
      >
        <p className="serif ital" style={{ margin: 0, fontSize: '0.95rem', color: '#fde68a', lineHeight: 1.4 }}>
          "The secret to wealth isn't finding The One.<br />
          It's building a portfolio where every personality knows its role."
        </p>
      </div>
    </div>
  );
}
