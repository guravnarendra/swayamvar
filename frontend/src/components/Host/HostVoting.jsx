import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ROUNDS, SUITORS } from '../../gameData.js';
import { socket } from '../../socket.js';

export function HostVoting({ state, onForceClose, onKickPlayer, onPurgeUnlocked }) {
  const round = ROUNDS[state?.roundIndex || 0] || ROUNDS[0];
  const rawPlayers = Object.values(state?.players || {});
  // Safe filtering: protect against corrupt/null player objects
  const players = rawPlayers.filter((p) => p && p.id);
  const roundVotes = (state?.votes || {})[round.id] || {};
  const voteCount = Object.keys(roundVotes).length;
  const totalPlayers = players.length;
  const allLocked = totalPlayers > 0 && voteCount >= totalPlayers;

  // Track recently locked players to show pop animation
  const [justLockedId, setJustLockedId] = useState(null);

  useEffect(() => {
    const handleVoteLocked = (data) => {
      if (data && data.playerId) {
        setJustLockedId(data.playerId);
        setTimeout(() => setJustLockedId(null), 2500);
      }
    };

    socket.on('vote_locked_event', handleVoteLocked);
    return () => socket.off('vote_locked_event', handleVoteLocked);
  }, []);

  // When all players locked, fire celebratory confetti
  useEffect(() => {
    if (allLocked) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  }, [allLocked]);

  return (
    <div
      className="screen bg-bfiw-ivory bfiw-screen fade"
      style={{
        padding: '16px 3vw 40px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      {/* Header: Displays the Question Big & Clear on Host Screen */}
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div className="caps" style={{ fontSize: '.7rem', color: '#b45309', letterSpacing: '0.15em' }}>
          Round {round.number} of {ROUNDS.length} · Live Question
        </div>
        <h1
          className="display"
          style={{
            fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
            color: '#9b1c1c',
            marginTop: 2,
            lineHeight: 1.05,
          }}
        >
          {round.emoji} {round.question}
        </h1>
        <p
          className="serif ital"
          style={{
            color: '#78350f',
            fontSize: '0.95rem',
            lineHeight: 1.3,
            whiteSpace: 'pre-line',
            maxWidth: 720,
            margin: '2px auto 0',
          }}
        >
          {round.subtitle}
        </p>
      </div>

      {/* Center Layout: Suitor Cards on Left, Player Lock Status on Right */}
      <div style={{ flex: 1, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Suitors overview with Full Portrait Images */}
        <div style={{ flex: '1 1 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {SUITORS.map((s) => (
            <div
              key={s.id}
              style={{
                borderRadius: 14,
                background: s.cardBg,
                color: '#fff',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: `2px solid ${s.accent}88`,
                boxShadow: `0 4px 16px ${s.accent}25`,
              }}
            >
              {/* Suitor Portrait Image */}
              <div style={{ height: 'clamp(70px, 9.5vh, 95px)', position: 'relative', overflow: 'hidden', background: '#1a0505' }}>
                <img
                  src={s.portraitM}
                  alt={s.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                    display: 'block',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    left: 8,
                    right: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{s.monogram}</span>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      background: `${s.accent}ee`,
                      padding: '1px 6px',
                      borderRadius: 6,
                      fontWeight: 800,
                    }}
                  >
                    {s.returnLabel}
                  </span>
                </div>
              </div>

              {/* Suitor Info */}
              <div style={{ padding: '6px 10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fde68a', lineHeight: 1.2 }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: s.accentLt, marginTop: 1 }}>
                    {s.profession}
                  </div>
                </div>
                <div style={{ marginTop: 4, fontSize: '0.72rem', fontStyle: 'italic', opacity: 0.9 }}>
                  "{s.tagline}"
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Voting Status Panel: Locks count & live guest statuses */}
        <div
          style={{
            flex: '0 0 clamp(260px, 25vw, 300px)',
            background: '#fff',
            borderRadius: 18,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 10px 35px rgba(0,0,0,0.08)',
            border: allLocked ? '2px solid #059669' : '2px solid rgba(251,191,36,0.4)',
            transition: 'border 0.3s ease',
            position: 'sticky',
            top: 20,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div
              className="display"
              style={{
                fontSize: '2.4rem',
                color: allLocked ? '#059669' : '#9b1c1c',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {voteCount} <span style={{ fontSize: '1.2rem', color: '#888' }}>/ {totalPlayers}</span>
            </div>
            <div className="caps" style={{ fontSize: '0.68rem', color: '#78350f', marginTop: 4, fontWeight: 800 }}>
              {allLocked ? 'ALL GUESTS LOCKED! 🎉' : 'GUESTS LOCKED'}
            </div>
          </div>

          {/* List of Players with Animated Lock Reaction */}
          <div
            style={{
              maxHeight: 'clamp(120px, 22vh, 180px)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              paddingRight: 4,
            }}
          >
            {players.map((p) => {
              const hasLocked = Boolean(roundVotes[p.id]);
              const isJustNow = justLockedId === p.id;

              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: hasLocked ? '#ecfdf5' : '#faf5f0',
                    border: hasLocked ? '1.5px solid #a7f3d0' : '1px solid #eee',
                    transform: isJustNow ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isJustNow ? '0 0 16px rgba(16,185,129,0.5)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
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
                        <span style={{ fontSize: '0.9rem' }}>{p.titleEmoji || '👤'}</span>
                      )}
                    </div>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: '#1a0505',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 120,
                      }}
                    >
                      {p.displayName || p.name || 'Guest'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {hasLocked ? (
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          color: '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        🔒 Locked {isJustNow && '✨'}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#b45309', fontStyle: 'italic' }}>
                        Thinking…
                      </span>
                    )}

                    {/* Host Kick Button */}
                    {onKickPlayer && (
                      <button
                        type="button"
                        onClick={() => onKickPlayer(p.id)}
                        title={`Remove fake user ${p.displayName || p.name}`}
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.25)',
                          color: '#ef4444',
                          borderRadius: 6,
                          width: 20,
                          height: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: 900,
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div style={{ marginTop: 12 }}>
            <button
              className="btn-wedding"
              onClick={onForceClose}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.98rem',
                background: allLocked ? '#059669' : '#d97706',
                cursor: 'pointer',
                boxShadow: allLocked
                  ? '0 6px 20px rgba(5,150,105,0.4)'
                  : '0 6px 20px rgba(217,119,6,0.3)',
                transition: 'all 0.3s ease',
              }}
            >
              {allLocked
                ? 'Reveal Results 🎊'
                : `Reveal Results (${voteCount}/${totalPlayers} Ready) ➔`}
            </button>

            {/* Quick Inactive Ghost Purge Button */}
            {!allLocked && totalPlayers > voteCount && onPurgeUnlocked && (
              <button
                type="button"
                onClick={onPurgeUnlocked}
                style={{
                  marginTop: 6,
                  width: '100%',
                  padding: '7px 10px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px dashed #ef4444',
                  color: '#dc2626',
                  borderRadius: 10,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                🧹 Remove Inactive Guests ({totalPlayers - voteCount} haven't locked)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
