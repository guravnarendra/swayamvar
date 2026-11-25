import React from 'react';

export function Ornament({ word, style }) {
  return (
    <div className="orn" style={style}>
      <span className="line"></span>
      <span className="di">❖</span>
      {word && <span className="word">{word}</span>}
      <span className="di">❖</span>
      <span className="line r"></span>
    </div>
  );
}
