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
          'Box-style dropdown select. `fill` = outline (border + white) or filled (cream, borderless); `chevron` toggles the arrow. Controlled via `value`/`onChange`; options may be strings or `{ label, value }`. The menu portals to `<body>` so it escapes clipping ancestors.',
      },
    },
  },
  argTypes: {
    placeholder: { control: 'text' },
    fill: {
      control: 'inline-radio',
      options: ['outline', 'filled'],
      table: { defaultValue: { summary: 'outline' } },
    },
    chevron: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
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
    fill: 'outline',
    chevron: true,
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

/** Filled — cream, borderless (e.g. the dosing-style dropdowns). */
export const Filled: Story = { args: { fill: 'filled' } };

/** No chevron — for inline/typeahead-style triggers. */
export const NoChevron: Story = { args: { chevron: false } };

/** outline / filled × chevron, at a glance. */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const Demo = ({ fill, chevron }: { fill: 'outline' | 'filled'; chevron: boolean }) => {
      const [v, setV] = useState('');
      return (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: '#8F8F8F', marginBottom: 4 }}>
            {`${fill} · chevron ${chevron ? 'on' : 'off'}`}
          </div>
          <Select options={STRING_OPTIONS} value={v} onChange={setV} fill={fill} chevron={chevron} placeholder="Select…" />
        </div>
      );
    };
    return (
      <div>
        <Demo fill="outline" chevron />
        <Demo fill="filled" chevron />
        <Demo fill="outline" chevron={false} />
        <Demo fill="filled" chevron={false} />
      </div>
    );
  },
};
