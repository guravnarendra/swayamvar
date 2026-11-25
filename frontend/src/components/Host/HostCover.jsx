import React from 'react';
import { Petals } from '../Common/Petals.jsx';
import { Ornament } from '../Common/Ornament.jsx';

export function HostCover({ onOpen }) {
  return (
    <div
      className="screen bg-bfiw-dark bfiw-screen fade"
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4vh 4vw',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
      }}
    >
      <Petals />
      <div
        className="invite invite-bfiw fade"
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          background: 'linear-gradient(160deg,rgba(100,0,28,.65),rgba(8,0,0,.85))',
          backdropFilter: 'blur(16px)',
          padding: 'clamp(44px,7vh,90px) clamp(44px,9vw,130px)',
          maxWidth: 960,
          width: '100%',
          borderRadius: 24,
          border: '1px solid rgba(251,191,36,0.35)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div className="caps" style={{ fontSize: '.75rem', color: '#fbbf24', marginBottom: 20, letterSpacing: '.4em' }}>
          Investing for Mummies · Cordially Presents
        </div>
        <h1
          className="display"
          style={{
            color: '#fbbf24',
            fontSize: 'clamp(3.4rem,8vw,6.5rem)',
            fontWeight: 700,
            lineHeight: 0.95,
            textShadow: '0 4px 40px rgba(155,28,28,.7)',
          }}
        >
          Swayamvar
        </h1>
        <div className="display ital" style={{ color: '#fde68a', fontSize: 'clamp(1.8rem,4vw,3.2rem)', marginTop: 8 }}>
          for your Money
        </div>
        <Ornament word="est. 1995" style={{ margin: '30px auto', maxWidth: 440 }} />
        <p className="serif ital" style={{ color: 'rgba(253,230,138,.92)', fontSize: 'clamp(1.1rem,2vw,1.5rem)', lineHeight: 1.5 }}>
          Six prospects. Four questions. One portfolio.
        </p>
        <div style={{ fontSize: '1.5rem', margin: '24px 0 10px', letterSpacing: '0.2em' }}>
          🌸🪔🌼🪔🌸🪔🌼🪔🌸
        </div>
        <div style={{ marginTop: 24 }}>
          <button className="btn-wedding" style={{ fontSize: '1.2rem', padding: '16px 54px' }} onClick={onOpen}>
            Open the Swayamvar &nbsp;💍
          </button>
        </div>
      </div>
    </div>
  );
}
