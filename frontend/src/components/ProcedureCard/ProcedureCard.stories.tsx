import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ProcedureCard, emptyProcedure, type ProcedureData } from './ProcedureCard';
import { SectionBlock } from '../SectionBlock';
import { colors } from '../../styles/theme';

// Faux before/after photos (inline SVG data-URIs) so the gallery reads without
// any network or asset — these stand in for real uploaded images.
const faux = (c: string) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='124' height='92'><rect width='100%25' height='100%25' fill='${c}'/></svg>`;

const laser: ProcedureData = {
  name: 'CO₂ laser resurfacing',
  site: 'Left cheek',
  note: 'Fractional CO₂ over the left-cheek scar. Topical anaesthesia 45 min. Two passes, good immediate frosting, no bleeding. Tolerated well.',
  params: [
    { id: 'p1', label: 'Fluence', value: '8', unit: 'J/cm²' },
    { id: 'p2', label: 'Spot size', value: '120', unit: 'µm' },
    { id: 'p3', label: 'Passes', value: '2', unit: '' },
  ],
  images: [
    { id: 'i1', label: 'Before', src: faux('%23E7D5C7') },
    { id: 'i2', label: 'After', src: faux('%23EAC7B5') },
  ],
  consent: true,
  aftercare: 'Ice intermittently for 24h. Bland emollient + SPF 50, avoid sun 2 weeks.',
  followUp: new Date(2026, 6, 8),
};

// Render a single Procedure block — the body wrapped in the shared SectionBlock
// chrome, exactly as it appears in a visit.
function ProcedureBlock({ seed, open }: { seed: ProcedureData; open?: boolean }) {
  const [data, setData] = useState<ProcedureData>(seed);
  return (
    <SectionBlock
      title={data.name.trim() || 'Procedure'}
      icon="stethoscope"
      surface="card"
      summary={data.site}
      defaultOpen={open ?? true}
      onRemove={() => {}}
    >
      <ProcedureCard value={data} onChange={setData} />
    </SectionBlock>
  );
}

const meta = {
  title: 'Components/ProcedureCard',
  component: ProcedureCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The **body** of the "Procedure / Treatment" visit block — an operative record for when the selected service is a procedure, not just a consultation. The chrome (header / collapse / remove / surface) comes from `<SectionBlock>`, so it is "just another block" and a visit can hold several. The **parameter rows** (label → value → unit) are deliberately generic so any procedure fits — biopsy, laser, cryo, peel, injection — without a bespoke form per type. Composed from `Field`, `Switch`, `DateField`, `Button`, `IconButton`, `Icon`.',
      },
    },
  },
  // Cream "visit page" backdrop so the white block card reads in context.
  decorators: [
    (Story) => (
      <div style={{ background: colors.primary200, padding: 24, width: 760, boxSizing: 'border-box' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: { value: { control: false }, onChange: { control: false } },
} satisfies Meta<typeof ProcedureCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Blank block — the doctor fills it in; "+ add parameter / add photo" grow the generic spec. */
export const Empty: Story = { render: () => <ProcedureBlock seed={emptyProcedure()} /> };

/** A completed laser procedure — parameters, before/after photos, consent, aftercare + follow-up. */
export const Filled: Story = { render: () => <ProcedureBlock seed={laser} /> };

/** Collapsed — the header shows a one-line summary (name · site) so a multi-procedure visit stays scannable. */
export const Collapsed: Story = { render: () => <ProcedureBlock seed={laser} open={false} /> };

/** A visit can carry more than one procedure — each is its own block, stacked on the visit sheet. */
export const Multiple: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ProcedureBlock seed={laser} />
      <ProcedureBlock seed={{ ...emptyProcedure(), name: 'Punch biopsy', site: 'Right forearm' }} open={false} />
    </div>
  ),
};
