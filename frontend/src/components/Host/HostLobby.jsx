import React from 'react';
import { QRCodeCard } from '../Common/QRCodeCard.jsx';

export function HostLobby({ state, onBegin, onStartVoting, onKickPlayer }) {
  const rawPlayers = Object.values(state?.players || {});
  const players = rawPlayers.filter((p) => p && p.id);
  const roomCode = state?.roomCode || '1995';

  return (
    <div
      className="screen bg-bfiw-ivory bfiw-screen fade"
      style={{
        padding: '4vh 5vw',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', flex: '0 0 auto' }}>
        <div style={{ fontSize: '1.2rem', letterSpacing: '0.2em', marginBottom: 6 }}>
          🌼🪔🌸🪔🌼🪔🌸🪔🌼
        </div>
        <div className="caps" style={{ fontSize: '.7rem', color: '#b45309', letterSpacing: '0.25em' }}>
          The Workshop · Matchmaking Round
        </div>
        <h2 className="display" style={{ fontSize: 'clamp(2.8rem,5vw,4.5rem)', color: '#9b1c1c', marginTop: 4 }}>
          The Swayamvar is Open
        </h2>
        <p className="serif ital" style={{ color: '#78350f', fontSize: '1.2rem', marginTop: 4 }}>
          Scan the card from your phone — we'll wait for everyone to take their seats.
        </p>
      </div>

      {/* Main split: Left QR code, Right seated guests */}
      <div
        style={{
          display: 'flex',
          gap: 40,
          alignItems: 'stretch',
          justifyContent: 'center',
          flex: '1 1 auto',
          marginTop: 24,
          flexWrap: 'wrap',
        }}
      >
        {/* QR Card */}
        <div
          style={{
            background: '#fff',
            padding: '36px 40px',
            borderRadius: 24,
            textAlign: 'center',
            boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
            border: '2px solid rgba(251,191,36,0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="caps" style={{ fontSize: '.75rem', color: '#b45309', marginBottom: 16, letterSpacing: '0.15em' }}>
            SCAN TO TAKE YOUR SEAT
          </div>
          <QRCodeCard roomCode={roomCode} size={260} />
        </div>

        {/* Guest Roster */}
        <div
          style={{
            flex: '1 1 400px',
            maxWidth: 620,
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            borderRadius: 24,
            padding: '28px 32px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
            border: '2px solid rgba(251,191,36,0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
            <span className="display" style={{ fontSize: '3rem', fontWeight: 700, color: '#9b1c1c' }}>
              {players.length}
            </span>
            <span className="serif" style={{ fontSize: '1.3rem', color: '#78350f' }}>
              {players.length === 1 ? 'guest' : 'guests'} seated
            </span>
            <span style={{ marginLeft: 'auto', fontSize: '.8rem', color: '#059669', fontWeight: 800 }}>
              ● welcoming live…
            </span>
          </div>

          <div
            style={{
              flex: '1 1 auto',
              overflowY: 'auto',
              maxHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              paddingRight: 6,
            }}
          >
            {players.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#999', margin: 'auto 0', fontStyle: 'italic' }}>
                Waiting for the first guest to scan the QR code...
              </div>
            ) : (
              players.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    borderRadius: 14,
                    background: '#faf5f0',
                    border: `1.5px solid ${p.color || '#fbbf24'}44`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: p.color || '#9b1c1c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {p.titleImg ? (
                        <img src={p.titleImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>
                          {p.titleEmoji || p.name?.[0] || '👤'}
                        </span>
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: '#1a0505',
                          fontSize: '0.95rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 220,
                        }}
                      >
                        {p.displayName || p.name || 'Guest'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#78350f', fontStyle: 'italic' }}>
                        {p.titleAction || 'has entered the room'}
                      </div>
                    </div>
                  </div>

                  {/* Kick fake user button */}
                  {onKickPlayer && (
                    <button
                      type="button"
                      onClick={() => onKickPlayer(p.id)}
                      title={`Remove ${p.displayName || p.name}`}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#ef4444',
                        borderRadius: 8,
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Action buttons */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #eee', display: 'flex', gap: 12 }}>
            <button
              className="btn-wedding"
              onClick={onBegin}
              disabled={players.length === 0}
              style={{
                flex: 1,
                fontSize: '1rem',
                padding: '14px',
                opacity: players.length === 0 ? 0.5 : 1,
                cursor: players.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Meet Suitors &nbsp;➔
            </button>
            <button
              className="btn-wedding"
              onClick={onStartVoting}
              disabled={players.length === 0}
              style={{
                flex: 1,
                fontSize: '1rem',
                padding: '14px',
                background: '#059669',
                opacity: players.length === 0 ? 0.5 : 1,
                cursor: players.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Start Voting &nbsp;🗳️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
