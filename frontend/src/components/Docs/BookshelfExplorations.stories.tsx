import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { BookletCover } from './BookletCover';
import { Croc } from '../Chat/Croc';
import { colors, fonts } from '../../styles/theme';

/**
 * Spines — a secondary "real library" treatment for the Docs shelf: colored
 * book spines with a couple of guides facing out. Kept as an alternate to the
 * primary `DocsShelf → Library` look; reuse later for dense shelves.
 */
const meta = {
  title: 'Patterns/Docs/Spines (alternate)',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const serif = fonts.family.secondary;
const ink = colors.neutral900;
const cream = colors.primary100;
const clay = colors.primary700;

function Cal() {
  return (
    <svg width="86" height="74" viewBox="0 0 92 78" fill="none">
      <path d="M14 30c10 26 2 40 2 40h44c0-18 6-30 6-30" stroke={ink} strokeWidth="1.6" fill="#fff" />
      <path d="M30 40c8 1 18 1 28-1M28 52c10 1 22 0 32-2" stroke={ink} strokeWidth="1.2" opacity="0.7" />
      <rect x="12" y="20" width="46" height="14" rx="2" fill={clay} />
      <circle cx="20" cy="11" r="4" stroke={ink} strokeWidth="1.6" /><circle cx="32" cy="11" r="4" stroke={ink} strokeWidth="1.6" /><circle cx="44" cy="11" r="4" stroke={ink} strokeWidth="1.6" />
      <path d="M24 28l2 2 4-4M36 28l2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <g transform="rotate(38 70 40)"><rect x="60" y="22" width="9" height="34" rx="2" fill={colors.primary500} /><path d="M60 22h9l-4.5-9z" fill="#f4d9b0" /><path d="M62.2 18l4.6 0-2.3-4.6z" fill={ink} /></g>
    </svg>
  );
}

function Spine({ title, bg, fg = ink, accent, h = 180, w = 44, lean = false }: { title: string; bg: string; fg?: string; accent: string; h?: number; w?: number; lean?: boolean }) {
  return (
    <div
      style={{
        width: w, height: h, flexShrink: 0, background: bg, color: fg,
        borderRadius: '3px 3px 2px 2px',
        boxShadow: 'inset -4px 0 7px rgba(0,0,0,0.14), inset 4px 0 5px rgba(255,255,255,0.16), 0 8px 14px rgba(0,0,0,0.10)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 0', transform: lean ? 'rotate(-8deg)' : 'none', transformOrigin: 'bottom left',
        marginRight: lean ? 10 : 0,
      }}
    >
      <div style={{ width: '64%', height: 3, background: accent, borderRadius: 2 }} />
      <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', fontFamily: serif, fontSize: 13.5, fontWeight: 500, letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', maxHeight: h - 56 }}>{title}</div>
      <div style={{ width: '64%', height: 3, background: accent, borderRadius: 2, opacity: 0.55 }} />
    </div>
  );
}

/** Spines + a couple of covers facing out — a dense, library-style shelf. */
export const Spines: Story = {
  render: () => (
    <div style={{ minHeight: '100vh', background: colors.primary100, padding: '30px 40px', fontFamily: fonts.family.primary }}>
      <h2 style={{ margin: 0, fontFamily: serif, fontSize: 26, fontWeight: 600, color: ink }}>Docs</h2>
      <p style={{ margin: '4px 0 26px', fontSize: 14, color: colors.neutral600 }}>Spine-out shelf, with featured guides facing front.</p>
      <div style={{ position: 'relative', maxWidth: 880 }}>
        <div style={{ display: 'flex', gap: 9, alignItems: 'flex-end', padding: '6px 14px 0' }}>
          <BookletCover title="How to book an appointment" kicker="Guide" art={<Cal />} width={132} />
          <Spine title="Set up your clinic" bg={colors.primary300} accent={colors.secondary600} h={182} w={46} />
          <Spine title="Invite your team" bg={colors.primary500} accent={ink} h={170} w={40} />
          <Spine title="Writing prescriptions" bg={ink} fg={cream} accent={colors.primary400} h={188} w={48} />
          <Spine title="Pharmacy & stock" bg={colors.primary200} accent={colors.primary600} h={166} w={42} />
          <Spine title="Bills & payments" bg={clay} fg={cream} accent={cream} h={178} w={44} />
          <BookletCover title="Meet Croc" kicker="New" bg={colors.primary300} accent={colors.secondary600} art={<Croc size={58} />} width={132} />
          <Spine title="Patient privacy" bg={colors.secondary600} fg={cream} accent={cream} h={174} w={42} />
          <Spine title="Data & consent" bg={colors.primary400} accent={ink} h={160} w={40} lean />
        </div>
        <div style={{ height: 13, borderRadius: 3, background: colors.primary300, boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.5)' }} />
        <div style={{ height: 7, borderRadius: '0 0 4px 4px', background: colors.primary400 }} />
        <div style={{ height: 16, background: 'linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0))' }} />
      </div>
    </div>
  ),
};
