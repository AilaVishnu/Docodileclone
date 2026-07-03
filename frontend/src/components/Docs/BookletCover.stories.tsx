import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { BookletCover } from './BookletCover';
import { colors, fonts } from '../../styles/theme';

const meta = {
  title: 'Patterns/Docs/BookletCover',
  component: BookletCover,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A single Docs booklet cover — coloured cover, soft spine, an illustration zone, a serif (Libertinus) title and an uppercase kicker. Used on the `DocsShelf`.',
      },
    },
  },
  args: {
    title: 'How to book an appointment',
    kicker: 'Guide',
  },
  decorators: [(S) => <div style={{ padding: 24, background: colors.primary100 }}><S /></div>],
} satisfies Meta<typeof BookletCover>;

export default meta;
type Story = StoryObj<typeof meta>;

const Cal = () => (
  <svg width="86" height="74" viewBox="0 0 92 78" fill="none">
    <path d="M14 30c10 26 2 40 2 40h44c0-18 6-30 6-30" stroke={colors.neutral900} strokeWidth="1.6" fill="#fff" />
    <rect x="12" y="20" width="46" height="14" rx="2" fill={colors.primary700} />
    <path d="M24 28l2 2 4-4M36 28l2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/** The default cream cover with the appointment illustration. */
export const Default: Story = { args: { art: <Cal /> } };

/** A dark "ink" cover with a serif glyph — for guides that want more contrast. */
export const Ink: Story = {
  args: {
    title: 'Writing prescriptions',
    kicker: 'How-to',
    bg: colors.neutral900,
    fg: colors.primary100,
    accent: colors.primary400,
    art: <span style={{ fontFamily: fonts.family.secondary, fontSize: 54, color: colors.primary400, fontWeight: 600 }}>℞</span>,
  },
};

/** The cover variants side by side. */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
      <BookletCover title="How to book an appointment" kicker="Guide" art={<Cal />} />
      <BookletCover title="Set up your clinic" kicker="Guide" bg={colors.primary300} accent={colors.secondary600} />
      <BookletCover title="Patient privacy" kicker="Policy" bg={colors.neutral900} fg={colors.primary100} accent={colors.secondary500} />
    </div>
  ),
};
