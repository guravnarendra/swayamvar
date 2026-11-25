import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export function QRCodeCard({ roomCode, size = 180, showZoom = true }) {
  const [zoom, setZoom] = useState(false);

  // Clean URL: Points directly to /user so players land on /user
  const playerUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/user?room=${roomCode}`
    : `/user?room=${roomCode}`;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setZoom(false);
    };
    if (zoom) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [zoom]);

  return (
    <>
      <div
        className="qr-card-container"
        onClick={() => showZoom && setZoom(true)}
        style={{
          cursor: showZoom ? 'pointer' : 'default',
          textAlign: 'center',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        title={showZoom ? 'Click to enlarge' : undefined}
      >
        <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <QRCodeSVG value={playerUrl} size={size} level="M" includeMargin={false} />
        </div>
        <div style={{ marginTop: '10px' }}>
          <span style={{ fontSize: '0.75rem', color: '#9b1c1c', fontWeight: 700, letterSpacing: '0.1em' }}>
            ROOM: {roomCode}
          </span>
        </div>
      </div>

      {zoom && (
        <div
          onClick={() => setZoom(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              padding: '30px',
              borderRadius: '24px',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <h3 style={{ color: '#9b1c1c', fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', marginBottom: 12 }}>
              Scan to Join the Swayamvar
            </h3>
            <QRCodeSVG value={playerUrl} size={320} level="M" />
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#9b1c1c' }}>
                Room Code: {roomCode}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginTop: 4 }}>
                {playerUrl}
              </div>
            </div>
            <button
              onClick={() => setZoom(false)}
              style={{
                marginTop: 20,
                padding: '8px 24px',
                borderRadius: '999px',
                border: 'none',
                background: '#9b1c1c',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
