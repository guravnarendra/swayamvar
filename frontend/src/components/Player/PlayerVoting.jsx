import React, { useState } from 'react';
import { ROUNDS, SUITORS, suitorVariant, suitorName, suitorPortrait } from '../../gameData.js';

export function PlayerVoting({ roundIndex = 0, onVote, votedSuitorId, gender = 'P' }) {
  const round = ROUNDS[roundIndex] || ROUNDS[0];
  const [selectedId, setSelectedId] = useState(votedSuitorId || null);

  const chosenSuitor = SUITORS.find((s) => s.id === (votedSuitorId || selectedId));
  const chosenVariant = chosenSuitor
    ? suitorVariant(gender, SUITORS.indexOf(chosenSuitor))
    : 'm';

  const handleLock = () => {
    if (!selectedId || votedSuitorId) return;
    onVote(selectedId);
  };

  return (
    <div
      className="player-bg screen"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #2b0008 0%, #150004 100%)',
        color: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* Top Banner (Question is only on Host Screen as requested) */}
      <div
        style={{
          padding: '14px 16px',
          flexShrink: 0,
          textAlign: 'center',
          borderBottom: '1px solid rgba(251,191,36,0.25)',
          background: 'rgba(0,0,0,0.4)',
        }}
      >
        <span
          className="caps"
          style={{
            display: 'inline-block',
            marginBottom: 4,
            fontSize: '.55rem',
            fontWeight: 800,
            padding: '3px 12px',
            borderRadius: 999,
            background: 'rgba(251,191,36,0.2)',
            color: '#fbbf24',
            letterSpacing: '.14em',
          }}
        >
          Round {round.number} of {ROUNDS.length}
        </span>
        <div style={{ fontSize: '1.2rem', color: '#fde68a', fontWeight: 700, marginTop: 4 }}>
          👀 Look at Big Screen for Question
        </div>
        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'rgba(253,230,138,0.8)' }}>
          {votedSuitorId ? 'Your vote is locked!' : 'Tap a suitor below & tap Lock Vote'}
        </p>
      </div>

      {/* Body: Scrollable area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '12px 12px 80px',
        }}
      >
        {votedSuitorId ? (
          /* Locked State */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              paddingTop: 40,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '4.5rem', lineHeight: 1 }}>🔒</div>
            <h3
              className="display"
              style={{
                fontSize: '2rem',
                color: '#4ade80',
                margin: 0,
                textShadow: '0 0 24px rgba(74,222,128,0.5)',
              }}
            >
              Vote Locked!
            </h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 22px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.12)',
                border: '1.5px solid rgba(251,191,36,0.4)',
              }}
            >
              <span style={{ fontSize: '2.4rem' }}>{chosenSuitor?.monogram}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: 'rgba(253,230,138,0.85)', fontSize: '.65rem' }}>YOUR CHOICE</div>
                <div style={{ color: '#fde68a', fontWeight: 800, fontSize: '1.1rem' }}>
                  {chosenSuitor && suitorName(chosenSuitor, chosenVariant)}
                </div>
              </div>
            </div>
            <p
              className="caps"
              style={{
                fontSize: '.55rem',
                color: 'rgba(253,230,138,0.75)',
                letterSpacing: '.2em',
                marginTop: 14,
              }}
            >
              Waiting for other players to lock…
            </p>
          </div>
        ) : (
          /* 6 Suitor Options */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10,
              maxWidth: 480,
              margin: '0 auto',
            }}
          >
            {SUITORS.map((s, idx) => {
              const variant = suitorVariant(gender, idx);
              const portrait = suitorPortrait(s, variant);
              const displayName = suitorName(s, variant);
              const isSelected = selectedId === s.id;

              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  style={{
                    background: s.cardBg,
                    border: isSelected ? '3px solid #fbbf24' : `2px solid ${s.accent}88`,
                    borderRadius: 14,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: '#fff',
                    boxShadow: isSelected ? '0 0 18px rgba(251,191,36,0.6)' : `0 4px 14px ${s.accent}25`,
                    display: 'flex',
                    flexDirection: 'column',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  {/* Selected check badge */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: '#fbbf24',
                        color: '#1a0505',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                        zIndex: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                      }}
                    >
                      ✓
                    </div>
                  )}

                  {/* Portrait photo */}
                  <div style={{ height: 105, width: '100%', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={portrait}
                      alt={displayName}
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
                        bottom: 6,
                        left: 8,
                        right: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{s.monogram}</span>
                      <span
                        style={{
                          fontSize: '0.62rem',
                          background: `${s.accent}dd`,
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontWeight: 800,
                        }}
                      >
                        {s.returnLabel}
                      </span>
                    </div>
                  </div>

                  {/* Name & Title */}
                  <div style={{ padding: '8px 10px 10px' }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        color: isSelected ? '#fbbf24' : '#fde68a',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {displayName}
                    </div>
                    <div
                      style={{
                        fontSize: '0.65rem',
                        color: s.accentLt,
                        marginTop: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {s.profession}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Bar: Lock Vote Button */}
      {!votedSuitorId && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '12px 16px',
            background: 'rgba(10,0,0,0.85)',
            backdropFilter: 'blur(12px)',
            borderTop: '1.5px solid rgba(251,191,36,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <button
            type="button"
            onClick={handleLock}
            disabled={!selectedId}
            style={{
              width: '100%',
              maxWidth: 420,
              padding: '14px',
              borderRadius: 14,
              border: 'none',
              background: selectedId ? 'linear-gradient(135deg, #059669, #10b981)' : 'rgba(255,255,255,0.15)',
              color: selectedId ? '#fff' : 'rgba(255,255,255,0.4)',
              fontSize: '1.05rem',
              fontWeight: 800,
              cursor: selectedId ? 'pointer' : 'not-allowed',
              boxShadow: selectedId ? '0 4px 20px rgba(16,185,129,0.4)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {selectedId ? `🔒 Lock Vote for ${suitorName(SUITORS.find(s => s.id === selectedId), suitorVariant(gender, 0))}` : 'Select a Suitor Above'}
          </button>
        </div>
      )}
    </div>
  );
}
