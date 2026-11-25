import React from 'react';
import { ROUNDS, SUITORS, suitorVariant, suitorName } from '../../gameData.js';

export function PlayerResults({ state, gender, myVotes }) {
  const round = ROUNDS[state?.roundIndex || 0];
  const chosenId = myVotes[round.id];
  const suitor = SUITORS.find((s) => s.id === chosenId);
  const variant = suitor ? suitorVariant(gender, SUITORS.indexOf(suitor)) : 'm';

  return (
    <div
      className="player-bg screen"
      style={{
        minHeight: '100vh',
        padding: '24px 16px 40px',
        boxSizing: 'border-box',
        background: 'linear-gradient(180deg, #2b0008 0%, #150004 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🎉</div>
      <div className="caps" style={{ fontSize: '.65rem', color: '#fbbf24', letterSpacing: '.2em' }}>
        Verdict Revealed
      </div>
      <h2 className="display" style={{ fontSize: '1.8rem', color: '#fff', margin: '4px 0 16px 0' }}>
        {round.emoji} {round.question}
      </h2>

      <div
        style={{
          width: '100%',
          maxWidth: 360,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: 20,
          border: '1px solid rgba(251,191,36,0.25)',
        }}
      >
        <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: 6 }}>YOUR PICK</div>
        {suitor ? (
          <div>
            <div style={{ fontSize: '2.2rem', marginBottom: 4 }}>{suitor.monogram}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: suitor.accentLt }}>
              {suitorName(suitor, variant)}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#ddd', marginTop: 4 }}>
              {suitor.returnLabel} Returns · {suitor.riskLabel} Risk
            </div>
          </div>
        ) : (
          <div style={{ fontStyle: 'italic', color: '#888' }}>You missed voting in this round</div>
        )}
      </div>

      <div style={{ marginTop: 24, fontSize: '0.85rem', color: 'rgba(253,230,138,0.85)', fontStyle: 'italic' }}>
        Follow along on the classroom screen for the debrief…
      </div>
    </div>
  );
}
