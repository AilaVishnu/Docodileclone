import React from 'react';

// Shared display primitives for the Foundations docs pages. These render token
// values pulled live from styles/theme.ts + globals.css, so the docs can never
// drift from the real design system.

export const Page: React.FC<{ title: string; intro?: string; children: React.ReactNode }> = ({
  title,
  intro,
  children,
}) => (
  <div style={{ fontFamily: "'Inter', sans-serif", color: '#202020', padding: 28, maxWidth: 1000 }}>
    <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 6px' }}>{title}</h1>
    {intro && (
      <p style={{ color: '#747474', margin: '0 0 28px', fontSize: 14, lineHeight: 1.55, maxWidth: 680 }}>
        {intro}
      </p>
    )}
    {children}
  </div>
);

export const Group: React.FC<{ label: string; note?: string; children: React.ReactNode }> = ({
  label,
  note,
  children,
}) => (
  <section style={{ marginBottom: 36 }}>
    <h2
      style={{
        fontSize: 12,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 0.7,
        color: '#8F8F8F',
        margin: '0 0 14px',
      }}
    >
      {label}
    </h2>
    {note && <p style={{ color: '#8F8F8F', fontSize: 12.5, margin: '-8px 0 14px' }}>{note}</p>}
    {children}
  </section>
);

export const Grid: React.FC<{ min?: number; children: React.ReactNode }> = ({ min = 150, children }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`,
      gap: 12,
    }}
  >
    {children}
  </div>
);

export const Mono: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12, color: '#585858' }}>
    {children}
  </code>
);

export const Swatch: React.FC<{ name: string; value: string }> = ({ name, value }) => (
  <div style={{ border: '1px solid #E3E3E3', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
    <div
      style={{
        height: 60,
        background: value,
        backgroundImage:
          'linear-gradient(45deg,#eee 25%,transparent 25%),linear-gradient(-45deg,#eee 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eee 75%),linear-gradient(-45deg,transparent 75%,#eee 75%)',
        backgroundSize: '12px 12px',
        backgroundPosition: '0 0,0 6px,6px -6px,-6px 0',
      }}
    >
      <div style={{ height: '100%', background: value }} />
    </div>
    <div style={{ padding: '8px 10px' }}>
      <div style={{ fontSize: 12.5, fontWeight: 600 }}>{name}</div>
      <div style={{ fontSize: 11, color: '#8F8F8F', fontFamily: 'ui-monospace, Menlo, monospace' }}>
        {value}
      </div>
    </div>
  </div>
);
