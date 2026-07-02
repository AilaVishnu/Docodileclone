import React, { useState, useEffect, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { colors, fonts, spacing, radii, strokes, shadows, motion } from '../../styles/theme';
import { Button } from '../../components/Button/Button';
import { Field } from '../../components/Field/Field';
import { IconButton } from '../../components/IconButton/IconButton';
import { Switch } from '../../components/Switch/Switch';
import { Tabs } from '../../components/Tabs/Tabs';
import { Toast } from '../../components/Toast/Toast';
import { Icon } from '../../components/Icon';
import { LottieIcon, LottieIconHandle } from '../../components/Icon/LottieIcon';
import homeLottie from '../../assets/lottie/home.json';

// Foundations/Motion — the microinteraction language. Sits alongside Colors /
// Typography / Spacing as a token reference, with live "hover to play" rails so
// the durations and easings are felt, not just read.
const meta = {
  title: 'Foundations/Motion',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

const page: React.CSSProperties = {
  fontFamily: fonts.family.primary, color: colors.neutral900, padding: 48,
  maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 44,
};
const h1: React.CSSProperties = { fontSize: fonts.size.h3, fontWeight: fonts.weight.medium, margin: 0 };
const h2: React.CSSProperties = { fontSize: fonts.size.h5, fontWeight: fonts.weight.medium, margin: `0 0 ${spacing.m} 0` };
const lead: React.CSSProperties = { fontSize: fonts.size.m, lineHeight: fonts.lineHeight.m, color: colors.neutral600, margin: 0, maxWidth: 660 };
const cap: React.CSSProperties = { fontSize: fonts.control.sm, color: colors.neutral500 };
const mono: React.CSSProperties = { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: fonts.control.sm, color: colors.neutral700 };

// A hover-to-play rail: a dot travels the track with the given duration+easing.
function Rail({ duration, easing }: { duration: string; easing: string }) {
  const [go, setGo] = useState(false);
  return (
    <div
      onMouseEnter={() => setGo(true)}
      onMouseLeave={() => setGo(false)}
      title="hover to play"
      style={{ position: 'relative', width: 260, height: 12, background: colors.primary200, borderRadius: radii.pill, cursor: 'pointer', flexShrink: 0 }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 12, height: 12, borderRadius: radii.pill,
        background: colors.active.shade700,
        transform: go ? 'translateX(248px)' : 'translateX(0)',
        transition: `transform ${duration} ${easing}`,
      }} />
    </div>
  );
}

function Row({ name, value, children }: { name: string; value: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.l }}>
      <div style={{ width: 92, ...cap }}>{name}</div>
      {children}
      <code style={mono}>{value}</code>
    </div>
  );
}

function MotionPage() {
  const [notes, setNotes] = useState('');
  return (
    <div style={page}>
      <div>
        <h1 style={h1}>Motion</h1>
        <p style={lead}>
          Subtle microinteractions that give feedback and affordance — never decoration.
          One small vocabulary (three durations, three easings) keeps every interaction
          consistent, and everything collapses to an instant state change under{' '}
          <code style={mono}>prefers-reduced-motion</code>.
        </p>
      </div>

      <div>
        <h2 style={h2}>Durations</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.m }}>
          <Row name="fast" value={motion.duration.fast}><Rail duration={motion.duration.fast} easing={motion.ease.standard} /></Row>
          <Row name="base" value={motion.duration.base}><Rail duration={motion.duration.base} easing={motion.ease.standard} /></Row>
          <Row name="slow" value={motion.duration.slow}><Rail duration={motion.duration.slow} easing={motion.ease.standard} /></Row>
        </div>
        <p style={{ ...cap, marginTop: spacing.m }}>Hover a rail to play. fast = presses / toggles · base = most state changes · slow = larger overlays entering.</p>
      </div>

      <div>
        <h2 style={h2}>Easings</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.m }}>
          <Row name="standard" value={motion.ease.standard}><Rail duration="500ms" easing={motion.ease.standard} /></Row>
          <Row name="entrance" value={motion.ease.entrance}><Rail duration="500ms" easing={motion.ease.entrance} /></Row>
          <Row name="exit" value={motion.ease.exit}><Rail duration="500ms" easing={motion.ease.exit} /></Row>
        </div>
        <p style={{ ...cap, marginTop: spacing.m }}>Slowed to 500ms to show the curve. standard = symmetric UI moves · entrance = decelerate in · exit = accelerate out.</p>
      </div>

      <div>
        <h2 style={h2}>Principles</h2>
        <ul style={{ ...lead, paddingLeft: spacing.l, display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
          <li>Purposeful — motion signals feedback (a press, a toggle) or affordance, not delight for its own sake.</li>
          <li>Subtle — short (120–200ms) and small (2–4px / 0.97–1.02 scale). If you notice the animation, it's too much.</li>
          <li>Cheap — transform &amp; opacity only. Never animate layout (width / height / top / left).</li>
          <li>Accessible — respects <code style={mono}>prefers-reduced-motion</code>; a focus state never relies on motion alone.</li>
          <li>Consistent — always from these tokens; no ad-hoc per-component durations.</li>
        </ul>
      </div>

      <div>
        <h2 style={h2}>Pilot — try it</h2>
        <p style={{ ...cap, marginBottom: spacing.l }}>The first two primitives wired up. Press a button (scale-down) and focus the field (edge deepens to the accent, animated).</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xl, flexWrap: 'wrap' }}>
          <Button variant="primary">Press me</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="light">Light</Button>
          <div style={{ width: 220 }}><Field variant="box" value={notes} onChange={setNotes} placeholder="Focus me" /></div>
        </div>
      </div>
    </div>
  );
}

