import React, { useState } from 'react';
import { pickAvatar, PARTICIPANTS_M, PARTICIPANTS_F } from '../../gameData.js';

const JOIN_COLORS = [
  '#dc2626', '#ea580c', '#d97706', '#16a34a',
  '#0891b2', '#7c3aed', '#be185d', '#0f766e',
];

export function PlayerJoin({ onJoin }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState(null); // 'M' | 'F' | 'P'
  const [step, setStep] = useState('form'); // 'form' | 'avatar'
  const [avatar, setAvatar] = useState(null);
  const [reveal, setReveal] = useState(null);

  const pool = gender === 'M' ? PARTICIPANTS_M
             : gender === 'F' ? PARTICIPANTS_F
             : PARTICIPANTS_M.concat(PARTICIPANTS_F);

  function handleFormContinue() {
    if (!name.trim() || !gender) return;
    setAvatar(pickAvatar(gender));
    setStep('avatar');
  }

  function handleConfirmJoin() {
    const n = name.trim();
    if (!n || !gender) return;

    const chosenColor = JOIN_COLORS[Math.floor(Math.random() * JOIN_COLORS.length)];
    const chosenChar = avatar || pickAvatar(gender);
    const displayName = chosenChar?.title || n;

    const playerData = {
      name: n,
      displayName,
      color: chosenColor,
      gender,
      titleEmoji: chosenChar?.emoji || '👤',
      titleAction: chosenChar?.action || 'has entered the Swayamvar',
      titleImg: chosenChar?.img || '',
    };

    setReveal(playerData);
    setTimeout(() => {
      onJoin(playerData);
    }, 1800);
  }

  if (reveal) {
    return (
      <div className="player-bg screen" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        {reveal.titleImg && (
          <img
            src={reveal.titleImg}
            alt={reveal.displayName}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(8,0,10,.9) 70%, #08000a 95%)' }} />
        <div style={{ position: 'absolute', bottom: 30, left: 20, right: 20, textAlign: 'center', zIndex: 2 }}>
          <div className="caps" style={{ fontSize: '.65rem', color: 'rgba(253,230,138,.85)', letterSpacing: '.3em' }}>
            {reveal.name} · YOU ARE
          </div>
          <h2 className="display" style={{ fontSize: '2.4rem', color: '#fde68a', margin: '6px 0' }}>
            {reveal.titleEmoji} {reveal.displayName}
          </h2>
          <p className="serif ital" style={{ color: 'rgba(253,230,138,.9)', fontSize: '1rem', marginBottom: 16 }}>
            {reveal.titleAction}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(251,191,36,.15)' }}>
            <span style={{ fontSize: '.65rem', color: '#fde68a' }}>Seating you into the Swayamvar…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="player-bg screen"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '24px 20px',
        boxSizing: 'border-box',
        background: 'radial-gradient(ellipse 120% 80% at 50% -10%, #5a0000 0%, #2d0000 40%, #0e0000 100%)',
        color: '#fff',
      }}
    >
      <div style={{ maxWidth: 420, width: '100%', margin: '0 auto', textAlign: 'center' }}>
        <div className="caps" style={{ fontSize: '.6rem', color: '#fbbf24', letterSpacing: '.3em', marginBottom: 6 }}>
          Investing for Mummies
        </div>
        <h1 className="display" style={{ fontSize: '2.8rem', color: '#fbbf24', lineHeight: 1 }}>
          Swayamvar
        </h1>
        <p className="serif ital" style={{ color: 'rgba(253,230,138,.85)', fontSize: '1rem', marginTop: 4, marginBottom: 24 }}>
          Enter your details to take your seat
        </p>

        {step === 'form' ? (
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: 24, borderRadius: 20, border: '1px solid rgba(251,191,36,0.25)' }}>
            <div style={{ textAlign: 'left', marginBottom: 18 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fde68a', display: 'block', marginBottom: 6 }}>
                YOUR NAME
              </label>
              <input
                type="text"
                placeholder="e.g. Priya, Rahul..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid rgba(251,191,36,0.4)',
                  background: 'rgba(0,0,0,0.5)',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ textAlign: 'left', marginBottom: 24 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fde68a', display: 'block', marginBottom: 8 }}>
                SHOW PROSPECTS
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { id: 'F', label: 'Male Suitors', sub: 'I want Grooms' },
                  { id: 'M', label: 'Female Suitors', sub: 'I want Brides' },
                  { id: 'P', label: 'Mixed', sub: 'Surprise me' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGender(g.id)}
                    style={{
                      padding: '10px 6px',
                      borderRadius: 10,
                      border: `1.5px solid ${gender === g.id ? '#fbbf24' : 'rgba(255,255,255,0.15)'}`,
                      background: gender === g.id ? 'rgba(251,191,36,0.2)' : 'rgba(0,0,0,0.3)',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{g.label}</div>
                    <div style={{ fontSize: '0.65rem', color: '#fde68a', opacity: 0.8 }}>{g.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn-wedding"
              onClick={handleFormContinue}
              disabled={!name.trim() || !gender}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                opacity: !name.trim() || !gender ? 0.5 : 1,
              }}
            >
              Choose Persona &nbsp;➔
            </button>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: 24, borderRadius: 20, border: '1px solid rgba(251,191,36,0.25)' }}>
            <div style={{ fontSize: '0.75rem', color: '#fde68a', fontWeight: 700, marginBottom: 12 }}>
              YOUR SWAYAMVAR PERSONA
            </div>

            {avatar && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ width: 90, height: 90, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 12px', border: '3px solid #fbbf24' }}>
                  <img src={avatar.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: '1.4rem', color: '#fbbf24', margin: '0 0 4px 0' }}>
                  {avatar.emoji} {avatar.title}
                </h3>
                <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(253,230,138,0.85)' }}>
                  "{avatar.action}"
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setAvatar(pickAvatar(gender))}
              style={{
                background: 'transparent',
                border: '1px solid rgba(251,191,36,0.5)',
                color: '#fde68a',
                padding: '8px 16px',
                borderRadius: 999,
                fontSize: '0.8rem',
                marginBottom: 20,
                cursor: 'pointer',
              }}
            >
              🎲 Shuffle Avatar
            </button>

            <button
              className="btn-wedding"
              onClick={handleConfirmJoin}
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              Enter Swayamvar &nbsp;💍
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
