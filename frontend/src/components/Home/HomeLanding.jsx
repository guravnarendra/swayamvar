import React, { useState } from 'react';
import { Petals } from '../Common/Petals.jsx';
import { Ornament } from '../Common/Ornament.jsx';

export function HomeLanding({ onCreateRoom, onJoinRoom }) {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await onCreateRoom();
    } catch (err) {
      setError('Could not create room. Please try again.');
      setLoading(false);
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    const clean = inputCode.trim().toUpperCase();
    if (clean.length < 4) {
      setError('Please enter a 4-digit room code');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const apiBase =
        window.location.port === '3000'
          ? `${window.location.protocol}//${window.location.hostname}:4000`
          : window.location.origin;

      const res = await fetch(`${apiBase}/api/check-room/${clean}`);
      const data = await res.json();

      if (!data.exists) {
        setError(`Room "${clean}" does not exist in database!`);
        setLoading(false);
        return;
      }

      setLoading(false);
      onJoinRoom(clean);
    } catch {
      // If offline check fails, proceed with normal socket join which also verifies
      setLoading(false);
      onJoinRoom(clean);
    }
  };

  return (
    <div
      className="screen bg-bfiw-dark bfiw-screen fade"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        textAlign: 'center',
        background: 'radial-gradient(ellipse 120% 80% at 50% -10%, #5a0000 0%, #2d0000 40%, #0e0000 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Petals count={20} />

      <div
        className="invite fade"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 620,
          width: '100%',
          background: 'linear-gradient(160deg,rgba(90,0,0,.65),rgba(10,0,0,.88))',
          backdropFilter: 'blur(16px)',
          padding: 'clamp(36px, 6vh, 64px) clamp(24px, 5vw, 48px)',
          borderRadius: 28,
          border: '1.5px solid rgba(251,191,36,0.35)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.7)',
        }}
      >
        <div className="caps" style={{ fontSize: '0.68rem', color: '#fbbf24', letterSpacing: '0.35em', marginBottom: 12 }}>
          Investing for Mummies
        </div>

        <h1
          className="display"
          style={{
            color: '#fbbf24',
            fontSize: 'clamp(2.8rem, 8vw, 4.8rem)',
            fontWeight: 700,
            lineHeight: 0.95,
            textShadow: '0 4px 30px rgba(155,28,28,0.7)',
          }}
        >
          Swayamvar
        </h1>

        <div className="display ital" style={{ color: '#fde68a', fontSize: 'clamp(1.5rem, 4vw, 2.4rem)', marginTop: 4 }}>
          for your Money
        </div>

        <Ornament word="est. 1995" style={{ margin: '20px auto', maxWidth: 360 }} />

        <p className="serif ital" style={{ color: 'rgba(253,230,138,0.9)', fontSize: '1.1rem', lineHeight: 1.45, marginBottom: 32 }}>
          Finding the perfect match for your savings.
        </p>

        {/* 2 Main Action Buttons */}
        {!showJoinModal ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {/* Create Room Button */}
            <button
              onClick={handleCreate}
              disabled={loading}
              className="role-btn host"
              style={{
                background: 'linear-gradient(145deg, rgba(155,28,28,0.4), rgba(40,0,0,0.8))',
                border: '2px solid #fbbf24',
                padding: '24px 20px',
                borderRadius: 20,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: '2.6rem', marginBottom: 8 }}>👑</div>
              <div className="caps" style={{ fontSize: '0.62rem', color: '#fde68a', letterSpacing: '0.15em', marginBottom: 4 }}>
                PROJECTOR / TEACHER
              </div>
              <div className="display" style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 700 }}>
                Create Room
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(253,230,138,0.75)', marginTop: 6 }}>
                Generate dynamic 4-digit code
              </div>
            </button>

            {/* Join Room Button */}
            <button
              onClick={() => setShowJoinModal(true)}
              className="role-btn player"
              style={{
                background: 'linear-gradient(145deg, rgba(20,80,60,0.4), rgba(5,30,20,0.8))',
                border: '2px solid #34d399',
                padding: '24px 20px',
                borderRadius: 20,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: '2.6rem', marginBottom: 8 }}>📱</div>
              <div className="caps" style={{ fontSize: '0.62rem', color: '#a7f3d0', letterSpacing: '0.15em', marginBottom: 4 }}>
                PHONE / STUDENT
              </div>
              <div className="display" style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 700 }}>
                Join Room
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(167,243,208,0.75)', marginTop: 6 }}>
                Enter 4-digit code to vote
              </div>
            </button>
          </div>
        ) : (
          /* Join Room Modal / View */
          <form
            onSubmit={handleJoinSubmit}
            style={{
              background: 'rgba(0,0,0,0.5)',
              padding: '28px 24px',
              borderRadius: 20,
              border: '1.5px solid rgba(251,191,36,0.3)',
            }}
          >
            <div className="caps" style={{ fontSize: '0.75rem', color: '#fbbf24', letterSpacing: '0.2em', marginBottom: 12 }}>
              ENTER 4-DIGIT ROOM CODE
            </div>

            <input
              type="text"
              maxLength={6}
              autoFocus
              placeholder="e.g. 5821"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              style={{
                width: '100%',
                maxWidth: 240,
                margin: '0 auto 16px',
                display: 'block',
                padding: '12px 16px',
                fontSize: '1.8rem',
                letterSpacing: '0.3em',
                textAlign: 'center',
                fontWeight: 800,
                color: '#fbbf24',
                background: 'rgba(255,255,255,0.08)',
                border: '2px solid rgba(251,191,36,0.6)',
                borderRadius: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            {error && (
              <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: 14 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setShowJoinModal(false);
                  setError('');
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#ddd',
                  padding: '12px 24px',
                  borderRadius: 12,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Back
              </button>

              <button
                type="submit"
                className="btn-wedding"
                style={{ fontSize: '1rem', padding: '12px 32px' }}
              >
                Enter Room ➔
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