export const Motion: Story = { render: () => <MotionPage /> };

// A labelled interaction row — the live component(s) + how to trigger them.
function Interaction({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.s, paddingBottom: spacing.l, borderBottom: `1px solid ${colors.neutral200}` }}>
      <div>
        <div style={{ fontSize: fonts.size.m, fontWeight: fonts.weight.medium, color: colors.neutral900 }}>{title}</div>
        <div style={cap}>{hint}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.l, flexWrap: 'wrap' }}>{children}</div>
    </div>
  );
}

// Interactions — every wired microinteraction on one page, so the whole set can
// be reviewed and calibrated together. Each is live: hover / click / focus /
// toggle to feel it.
function InteractionsGallery() {
  const [field, setField] = useState('');
  const [on, setOn] = useState(false);
  const [tab, setTab] = useState('overview');
  const [toast, setToast] = useState(false);
  return (
    <div style={page}>
      <div>
        <h1 style={h1}>Microinteractions — review</h1>
        <p style={lead}>Every wired interaction in one place. They're temporal — hover, click, focus, or toggle each to feel it. All driven by the motion tokens and reduced-motion-safe.</p>
      </div>

      <Interaction title="Button — press" hint="Click and hold: pushes down + darkens, like a key.">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="light">Light</Button>
      </Interaction>

      <Interaction title="IconButton — press" hint="Hover for the halo; click to press it deeper.">
        <IconButton ariaLabel="Close" />
        <IconButton ariaLabel="Delete"><Icon name="trash" tone="inherit" /></IconButton>
      </Interaction>

      <Interaction title="Field — focus" hint="Click into it: the edge deepens to the accent (animated).">
        <div style={{ width: 240 }}><Field variant="box" value={field} onChange={setField} placeholder="Focus me" /></div>
      </Interaction>

      <Interaction title="Switch — toggle" hint="Click: the thumb springs across and settles.">
        <Switch checked={on} onChange={setOn} />
      </Interaction>

      <Interaction title="Tabs — sliding pill" hint="Switch tabs: the pill slides across to follow.">
        <Tabs variant="block" inline items={[{ id: 'overview', label: 'Overview' }, { id: 'details', label: 'Details' }, { id: 'history', label: 'History' }]} activeId={tab} onSelect={setTab} />
      </Interaction>

      <Interaction title="Toast — in / out" hint="Fire it: slides in from the right, then back out (bottom-right).">
        <Button variant="primary" onClick={() => setToast(true)}>Show toast</Button>
        <Toast message="Prescription saved" isVisible={toast} onClose={() => setToast(false)} duration={2500} />
      </Interaction>
    </div>
  );
}

export const Interactions: Story = { render: () => <InteractionsGallery /> };

