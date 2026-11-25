import React from 'react';
import { suitorName, suitorPortrait } from '../../gameData.js';

export function SuitorBioCard({ suitor, variant = 'both', style }) {
  if (!suitor) return null;

  return (
    <div
      className="suitor-biodata-card"
      style={{
        borderRadius: 20,
        background: '#fff',
        border: `3px solid ${suitor.accent}`,
        boxShadow: `0 12px 40px ${suitor.accent}25`,
        display: 'flex',
        overflow: 'hidden',
        width: '100%',
        ...style,
      }}
    >
      {/* Left Portrait (Male) */}
      {(variant === 'both' || variant === 'm') && (
        <div style={{ flex: '0 0 280px', position: 'relative', overflow: 'hidden' }}>
          <img
            src={suitorPortrait(suitor, 'm')}
            alt={suitorName(suitor, 'm')}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '12px 14px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
              color: '#fff',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: suitor.accentLt, fontWeight: 700 }}>PROSPECT MALE</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{suitorName(suitor, 'm')}</div>
          </div>
        </div>
      )}

      {/* Middle: Content */}
      <div style={{ flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
        <div>
          <span
            style={{
              background: `${suitor.accent}18`,
              color: suitor.accent,
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
            }}
          >
            {suitor.bioCard?.represents || 'ASSET CLASS'}
          </span>
          <h3
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '2rem',
              color: '#1a0505',
              marginTop: 6,
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {suitor.aka || suitor.name}
          </h3>
          <p style={{ fontStyle: 'italic', color: '#666', fontSize: '0.9rem', marginTop: 4 }}>
            "{suitor.tagline}"
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, background: '#faf5f0', padding: 12, borderRadius: 12 }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#999', fontWeight: 800 }}>EXPECTED RETURN</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: suitor.accent }}>{suitor.returnLabel}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#999', fontWeight: 800 }}>RISK PROFILE</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#333' }}>{suitor.riskLabel}</div>
          </div>
        </div>

        <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#444' }}>
          {suitor.bio}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {/* Green Flags */}
          <div style={{ background: '#ecfdf5', padding: 12, borderRadius: 10, border: '1px solid #a7f3d0' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#047857', marginBottom: 6 }}>
              🟢 GREEN FLAGS
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.82rem', color: '#065f46', lineHeight: 1.4 }}>
              {(suitor.greenFlags || suitor.bioCard?.strengths || []).map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          {/* Red Flags */}
          <div style={{ background: '#fff1f2', padding: 12, borderRadius: 10, border: '1px solid #fecdd3' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#be123c', marginBottom: 6 }}>
              🚩 RED FLAGS
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.82rem', color: '#9f1239', lineHeight: 1.4 }}>
              {(suitor.redFlags || suitor.bioCard?.redFlags || []).map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right Portrait (Female) */}
      {(variant === 'both' || variant === 'f') && (
        <div style={{ flex: '0 0 280px', position: 'relative', overflow: 'hidden' }}>
          <img
            src={suitorPortrait(suitor, 'f')}
            alt={suitorName(suitor, 'f')}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '12px 14px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
              color: '#fff',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: suitor.accentLt, fontWeight: 700 }}>PROSPECT FEMALE</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{suitorName(suitor, 'f')}</div>
          </div>
        </div>
      )}
    </div>
  );
}
