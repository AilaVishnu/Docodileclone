import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Select } from './Select';

const STRING_OPTIONS = ['Cardiology', 'Dermatology', 'Neurology'];
const OBJECT_OPTIONS = [
  { label: 'Morning (9–12)', value: 'am' },
  { label: 'Afternoon (1–5)', value: 'pm' },
  { label: 'Evening (6–9)', value: 'eve' },
];

const meta = {
  title: 'Components/Input/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Box-style dropdown select. Controlled via `value`/`onChange`. Options may be plain strings or `{ label, value }` objects. The menu portals to `<body>` so it escapes clipping ancestors.',
      },
    },
  },
  argTypes: {
    placeholder: { control: 'text' },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
    options: { control: false },
    value: { control: false },
    onChange: { control: false },
    iconLeft: { control: false },
  },
  args: {
    options: STRING_OPTIONS,
    placeholder: 'Select a department',
    error: false,
    disabled: false,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => {
    const [value, setValue] = useState('');
    return <Select {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StringOptions: Story = { args: { options: STRING_OPTIONS } };

export const ObjectOptions: Story = {
  args: { options: OBJECT_OPTIONS, placeholder: 'Pick a shift' },
};

export const Error: Story = { args: { error: true } };

export const Disabled: Story = { args: { disabled: true } };