// ─── Options — interaction-style picker ──────────────────────────────────────
// For each primitive, several candidate interaction treatments side by side.
// Every option is built from the same DS tokens (only the MOTION differs), so
// the choice is apples-to-apples. Pick one per component; the winner gets baked
// into the real component (the way Toast's in/out already was).

const optSectionWrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: spacing.s, paddingBottom: spacing.xl, borderBottom: `1px solid ${colors.neutral200}` };
const optRow: React.CSSProperties = { display: 'flex', gap: spacing.m, flexWrap: 'wrap' };
const optCardStyle: React.CSSProperties = { flex: '1 1 160px', minWidth: 160, minHeight: 128, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: spacing.s, padding: spacing.m, border: `1px solid ${colors.neutral200}`, borderRadius: radii.xl, backgroundColor: colors.neutral100 };
const optName: React.CSSProperties = { fontSize: fonts.size.s, fontWeight: fonts.weight.semibold, color: colors.neutral900 };
const optDesc: React.CSSProperties = { fontSize: fonts.size.xs, color: colors.neutral500, textAlign: 'center', lineHeight: 1.35 };

function OptSection({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section style={optSectionWrap}>
      <div>
        <div style={{ fontSize: fonts.size.l, fontWeight: fonts.weight.semibold, color: colors.neutral900 }}>{title}</div>
        <div style={cap}>{note}</div>
      </div>
      <div style={optRow}>{children}</div>
    </section>
  );
}
function OptCard({ name, desc, children }: { name: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={optCardStyle}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
      <div>
        <div style={optName}>{name}</div>
        <div style={optDesc}>{desc}</div>
      </div>
    </div>
  );
}

// Shared bits used by the demo primitives (matched to the real DS components).
const miniBtn: React.CSSProperties = { border: `${strokes.s} solid ${colors.active.shade600}`, background: 'transparent', color: colors.active.shade700, borderRadius: radii.pill, padding: '4px 14px', fontSize: fonts.size.xs, fontFamily: fonts.family.primary, cursor: 'pointer' };
const toastChip: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, backgroundColor: colors.neutral100, border: `1px solid ${colors.neutral200}`, borderRadius: radii['2xl'], padding: `${spacing.xs} ${spacing.m}`, boxShadow: shadows.menu, boxSizing: 'border-box' };

// Button — real base look (pill / shade700 / white), motion is the variable.
const BTN_BASE: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, border: `${strokes.s} solid ${colors.active.shade700}`, backgroundColor: colors.active.shade700, color: colors.neutral100, padding: '8px 18px', height: 42, fontSize: fonts.size.s, fontWeight: fonts.weight.medium, fontFamily: fonts.family.primary, cursor: 'pointer', outline: 'none', userSelect: 'none' };
function DemoButton({ variant }: { variant: 'scale' | 'lift' | 'spring' | 'sink' | 'deepsink' | 'squish' | 'emboss' }) {
  const [pressed, setPressed] = useState(false);
  const [hover, setHover] = useState(false);
  let dyn: React.CSSProperties = {};
  let transition = '';
  if (variant === 'scale') {
    dyn = { transform: pressed ? 'scale(0.97)' : 'scale(1)' };
    transition = 'transform var(--motion-fast) var(--ease-standard)';
  } else if (variant === 'lift') {
    dyn = { transform: hover && !pressed ? 'translateY(-2px)' : 'translateY(0)', boxShadow: hover && !pressed ? '0 6px 16px rgba(0,0,0,0.18)' : '0 0 0 rgba(0,0,0,0)' };
    transition = 'transform var(--motion-base) var(--ease-standard), box-shadow var(--motion-base) var(--ease-standard)';
  } else if (variant === 'spring') {
    dyn = { transform: pressed ? 'scale(0.92)' : 'scale(1)' };
    transition = pressed ? 'transform var(--motion-fast) var(--ease-standard)' : 'transform 260ms cubic-bezier(0.34,1.56,0.64,1)';
  } else if (variant === 'sink') {
    dyn = { transform: pressed ? 'translateY(1.5px)' : 'translateY(0)', backgroundColor: pressed ? colors.active.shade800 : colors.active.shade700, boxShadow: pressed ? 'inset 0 2px 5px rgba(0,0,0,0.28)' : 'inset 0 0 0 rgba(0,0,0,0)' };
    transition = 'transform var(--motion-fast) var(--ease-standard), background-color var(--motion-fast) var(--ease-standard), box-shadow var(--motion-fast) var(--ease-standard)';
  } else if (variant === 'deepsink') {
    dyn = { transform: pressed ? 'translateY(2px) scale(0.985)' : 'none', backgroundColor: pressed ? colors.active.shade800 : colors.active.shade700, boxShadow: pressed ? 'inset 0 3px 7px rgba(0,0,0,0.34)' : 'inset 0 0 0 rgba(0,0,0,0)' };
    transition = 'transform var(--motion-fast) var(--ease-standard), background-color var(--motion-fast) var(--ease-standard), box-shadow var(--motion-fast) var(--ease-standard)';
  } else if (variant === 'squish') {
    dyn = { transform: pressed ? 'scaleX(1.05) scaleY(0.9)' : 'scale(1)', transformOrigin: 'center bottom' };
    transition = 'transform var(--motion-fast) var(--ease-standard)';
  } else {
    // emboss — a raised keycap edge that sinks flat on press.
    dyn = { transform: pressed ? 'translateY(3px)' : 'translateY(0)', boxShadow: pressed ? `0 0 0 ${colors.active.shade800}` : `0 3px 0 ${colors.active.shade800}` };
    transition = 'transform var(--motion-fast) var(--ease-standard), box-shadow var(--motion-fast) var(--ease-standard)';
  }
  return (
    <button style={{ ...BTN_BASE, ...dyn, transition }} onPointerDown={() => setPressed(true)} onPointerUp={() => setPressed(false)} onPointerEnter={() => setHover(true)} onPointerLeave={() => { setPressed(false); setHover(false); }}>Primary</button>
  );
}

