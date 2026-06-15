import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { BillLayout } from './BillLayout';
import { Button } from '../Button';
import { colors, fonts } from '../../styles/theme';

const meta = {
  title: 'Components/BillLayout',
  component: BillLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The shared frame for the clinic bill/invoice modals (BillModal = services, BillMedicinesModal = pharmacy). Three cards float on a transparent tray: a line-item list on the left, a bill summary + total band top-right, and a payment card bottom-right. Callers pass only the content that differs via the `left`, `summary`, `total`, `payment` and `action` slots.',
      },
    },
  },
} satisfies Meta<typeof BillLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const row = (label: string, value: string) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fonts.size.m, color: colors.neutral900 }}>
    <span style={{ color: colors.neutral600 }}>{label}</span>
    <span>{value}</span>
  </div>
);

/** Skeleton showing the three slots filled with placeholder content. */
export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    total: '₹ 1,200.00',
    header: (
      <span style={{ fontSize: fonts.size.m, fontWeight: fonts.weight.medium, color: colors.neutral900 }}>
        T001 : Ramesh - M 12
      </span>
    ),
    left: (
      <>
        <h3 style={{ margin: 0, fontFamily: fonts.family.secondary, fontSize: fonts.size.h5, fontWeight: fonts.weight.regular, color: colors.neutral900 }}>
          Line items
        </h3>
        <div style={{ border: `1px dashed ${colors.neutral300}`, borderRadius: 8, padding: 24, color: colors.neutral500, fontSize: fonts.size.s }}>
          The left card hosts each modal's own list — the services grid or the medicines table.
        </div>
      </>
    ),
    summary: (
      <>
        {row('Subtotal', '₹ 1,000.00')}
        {row('Discount', '− ₹ 0.00')}
        {row('Tax', '₹ 200.00')}
      </>
    ),
    payment: (
      <div style={{ color: colors.neutral500, fontSize: fonts.size.s, textAlign: 'center' }}>
        Payment controls go here (radios / split-payment rows).
      </div>
    ),
    action: (
      <Button variant="dark" size="sm" style={{ width: '100%' }} onClick={() => {}}>
        Pay ₹ 1,200.00
      </Button>
    ),
  },
};
