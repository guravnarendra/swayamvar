import React from 'react';

export function PlayerCharacterWait({ player }) {
  return (
    <div
      className="player-bg screen"
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: '#1a0505',
      }}
    >
      {player?.titleImg && (
        <img
          src={player.titleImg}
          alt={player.displayName}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 30%, rgba(8,0,10,.85) 65%, #08000a 95%)',
        }}
      />
      <div style={{ position: 'absolute', bottom: 30, left: 20, right: 20, textAlign: 'center', zIndex: 2 }}>
        <div className="caps" style={{ fontSize: '.6rem', color: 'rgba(253,230,138,.8)', letterSpacing: '.25em' }}>
          {player?.name}
        </div>
        <h2 className="display" style={{ fontSize: '2.2rem', color: '#fde68a', margin: '4px 0 6px 0' }}>
          {player?.titleEmoji} {player?.displayName}
        </h2>
        <p className="serif ital" style={{ color: 'rgba(253,230,138,.9)', fontSize: '0.95rem', marginBottom: 20 }}>
          {player?.titleAction}
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 24px',
            borderRadius: 999,
            background: 'rgba(251,191,36,0.15)',
            border: '1px solid rgba(251,191,36,0.35)',
          }}
        >
          <span className="pulse-dot" style={{ color: '#fbbf24', fontSize: '0.75rem' }}>●</span>
          <span style={{ fontSize: '0.8rem', color: '#fde68a', fontWeight: 600 }}>
            Waiting for Host to begin the match…
          </span>
        </div>
      </div>
    </div>
  );
}