// Field — the focus treatment must adapt to every field TYPE (the real Field has
// underline / box / pill shapes × outline / filled-cream surfaces). So these
// demos render each candidate effect across all of them — matching Field.tsx's
// own per-variant focusFor(): underline → bottom line; filled → inset edge;
// box/pill → border. The matrix makes the trade-offs visible (e.g. "fill to
// cream" is a no-op on a field that's already cream).
type MFVariant = 'underline' | 'box' | 'filled' | 'pill';
type MFFocus = 'edge' | 'glow' | 'fill';
const FIELD_VARIANTS: { key: MFVariant; label: string }[] = [
  { key: 'underline', label: 'Underline' },
  { key: 'box', label: 'Box' },
  { key: 'filled', label: 'Filled' },
  { key: 'pill', label: 'Pill' },
];
function fieldGeom(v: MFVariant): React.CSSProperties {
  if (v === 'underline') return { padding: '6px 8px', borderBottom: `${strokes.xs} solid ${colors.neutral300}` };
  if (v === 'filled') return { height: 38, padding: '0 12px', borderRadius: radii.m, border: 'none', backgroundColor: colors.primary100 };
  if (v === 'pill') return { height: 38, padding: '0 16px', borderRadius: radii.full, border: `${strokes.xs} solid ${colors.primary300}`, backgroundColor: colors.neutral100 };
  return { height: 38, padding: '0 12px', borderRadius: radii.m, border: `${strokes.xs} solid ${colors.neutral300}`, backgroundColor: colors.neutral100 };
}
function fieldFocus(focus: MFFocus, v: MFVariant): React.CSSProperties {
  const accent = colors.active.shade600;
  const edge: React.CSSProperties = v === 'underline' ? { borderBottomColor: accent }
    : v === 'filled' ? { boxShadow: `inset 0 0 0 ${strokes.s} ${accent}` }
    : { borderColor: accent };
  if (focus === 'edge') return edge;
  if (focus === 'glow') {
    const ring = `0 0 0 3px ${colors.active.shade200}`;
    return { ...edge, boxShadow: v === 'filled' ? `inset 0 0 0 ${strokes.s} ${accent}, ${ring}` : ring };
  }
  return { ...edge, backgroundColor: colors.primary100 };
}
function MField({ focus, variant }: { focus: MFFocus; variant: MFVariant }) {
  const [f, setF] = useState(false);
  return <input placeholder="Focus" onFocus={() => setF(true)} onBlur={() => setF(false)} style={{ width: '100%', boxSizing: 'border-box', fontSize: fonts.control.md, fontFamily: fonts.family.primary, color: colors.neutral900, outline: 'none', ...fieldGeom(variant), ...(f ? fieldFocus(focus, variant) : {}), transition: 'border-color var(--motion-base) var(--ease-standard), box-shadow var(--motion-base) var(--ease-standard), background-color var(--motion-base) var(--ease-standard)' }} />;
}
function DemoFieldMatrix() {
  const focuses: { key: MFFocus; label: string }[] = [
    { key: 'edge', label: 'A · Edge' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '76px repeat(4, 1fr)', gap: spacing.m, alignItems: 'center', width: '100%' }}>
      <div />
      {FIELD_VARIANTS.map((v) => <div key={v.key} style={{ fontSize: fonts.size.xs, fontWeight: fonts.weight.semibold, color: colors.neutral600, textAlign: 'center' }}>{v.label}</div>)}
      {focuses.map((fo) => (
        <React.Fragment key={fo.key}>
          <div style={{ fontSize: fonts.size.s, fontWeight: fonts.weight.semibold, color: colors.neutral900 }}>{fo.label}</div>
          {FIELD_VARIANTS.map((v) => <MField key={v.key} focus={fo.key} variant={v.key} />)}
        </React.Fragment>
      ))}
    </div>
  );
}

