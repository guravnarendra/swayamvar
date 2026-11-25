import React, { useMemo } from 'react';

export function Petals({ count = 22 }) {
  const petals = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${(i * 100) / count + (Math.random() * 5 - 2.5)}%`,
      delay: `${(i * 0.45) % 8}s`,
      duration: `${9 + (i % 6)}s`,
      size: `${14 + (i % 12)}px`,
      opacity: 0.28 + ((i % 5) * 0.1),
    }));
  }, [count]);

  return (
    <div className="petals" aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            fontSize: p.size,
            opacity: p.opacity,
          }}
        >
          🌸
        </span>
      ))}
    </div>
  );
}
