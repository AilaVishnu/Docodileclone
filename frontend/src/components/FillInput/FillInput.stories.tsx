import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { FillInput } from './FillInput';

const meta = {
  title: 'Components/FillInput',
  component: FillInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The plainest editable field in the system: a borderless cream "fill block" — primary100 fill, rounded, no border, no spinner arrows. Bind a `list` to a native <datalist> for typed suggestions. Shared by the Bill modal line items and the prescription page.',
      },
    },
  },
  argTypes: {
    placeholder: { control: 'text' },
    list: { control: 'text' },
    ariaLabel: { control: 'text' },
    align: {
      control: 'inline-radio',
      options: ['left', 'center', 'right'],
      table: { defaultValue: { summary: 'left' } },
    },
    inputMode: {
      control: 'inline-radio',
      options: ['numeric', 'decimal', 'text'],
      table: { defaultValue: { summary: 'text' } },
    },
    value: { control: 'text' },
    onChange: { control: false },
    onFocus: { control: false },
  },
  args: {
    value: '',
    placeholder: 'Type here…',
    align: 'left',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  // Controlled: drive with local state so typing works while honouring `value`.
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '');
    React.useEffect(() => setValue(args.value ?? ''), [args.value]);
    return <FillInput {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof FillInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Left-aligned — for names / labels. */
export const Default: Story = {
  args: { value: 'Paracetamol', placeholder: 'Item name' },
};

/** Centered — for numeric quantities. */
export const CenteredNumber: Story = {
  args: { value: '12', align: 'center', inputMode: 'numeric', placeholder: 'Qty' },
};

/** Right-aligned — for prices / totals. */
export const RightAligned: Story = {
  args: { value: '250.00', align: 'right', inputMode: 'decimal' },
};

/** Bound to a <datalist> — typing shows native suggestions (no chevron). */
export const WithDatalist: Story = {
  args: { value: '', list: 'fill-input-demo-list', placeholder: 'Start typing…' },
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <>
        <FillInput {...args} value={value} onChange={setValue} />
        <datalist id="fill-input-demo-list">
          <option value="Amoxicillin 500mg" />
          <option value="Cetirizine 10mg" />
          <option value="Calamine Lotion" />
        </datalist>
      </>
    );
  },
};