// Switch — real geometry (36×20, thumb 16, travel 18); motion is the variable.
function DemoSwitch({ variant }: { variant: 'slide' | 'spring' | 'pop' }) {
  const [on, setOn] = useState(false);
  const W = 36, H = 20, TH = 16, TR = 16;
  let tf = '', tt = '';
  if (variant === 'slide') { tf = `translateX(${on ? TR + 2 : 2}px)`; tt = 'transform var(--motion-base) var(--ease-standard)'; }
  else if (variant === 'spring') { tf = `translateX(${on ? TR + 2 : 2}px)`; tt = 'transform 300ms cubic-bezier(0.34,1.56,0.64,1)'; }
  else { tf = `translateX(${on ? TR + 2 : 2}px) scale(${on ? 1.15 : 1})`; tt = 'transform var(--motion-base) var(--ease-standard)'; }
  return (
    <span role="switch" aria-checked={on} tabIndex={0} onClick={() => setOn(!on)} onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setOn(!on); } }} style={{ width: W, height: H, borderRadius: 999, backgroundColor: on ? colors.active.shade600 : colors.neutral300, position: 'relative', cursor: 'pointer', transition: 'background-color var(--motion-base) var(--ease-standard)', display: 'inline-block' }}>
      <span style={{ position: 'absolute', top: (H - TH) / 2, left: 0, width: TH, height: TH, borderRadius: '50%', backgroundColor: colors.neutral100, boxShadow: '0 1px 2px rgba(0,0,0,0.15)', transform: tf, transition: tt, display: 'block' }} />
    </span>
  );
}

// Tabs — block variant; the active-indicator treatment is the variable.
function DemoTabs({ variant }: { variant: 'crossfade' | 'pill' | 'underline' }) {
  const [i, setI] = useState(0);
  const items = ['Vitals', 'History', 'Rx'];
  if (variant === 'crossfade') {
    return (
      <div style={{ display: 'flex', gap: spacing.xs, background: colors.alphaBlack0, padding: 4, borderRadius: radii.xl }}>
        {items.map((t, idx) => (
          <button key={t} onClick={() => setI(idx)} style={{ border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: radii.m, fontSize: fonts.size.s, fontFamily: fonts.family.primary, backgroundColor: i === idx ? colors.neutral100 : 'transparent', color: i === idx ? colors.neutral900 : colors.neutral500, transition: 'background-color var(--motion-base) var(--ease-standard), color var(--motion-base) var(--ease-standard)' }}>{t}</button>
        ))}
      </div>
    );
  }
  return (
    <div style={{ position: 'relative', display: 'flex', width: 228, background: variant === 'pill' ? colors.alphaBlack0 : 'transparent', padding: 4, borderRadius: radii.xl, borderBottom: variant === 'underline' ? `1px solid ${colors.neutral200}` : 'none' }}>
      {variant === 'pill' && (
        <span style={{ position: 'absolute', top: 4, bottom: 4, left: 4, width: 'calc((100% - 8px) / 3)', backgroundColor: colors.neutral100, borderRadius: radii.m, boxShadow: shadows.card, transform: `translateX(${i * 100}%)`, transition: 'transform var(--motion-slow) var(--ease-standard)' }} />
      )}
      {variant === 'underline' && (
        <span style={{ position: 'absolute', bottom: -1, left: 4, height: 2, width: 'calc((100% - 8px) / 3)', backgroundColor: colors.active.shade600, transform: `translateX(${i * 100}%)`, transition: 'transform var(--motion-slow) var(--ease-standard)' }} />
      )}
      {items.map((t, idx) => (
        <button key={t} onClick={() => setI(idx)} style={{ position: 'relative', zIndex: 1, flex: 1, border: 'none', background: 'none', cursor: 'pointer', padding: '6px 4px', fontSize: fonts.size.s, fontFamily: fonts.family.primary, color: i === idx ? (variant === 'underline' ? colors.active.shade700 : colors.neutral900) : colors.neutral500, transition: 'color var(--motion-base) var(--ease-standard)' }}>{t}</button>
      ))}
    </div>
  );
}

