import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Radio } from './Radio';
import { colors } from '../../styles/theme';

const meta = {
  title: 'Components/Radio',
  component: Radio,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'One labelled radio option — a native radio tinted with the neutral900 accent + a control-font label. Prefer **RadioGroup** for a set of options; reach for `Radio` directly only when you need custom composition (RadioGroup is built from it).',
      },
    },
  },
  argTypes: { onChange: { control: false } },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The states a single radio can take — checked / unchecked / disabled. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Radio name="sb-states-1" value="on" checked label="Checked" onChange={() => {}} />
      <Radio name="sb-states-2" value="off" checked={false} label="Unchecked" onChange={() => {}} />
      <Radio name="sb-states-3" value="d-on" checked disabled label="Disabled (checked)" onChange={() => {}} />
      <Radio name="sb-states-4" value="d-off" checked={false} disabled label="Disabled" onChange={() => {}} />
    </div>
  ),
};

/** Custom composition — drive a small set yourself (what RadioGroup does internally). */
export const CustomComposition: Story = {
  render: () => {
    const [v, setV] = useState('cash');
    const opts = [
      { label: 'Cash', value: 'cash' },
      { label: 'Card', value: 'card' },
      { label: 'UPI', value: 'upi' },
    ];
    return (
      <div style={{ display: 'flex', gap: 20 }}>
        {opts.map((o) => (
          <Radio key={o.value} name="sb-pay" value={o.value} checked={v === o.value} label={o.label} onChange={setV} />
        ))}
      </div>
    );
  },
};

/** Per-option colour override — e.g. a red "Waive". */
export const ColorOverride: Story = {
  render: () => {
    const [v, setV] = useState('charge');
    return (
      <div style={{ display: 'flex', gap: 20 }}>
        <Radio name="sb-waive" value="charge" checked={v === 'charge'} label="Charge" onChange={setV} />
        <Radio name="sb-waive" value="waive" checked={v === 'waive'} label="Waive" color={colors.red200} onChange={setV} />
      </div>
    );
  },
};
