import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { UnderlineSelect } from './UnderlineSelect';

const OPTIONS = ['Dr. Anita Rao', 'Dr. Vikram Shah', 'Dr. Priya Iyer'];

const meta = {
  title: 'Components/Input/UnderlineSelect',
  component: UnderlineSelect,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Inline "chip" dropdown — a compact outline pill (primary400 border) with a label + chevron, used inline inside titles (e.g. the booking header "Book an appointment for […]"). Controlled via `value`/`onChange`. (The old serif "underline" variant was removed — it was unused.)',
      },
    },
  },
  argTypes: {
    placeholder: { control: 'text' },
    fontSize: { control: 'text' },
    options: { control: false },
    value: { control: false },
    onChange: { control: false },
  },
  args: { options: OPTIONS, placeholder: 'Select doctor' },
  render: (args) => {
    const [value, setValue] = useState('');
    return <UnderlineSelect {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof UnderlineSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelection: Story = {
  render: (args) => {
    const [value, setValue] = useState(OPTIONS[0]);
    return <UnderlineSelect {...args} value={value} onChange={setValue} />;
  },
};