// IconButton — circular; press treatment is the variable.
const ICONBTN_BASE: React.CSSProperties = { width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: colors.neutral700, cursor: 'pointer', outline: 'none' };
function DemoIconButton({ variant }: { variant: 'scale' | 'halo' | 'spring' }) {
  const [p, setP] = useState(false);
  const [h, setH] = useState(false);
  let transform = 'scale(1)', transition = '';
  let bg: React.CSSProperties = {};
  if (variant === 'scale') { transform = p ? 'scale(0.9)' : 'scale(1)'; transition = 'transform var(--motion-fast) var(--ease-standard)'; }
  else if (variant === 'halo') { transform = p ? 'scale(0.92)' : 'scale(1)'; transition = 'transform var(--motion-fast) var(--ease-standard), background-color var(--motion-base) var(--ease-standard)'; bg = { backgroundColor: h ? colors.alphaBlack0 : 'transparent' }; }
  else { transform = p ? 'scale(0.82)' : 'scale(1)'; transition = p ? 'transform var(--motion-fast) var(--ease-standard)' : 'transform 260ms cubic-bezier(0.34,1.56,0.64,1)'; }
  return (
    <button style={{ ...ICONBTN_BASE, ...bg, transform, transition }} onPointerDown={() => setP(true)} onPointerUp={() => setP(false)} onPointerEnter={() => setH(true)} onPointerLeave={() => { setP(false); setH(false); }}>
      <Icon name="trash" tone="inherit" style={{ width: 20, height: 20 }} />
    </button>
  );
}

// Toast — inline (in-card) enter/exit; the transition shape is the variable.
function DemoToast({ variant }: { variant: 'rise' | 'right' | 'pop' }) {
  const [on, setOn] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (on) { setRendered(true); const r = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(r); }
    setShown(false); const t = setTimeout(() => setRendered(false), 240); return () => clearTimeout(t);
  }, [on]);
  useEffect(() => { if (on) { const t = setTimeout(() => setOn(false), 1900); return () => clearTimeout(t); } }, [on]);
  const hidden = variant === 'rise' ? 'translateY(12px)' : variant === 'right' ? 'translateX(24px)' : 'scale(0.9)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.s, width: '100%' }}>
      <button style={miniBtn} onClick={() => setOn(true)}>Fire</button>
      <div style={{ position: 'relative', height: 40, width: '100%' }}>
        {rendered && (
          <div style={{ position: 'absolute', left: '50%', bottom: 0, marginLeft: -70, width: 140, ...toastChip, opacity: shown ? 1 : 0, transform: shown ? 'none' : hidden, transition: shown ? 'opacity var(--motion-base) var(--ease-entrance), transform var(--motion-base) var(--ease-entrance)' : 'opacity var(--motion-fast) var(--ease-exit), transform var(--motion-fast) var(--ease-exit)' }}>
            <Icon name="trash" tone="inherit" style={{ width: 18, height: 18 }} />
            <span style={{ fontSize: fonts.size.xs, color: colors.neutral900 }}>Saved</span>
          </div>
        )}
      </div>
    </div>
  );
}

