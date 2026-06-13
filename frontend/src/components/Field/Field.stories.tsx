import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Field } from './Field';

const meta = {
  title: 'Components/Field',
  component: Field,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The canonical text input. Three shapes — underline / box / pill — and box/pill can be `outline` (border + white) or `filled` (cream, borderless). Plus icon slots, text `align`, an error line, and an auto-growing multiline mode. Heights track `--input-h` responsively.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['underline', 'box', 'pill'],
      table: { defaultValue: { summary: 'underline' } },
    },
    fill: {
      control: 'inline-radio',
      options: ['outline', 'filled'],
      table: { defaultValue: { summary: 'outline' } },
      description: 'box/pill only — outline (border + white) or filled (cream, borderless).',
    },
    align: {
      control: 'inline-radio',
      options: ['left', 'center', 'right'],
      table: { defaultValue: { summary: 'left' } },
    },
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'tel', 'number', 'search'],
    },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
    multiline: { control: 'boolean' },
    placeholder: { control: 'text' },
    errorMessage: { control: 'text' },
    value: { control: 'text' },
    onChange: { control: false },
    iconLeft: { control: false },
    iconRight: { control: false },
    style: { control: false },
    inputStyle: { control: false },
  },
  args: {
    variant: 'box',
    fill: 'outline',
    align: 'left',
    placeholder: 'Type here…',
    value: '',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  // Controlled wrapper: Field is value/onChange — drive it with local state so
  // typing works, while still honouring the `value` control.
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '');
    React.useEffect(() => setValue(args.value ?? ''), [args.value]);
    return <Field {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Underline: Story = {
  args: { variant: 'underline', placeholder: 'Patient name' },
};

export const Box: Story = {
  args: { variant: 'box', placeholder: 'Email', type: 'email' },
};

export const Pill: Story = {
  args: { variant: 'pill', placeholder: 'Search…', type: 'search' },
};

/** Filled box — cream, borderless (replaces the old standalone FillInput). */
export const BoxFilled: Story = {
  args: { variant: 'box', fill: 'filled', placeholder: 'Amount', align: 'center' },
};

/** Box & pill × outline / filled, at a glance. */
export const AllSurfaces: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const Demo = ({ v, f }: { v: 'box' | 'pill'; f: 'outline' | 'filled' }) => {
      const [val, setVal] = useState('');
      return (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: '#8F8F8F', marginBottom: 4 }}>{`${v} · ${f}`}</div>
          <Field variant={v} fill={f} placeholder="Type here…" value={val} onChange={setVal} />
        </div>
      );
    };
    return (
      <div>
        <Demo v="box" f="outline" />
        <Demo v="box" f="filled" />
        <Demo v="pill" f="outline" />
        <Demo v="pill" f="filled" />
      </div>
    );
  },
};

export const WithError: Story = {
  args: {
    variant: 'box',
    value: 'taken-name',
    error: true,
    errorMessage: 'That domain is already taken',
  },
};

export const Disabled: Story = {
  args: { variant: 'box', value: 'Read only', disabled: true },
};

export const Multiline: Story = {
  args: { variant: 'box', placeholder: 'Notes…', multiline: true },
};
