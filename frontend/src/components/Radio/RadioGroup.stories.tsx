import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { RadioGroup } from './RadioGroup';
import { colors } from '../../styles/theme';

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The canonical radio group — native radios tinted with the neutral900 accent + control-font labels. `options` accept plain strings or objects for per-option `color` (e.g. a red "Waive") / `disabled`. Replaces the ~7 hand-rolled radio rows (gender, role, payment method).',
      },
    },
  },
  argTypes: { onChange: { control: false }, orientation: { control: 'radio', options: ['row', 'column'] } },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Gender — the simplest case (string options). */
export const Gender: Story = {
  render: () => {
    const [v, setV] = useState('male');
    return <RadioGroup name="sb-gender" value={v} onChange={setV} gap={24} options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }, { label: 'Other', value: 'other' }]} />;
  },
};

/** Role — wraps when there are many options. */
export const Role: Story = {
  render: () => {
    const [v, setV] = useState('Doctor');
    return <RadioGroup name="sb-role" value={v} onChange={setV} options={['Front Desk', 'Doctor', 'Nurse', 'Pharmacy', 'Lab', 'Other']} />;
  },
};

/** Payment method — "Waive" gets a red label via per-option color. */
export const PaymentMethod: Story = {
  render: () => {
    const [v, setV] = useState('Cash');
    return (
      <RadioGroup
        name="sb-pay"
        value={v}
        onChange={setV}
        options={['Cash', 'Card', 'UPI', { label: 'Waive', value: 'Waive', color: colors.red200 }]}
      />
    );
  },
};

/** Disabled group. */
export const Disabled: Story = {
  render: () => <RadioGroup name="sb-disabled" value="Cash" onChange={() => {}} disabled options={['Cash', 'Card', 'UPI']} />,
};

/** Vertical layout. */
export const Column: Story = {
  render: () => {
    const [v, setV] = useState('a');
    return <RadioGroup name="sb-col" value={v} onChange={setV} orientation="column" options={[{ label: 'Option A', value: 'a' }, { label: 'Option B', value: 'b' }, { label: 'Option C', value: 'c' }]} />;
  },
};