function OptionsPage() {
  return (
    <div style={page}>
      <div>
        <h1 style={h1}>Microinteractions — selected</h1>
        <p style={lead}>The chosen interaction per component; the rejected candidates have been removed. Each is now baked into the real component — feel them live on the Interactions page.</p>
      </div>

      <OptSection title="Button — press (selected: D · Key-press)" note="Baked into the real Button — pushes down + darkens on press.">
        <OptCard name="D · Key-press" desc="Pushes down + darkens, like a key"><DemoButton variant="sink" /></OptCard>
      </OptSection>

      <OptSection title="Field — focus (selected: A · Edge)" note="Already the DS default — the edge deepens to the accent, adapting per field type (Underline · Box · Filled · Pill).">
        <DemoFieldMatrix />
      </OptSection>

      <OptSection title="Switch — toggle (selected: B · Spring)" note="Baked into the real Switch — the thumb overshoots and settles.">
        <OptCard name="B · Spring" desc="Overshoots, then settles"><DemoSwitch variant="spring" /></OptCard>
      </OptSection>

      <OptSection title="Tabs — active indicator (selected: B · Sliding pill)" note="Baked into the shared block Tabs. (The Rx section nav gets a sliding underline separately.)">
        <OptCard name="B · Sliding pill" desc="White pill slides across"><DemoTabs variant="pill" /></OptCard>
      </OptSection>

      <OptSection title="IconButton — press (selected: Halo)" note="Baked into the real IconButton — the hover halo deepens on press.">
        <OptCard name="B · Halo" desc="A circle fades in on hover, deepens on press"><DemoIconButton variant="halo" /></OptCard>
      </OptSection>

      <OptSection title="Toast — enter / exit (selected: B · Slide-in)" note="Baked into the real Toast — slides in from the right.">
        <OptCard name="B · Slide-in" desc="In from the right"><DemoToast variant="right" /></OptCard>
      </OptSection>
    </div>
  );
}
export const Options: Story = { render: () => <OptionsPage /> };

// ─── Sidebar — active-icon animation picker ──────────────────────────────────
// On module change, the newly-active sidebar icon plays a brief animation. These
// candidates animate the icon AS A WHOLE (via the Web Animations API) so nothing
// in the icon SVGs is touched (DS rule 3) and it works for every icon uniformly.
// Each is reduced-motion-safe (skipped when the OS "reduce motion" is set).
const NAV_ANIMS: Record<string, { desc: string; frames: Keyframe[]; opts: KeyframeAnimationOptions }> = {
  pop:    { desc: 'Scales up, springs back',      frames: [{ transform: 'scale(1)', offset: 0 }, { transform: 'scale(1.32)', offset: 0.5 }, { transform: 'scale(1)', offset: 1 }], opts: { duration: 420, easing: 'cubic-bezier(0.34,1.56,0.64,1)' } },
  bounce: { desc: 'Hops up, then settles',        frames: [{ transform: 'translateY(0)' }, { transform: 'translateY(-9px)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-3px)' }, { transform: 'translateY(0)' }], opts: { duration: 620, easing: 'ease-out' } },
  wiggle: { desc: 'Quick playful tilt',           frames: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-12deg)' }, { transform: 'rotate(10deg)' }, { transform: 'rotate(-5deg)' }, { transform: 'rotate(0deg)' }], opts: { duration: 460, easing: 'ease-in-out' } },
  ping:   { desc: 'Pulses with an outward ring',  frames: [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], opts: { duration: 460, easing: 'ease-out' } },
  spin:   { desc: 'A full turn (nice on the gear)', frames: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], opts: { duration: 520, easing: 'cubic-bezier(0.2,0,0,1)' } },
};
// A mock sidebar item (active state) whose icon replays `variant` on click —
// standing in for "this module was just selected".
function NavAnim({ variant, icon }: { variant: keyof typeof NAV_ANIMS; icon: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const play = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const a = NAV_ANIMS[variant];
    ref.current?.animate(a.frames, a.opts);
    if (variant === 'ping') ringRef.current?.animate([{ transform: 'scale(0.6)', opacity: 0.45 }, { transform: 'scale(1.9)', opacity: 0 }], { duration: 560, easing: 'ease-out' });
  };
  return (
    <div onClick={play} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 4px', width: 76, borderRadius: 8, backgroundColor: colors.active.shade200, color: colors.neutral900, cursor: 'pointer' }}>
      <div style={{ position: 'relative', display: 'flex' }}>
        {variant === 'ping' && <span ref={ringRef} aria-hidden style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: `2px solid ${colors.active.shade600}`, opacity: 0, pointerEvents: 'none' }} />}
        <div ref={ref} style={{ display: 'flex' }}>{icon}</div>
      </div>
      <span style={{ fontSize: fonts.size.caption, fontWeight: fonts.weight.medium }}>Home</span>
    </div>
  );
}
function SidebarIconsPage() {
  return (
    <div style={page}>
      <div>
        <h1 style={h1}>Sidebar — active-icon animation</h1>
        <p style={lead}>When you switch modules, the newly-active sidebar icon plays a brief animation. Pick the motion — <b>click each icon to replay it</b>. It applies to every sidebar icon (same motion, whichever module you land on), and is reduced-motion-safe.</p>
      </div>
      <OptSection title="Options" note="Click an icon to replay its 'just activated' moment.">
        <OptCard name="Pop" desc="Scales up, springs back"><NavAnim variant="pop" icon={<Icon name="home" tone="inherit" />} /></OptCard>
        <OptCard name="Bounce" desc="Hops up, then settles"><NavAnim variant="bounce" icon={<Icon name="home" tone="inherit" />} /></OptCard>
        <OptCard name="Wiggle" desc="Quick playful tilt"><NavAnim variant="wiggle" icon={<Icon name="home" tone="inherit" />} /></OptCard>
        <OptCard name="Pulse" desc="Pulses with an outward ring"><NavAnim variant="ping" icon={<Icon name="home" tone="inherit" />} /></OptCard>
        <OptCard name="Spin" desc="A full turn"><NavAnim variant="spin" icon={<Icon name="home" tone="inherit" />} /></OptCard>
      </OptSection>
      <p style={{ ...cap, marginTop: 0 }}>This animates each icon as a whole (DS-safe — no icon SVGs touched). Bespoke per-icon motion (gear spins, bell rings…) is a larger, separate effort if you want it later.</p>
    </div>
  );
}
export const SidebarIcons: Story = { render: () => <SidebarIconsPage /> };

