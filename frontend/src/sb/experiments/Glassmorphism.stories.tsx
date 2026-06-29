import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { http, HttpResponse } from 'msw';
import { Croc } from '../../components/Chat/Croc';
import { BookAppointment } from '../../components/AppointmentQueue/BookAppointment';
import { withClinicSession } from '../decorators';
import { mockPatients } from '../mockData';
import { API_BASE_URL } from '../../apiConfig';

/**
 * EXPLORATION — not part of the design system. A quick look at how a
 * glassmorphism treatment (frosted, semi-transparent surface + backdrop blur +
 * a hairline highlight border) would feel on Docodile UI. Glass only reads when
 * there's colour/texture behind it, so each story sits on a tinted backdrop.
 */
const meta = {
  title: 'Experiments/Glassmorphism',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Experimental glassmorphism samples (not a shipped pattern). Glass = `background: rgba(white, …)` + `backdrop-filter: blur()` + a white-alpha border, over a colourful backdrop so the blur is visible. `NewAppointment` reskins the REAL `BookAppointment` component by frosting its card surfaces — nothing in the component itself changes.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Shared frosted-glass surface.
const glass: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.14)',
  backdropFilter: 'blur(18px) saturate(160%)',
  WebkitBackdropFilter: 'blur(18px) saturate(160%)',
  border: '1px solid rgba(255, 255, 255, 0.35)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.22)',
};

// A colourful Docodile-toned stage so the blur has something to refract.
function Stage({ children, height = 520 }: { children: React.ReactNode; height?: number }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 720,
        height,
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        background: 'linear-gradient(135deg, #3f5226 0%, #6b8142 48%, #cf6f2f 130%)',
      }}
    >
      <div style={{ position: 'absolute', top: -60, left: -40, width: 260, height: 260, borderRadius: '50%', background: '#9CB85F', filter: 'blur(20px)', opacity: 0.7 }} />
      <div style={{ position: 'absolute', bottom: -70, right: -30, width: 300, height: 300, borderRadius: '50%', background: '#ECA66D', filter: 'blur(24px)', opacity: 0.75 }} />
      <div style={{ position: 'absolute', top: 120, right: 90, width: 120, height: 120, borderRadius: '50%', background: '#F3F3DC', filter: 'blur(16px)', opacity: 0.5 }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

/** An "Ask Croc" assistant card rendered as frosted glass. */
export const AskCroc: Story = {
  render: () => (
    <Stage>
      <div style={{ ...glass, width: 380, padding: 24, borderRadius: 22, color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div style={{ ...glass, width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'none' }}>
            <Croc size={36} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.2 }}>Ask Croc</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)' }}>Clinic-scoped assistant</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {['How many patients are waiting?', 'Show overdue reviews', 'Today’s revenue'].map((s) => (
            <span key={s} style={{ ...glass, fontSize: 12.5, padding: '6px 12px', borderRadius: 999, color: 'rgba(255,255,255,0.92)', boxShadow: 'none' }}>{s}</span>
          ))}
        </div>

        <div style={{ ...glass, display: 'flex', alignItems: 'center', gap: 10, height: 44, borderRadius: 999, padding: '0 6px 0 16px', boxShadow: 'none' }}>
          <span style={{ flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Ask about your clinic…</span>
          <button
            style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.9)', color: '#3f5226', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Send"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></svg>
          </button>
        </div>
      </div>
    </Stage>
  ),
};

/** The same glass treatment on a small "clinic at a glance" stat card. */
export const StatCard: Story = {
  render: () => (
    <Stage>
      <div style={{ ...glass, width: 360, padding: 22, borderRadius: 20, color: '#fff' }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', marginBottom: 2 }}>Skylar Dermatology</div>
        <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 18 }}>Today at a glance</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[['Waiting', '4'], ['In consult', '2'], ['Done', '18']].map(([label, val]) => (
            <div key={label} style={{ ...glass, borderRadius: 14, padding: '12px 10px', textAlign: 'center', boxShadow: 'none' }}>
              <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.78)', marginTop: 6 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </Stage>
  ),
};

// ── Real BookAppointment, reskinned as glass ────────────────────────────────
// The component styles its cards inline (white `rgb(255,255,255)` surfaces, an
// `--active-shade-200` page bg). We override just those, with !important, so the
// untouched component renders frosted over a colour backdrop.
const GLASS_SKIN_CSS = `
.glass-appt [style*="active-shade-200"] { background-color: transparent !important; }
.glass-appt [style*="rgb(255, 255, 255)"],
.glass-appt [style*="rgb(249, 249, 237)"] {
  background-color: rgba(255, 255, 255, 0.7) !important;
  -webkit-backdrop-filter: blur(20px) saturate(135%) !important;
  backdrop-filter: blur(20px) saturate(135%) !important;
  border-color: rgba(120, 120, 110, 0.16) !important;
  box-shadow: 0 6px 22px rgba(70, 80, 50, 0.10) !important;
}
`;

function GlassPageStage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden', background: '#FFFFFF' }}>
      <div style={{ position: 'absolute', top: -120, left: -80, width: 420, height: 420, borderRadius: '50%', background: '#DCE6C8', filter: 'blur(70px)', opacity: 0.5 }} />
      <div style={{ position: 'absolute', bottom: -140, right: -70, width: 500, height: 500, borderRadius: '50%', background: '#F4E2CD', filter: 'blur(80px)', opacity: 0.6 }} />
      <style>{GLASS_SKIN_CSS}</style>
      <div className="glass-appt" style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>{children}</div>
    </div>
  );
}

const DOCTORS = [
  { id: 'd1', name: 'Dr. Anita Rao' },
  { id: 'd2', name: 'Dr. Vikram Shah' },
  { id: 'd3', name: 'Dr. Meera Krishnan' },
];

const SERVICES = [
  { id: 's1', name: 'Consultation', code: 'CONS', price: 500, durationMin: 15, discount: 0, discountMode: '%', gst: 0 },
  { id: 's2', name: 'Acne Scar Treatment', code: 'AST', price: 3500, durationMin: 45, discount: 0, discountMode: '%', gst: 18 },
  { id: 's3', name: 'Laser Hair Removal', code: 'LHR', price: 2500, durationMin: 30, discount: 0, discountMode: '%', gst: 18 },
];

/**
 * The REAL `BookAppointment` screen, frosted. Its white card surfaces are
 * overridden to translucent glass over a Docodile-toned backdrop; the component
 * code is untouched. Shows how the actual page would feel in glassmorphism.
 */
export const NewAppointment: Story = {
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.get(`${API_BASE_URL}/api/tenant/services`, () => HttpResponse.json(SERVICES)),
        http.get(`${API_BASE_URL}/api/patients`, () => HttpResponse.json(mockPatients)),
        http.get(`${API_BASE_URL}/api/tenant/appointments`, () => HttpResponse.json([])),
      ],
    },
  },
  decorators: [
    withClinicSession,
    (StoryFn) => (
      <GlassPageStage>
        <StoryFn />
      </GlassPageStage>
    ),
  ],
  render: () => <BookAppointment doctors={DOCTORS} initialDoctorId="d1" onBack={() => {}} />,
};
