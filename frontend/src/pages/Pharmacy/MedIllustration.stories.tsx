import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { MedIllustration } from './MedIllustration';
import type { Med, MedForm } from './types';

// ── All 8 medication forms, in display order ────────────────────────────────
const FORMS: MedForm[] = ['tablet', 'syrup', 'cream', 'spray', 'soap', 'serum', 'drops', 'ointment'];

// capacityFor() in MedIllustration: tablet counts to 500, everything else to 20.
const CAP: Record<MedForm, number> = {
  tablet: 500, syrup: 20, cream: 20, spray: 20, soap: 20, serum: 20, drops: 20, ointment: 20,
};

/** Minimal Med stub — only `id`, `form`, `unitsInStock` drive the illustration. */
const med = (form: MedForm, frac: number): Med => ({
  id: `${form}-${frac}`,
  name: form,
  category: 'Topicals',
  form,
  invoiceNo: '',
  batch: '',
  packPrice: 0,
  packMrp: 0,
  unitsPerPack: 1,
  unitPrice: 0,
  unitsInStock: Math.round(CAP[form] * frac),
  expiry: '2027-01',
  discountPct: 0,
  gstPct: 0,
});

const Cell = ({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) => (
  <div
    style={{
      border: '1px solid #E3E3E3',
      borderRadius: 12,
      background: '#FBF7EF',
      padding: '14px 10px 10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      width: 132,
    }}
  >
    <div style={{ height: 84, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>{children}</div>
    <div style={{ fontSize: 13, color: '#202020', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: '#8F8F8F', fontFamily: 'Inter, sans-serif' }}>{sub}</div>}
  </div>
);

const meta = {
  title: 'Patterns/Pharmacy/Med Illustrations',
  component: MedIllustration,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The per-form shelf illustrations rendered on each Pharmacy stock tile (`<MedIllustration med>`, 56×80). ' +
          'Form picks the silhouette; current stock fills the body from the bottom up so a tile reads both *what* it is and *how much* is left.',
      },
    },
  },
} satisfies Meta<typeof MedIllustration>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every medication form at full stock — the identity review surface. */
export const AllForms: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
      {FORMS.map((f) => (
        <Cell key={f} label={f}>
          <MedIllustration med={med(f, 1)} />
        </Cell>
      ))}
    </div>
  ),
};

/** Each form across stock levels — full → half → low → empty (the fill mechanic). */
export const StockLevels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {FORMS.map((f) => (
        <div key={f} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 80, fontSize: 13, color: '#202020', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' }}>{f}</div>
          <Cell label="full"><MedIllustration med={med(f, 1)} /></Cell>
          <Cell label="half"><MedIllustration med={med(f, 0.5)} /></Cell>
          <Cell label="low"><MedIllustration med={med(f, 0.1)} /></Cell>
          <Cell label="empty"><MedIllustration med={med(f, 0)} /></Cell>
        </div>
      ))}
    </div>
  ),
};
