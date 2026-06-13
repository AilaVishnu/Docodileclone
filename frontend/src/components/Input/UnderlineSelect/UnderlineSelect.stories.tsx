import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { UnderlineSelect } from './UnderlineSelect';

const OPTIONS = ['Today', 'This week', 'This month'];

const meta = {
  title: 'Components/Input/UnderlineSelect',
  component: UnderlineSelect,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Inline dropdown in two looks: `underline` (serif label with an underline) and `chip` (sans label inside an outline pill — the header date chips). Controlled via `value`/`onChange`.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['underline', 'chip'],
      table: { defaultValue: { summary: 'underline' } },
    },
    placeholder: { control: 'text' },
    fontSize: { control: 'text' },
    options: { control: false },
    value: { control: false },
    onChange: { control: false },
  },
  args: {
    options: OPTIONS,
    placeholder: 'Select…',
    variant: 'underline',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => {
    const [value, setValue] = useState(OPTIONS[0]);
    return <UnderlineSelect {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof UnderlineSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Underline: Story = { args: { variant: 'underline' } };

export const Chip: Story = { args: { variant: 'chip' } };

/** Both looks side by side. */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <UnderlineSelect options={OPTIONS} value={OPTIONS[0]} onChange={() => {}} variant="underline" />
      <UnderlineSelect options={OPTIONS} value={OPTIONS[0]} onChange={() => {}} variant="chip" />
    </div>
  ),
};
