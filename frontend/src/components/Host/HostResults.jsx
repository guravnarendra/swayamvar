import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ROUNDS, SUITORS } from '../../gameData.js';

export function HostResults({ state, onNext }) {
  const round = ROUNDS[state?.roundIndex || 0];
  const players = Object.values(state?.players || {});
  const roundVotes = (state?.votes || {})[round.id] || {};
  const isLast = (state?.roundIndex || 0) >= ROUNDS.length - 1;

  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  // Tally votes
  const tallies = SUITORS.map((s) => {
    const count = Object.values(roundVotes).filter((id) => id === s.id).length;
    return { suitor: s, count };
  }).sort((a, b) => b.count - a.count);

  return (
    <div
      className="screen bg-bfiw-ivory bfiw-screen fade"
      style={{
        padding: '3vh 4vw 60px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <span className="caps" style={{ fontSize: '.75rem', color: '#b45309' }}>
            {round.emoji} {round.question}
          </span>
          <h2 className="display" style={{ fontSize: 'clamp(2rem,3.5vw,3rem)', color: '#9b1c1c', marginTop: 2 }}>
            The Verdict & Discussion
          </h2>
        </div>

        <button className="btn-wedding" onClick={onNext} style={{ fontSize: '1rem', padding: '12px 32px' }}>
          {isLast ? 'Go to Grand Finale 🚀' : 'Next Question ➔'}
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 24, minHeight: 0 }}>
        {/* Left: Tally & Individual player votes */}
        <div style={{ flex: '1 1 55%', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
          {/* Top Tally Bars */}
          <div style={{ background: '#fff', padding: 20, borderRadius: 18, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#9b1c1c', fontWeight: 800 }}>
              {round.leaderboardTitle || 'Vote Leaderboard'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tallies.map(({ suitor, count }) => {
                const pct = players.length > 0 ? (count / players.length) * 100 : 0;
                return (
                  <div key={suitor.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '1.4rem', width: 30 }}>{suitor.monogram}</span>
                    <span style={{ width: 140, fontWeight: 700, fontSize: '0.85rem' }}>{suitor.name}</span>
                    <div style={{ flex: 1, background: '#f3f4f6', height: 18, borderRadius: 999, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: suitor.accent,
                          transition: 'width 0.8s ease',
                        }}
                      />
                    </div>
                    <span style={{ fontWeight: 800, width: 35, textAlign: 'right', fontSize: '0.9rem' }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Individual Player Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {players.map((p) => {
              const votedSuitorId = roundVotes[p.id];
              const suitor = SUITORS.find((s) => s.id === votedSuitorId);
              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 16px',
                    borderRadius: 14,
                    background: '#fff',
                    border: `1.5px solid ${p.color || '#fbbf24'}33`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.2rem' }}>{p.titleEmoji || '👤'}</span>
                    <span style={{ fontWeight: 700, color: '#1a0505', fontSize: '0.9rem' }}>
                      {p.displayName || p.name}
                    </span>
                  </div>
                  {suitor ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.1rem' }}>{suitor.monogram}</span>
                      <span style={{ fontWeight: 700, color: suitor.accent, fontSize: '0.9rem' }}>
                        {suitor.name}
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: '#999', fontStyle: 'italic', fontSize: '0.85rem' }}>No vote</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Teacher's Discussion Guide */}
        <div
          style={{
            flex: '1 1 45%',
            background: '#fff',
            borderRadius: 20,
            padding: '24px 28px',
            boxShadow: '0 6px 30px rgba(0,0,0,0.06)',
            border: '2px solid rgba(251,191,36,0.3)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="caps" style={{ fontSize: '0.7rem', color: '#b45309', marginBottom: 4 }}>
            TEACHER'S CLASSROOM DEBRIEF
          </div>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#9b1c1c', margin: '0 0 16px 0' }}>
            {round.discussTitle}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {round.discuss.map((point, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 12,
                  background: '#faf5f0',
                  padding: '12px 16px',
                  borderRadius: 12,
                  borderLeft: '4px solid #b45309',
                }}
              >
                <span style={{ color: '#b45309', fontWeight: 800 }}>•</span>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#333', lineHeight: 1.45 }}>{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