// ─── Sidebar — Lottie pilot (Home) ───────────────────────────────────────────
// The downloaded house Lottie, recoloured to DS ink, playing a one-shot on
// "activation". Click a tile to replay. This is the chosen direction (real
// animated icons) — pilot on Home before wiring into SideNavItem + sourcing the
// rest of the set.
function LottiePilotItem({ size }: { size: number }) {
  const ref = useRef<LottieIconHandle>(null);
  return (
    <div onClick={() => ref.current?.play()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 4px', borderRadius: 8, backgroundColor: colors.active.shade200, color: colors.neutral900, cursor: 'pointer' }}>
      <LottieIcon ref={ref} animationData={homeLottie} size={size} />
      <span style={{ fontSize: fonts.size.caption, fontWeight: fonts.weight.medium }}>Home</span>
    </div>
  );
}
function SidebarLottiePage() {
  return (
    <div style={page}>
      <div>
        <h1 style={h1}>Sidebar — animated icons (Lottie pilot)</h1>
        <p style={lead}>The <b>Home</b> icon as a Lottie, recoloured to the DS ink. It plays a one-shot when its module becomes active — <b>click a tile to replay</b>. Perf: it only animates on activation (otherwise it rests on frame 0), so idle cost is zero; the Lottie player is a one-time bundle add.</p>
      </div>
      <OptSection title="Home — recoloured Lottie" note="Click a tile to play the 'just activated' animation.">
        <OptCard name="24px" desc="Sidebar size"><LottiePilotItem size={24} /></OptCard>
        <OptCard name="48px" desc="Detail"><LottiePilotItem size={48} /></OptCard>
        <OptCard name="96px" desc="Full detail"><LottiePilotItem size={96} /></OptCard>
      </OptSection>
      <p style={{ ...cap, marginTop: 0 }}>Next: if the look's right, I wire this into <b>SideNavItem</b> (plays when you switch to Home in the app), and you source a style-matched Lottie for the other 9 modules. Reduced-motion jumps to the final frame instead of animating.</p>
    </div>
  );
}
export const SidebarLottie: Story = { render: () => <SidebarLottiePage /> };
