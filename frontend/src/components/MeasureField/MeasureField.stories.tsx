import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { MeasureField } from './MeasureField';

const meta = {
  title: 'Components/MeasureField',
  component: MeasureField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A value box paired with a unit chip — the shared input behind the vitals grid, price (₹ prefix) and quantity/duration fields. The `cream` look is the default; `box` is a white form field. A switchable unit chip (via `onToggleUnit`) reads as a button, and the `bp` variant adds a second systolic/diastolic input.',
      },
    },
  },
  argTypes: {
    unit: { control: 'text' },
    prefix: { control: 'text' },
    placeholder: { control: 'text' },
    unitColor: { control: 'text' },
    unitWidth: { control: 'number' },
    inputMode: {
      control: 'inline-radio',
      options: ['numeric', 'decimal', 'text'],
      table: { defaultValue: { summary: 'numeric' } },
    },
    box: { control: 'boolean' },
    dense: { control: 'boolean' },
    invalid: { control: 'boolean' },
    unitFilled: { control: 'boolean' },
    bp: { control: 'boolean' },
    value: { control: 'text' },
    value2: { control: 'text' },
    onChange: { control: false },
    onChange2: { control: false },
    onToggleUnit: { control: false },
    onKeyDown: { control: false },
    onFocus: { control: false },
  },
  args: {
    value: '',
    placeholder: '0',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  // Controlled: drive both inputs with local state so typing works.
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '');
    const [value2, setValue2] = useState(args.value2 ?? '');
    React.useEffect(() => setValue(args.value ?? ''), [args.value]);
    React.useEffect(() => setValue2(args.value2 ?? ''), [args.value2]);
    return (
      <MeasureField
        {...args}
        value={value}
        onChange={setValue}
        value2={value2}
        onChange2={setValue2}
      />
    );
  },
} satisfies Meta<typeof MeasureField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default cream vitals look — plain value box, no unit. */
export const Default: Story = {
  args: { value: '72', placeholder: 'Pulse' },
};

/** With a fixed unit chip on the right. */
export const WithUnit: Story = {
  args: { value: '170', unit: 'cm' },
};

/** A switchable unit chip — highlighted, click to toggle the unit (parent owns it). */
export const SwitchableUnit: Story = {
  render: (args) => {
    const [value, setValue] = useState('68');
    const [unit, setUnit] = useState('kg');
    return (
      <MeasureField
        {...args}
        value={value}
        onChange={setValue}
        unit={unit}
        onToggleUnit={() => setUnit((u) => (u === 'kg' ? 'lb' : 'kg'))}
        unitFilled
      />
    );
  },
};

/** The white form field — price with a ₹ prefix. */
export const Box: Story = {
  args: { value: '250', box: true, prefix: '₹' },
};

/** Box variant with a unit chip — a quantity field. */
export const BoxWithUnit: Story = {
  args: { value: '30', box: true, unit: 'Tablets' },
};

/** 28px-tall, for the dense vitals grid. */
export const Dense: Story = {
  args: { value: '98.6', unit: '°F', dense: true },
};

/** The two-input blood-pressure variant (systolic / diastolic). */
export const BloodPressure: Story = {
  args: { value: '120', value2: '80', unit: 'mmHg', bp: true, box: true },
};

/** The invalid (error) state. */
export const Invalid: Story = {
  args: { value: '999', unit: 'cm', invalid: true },
};
