import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { DateRangeDropdown, type RangePreset } from './DateRangeDropdown';

const PRESETS: RangePreset[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: 'month', label: 'This month' },
  { id: 'custom', label: 'Custom range' },
];

const meta = {
  title: 'Components/DateRangeDropdown',
  component: DateRangeDropdown,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A header pill ("[range] ▾") that opens a list of range presets. The special `custom` preset opens an in-place RangeCalendar to pick a start + end. The parent owns the active range; this just renders the control and calls back via `onSelectPreset` / `onSelectCustom`.',
      },
    },
  },
  argTypes: {
    presets: { control: false },
    customId: { control: 'text', table: { defaultValue: { summary: 'custom' } } },
    customStart: { control: 'text' },
    customEnd: { control: 'text' },
    valueId: { control: false },
    onSelectPreset: { control: false },
    onSelectCustom: { control: false },
  },
  args: {
    presets: PRESETS,
    valueId: '7d',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  // Drive valueId + custom range with local state so picking a preset updates the pill.
  render: (args) => {
    const [valueId, setValueId] = useState(args.valueId);
    const [start, setStart] = useState(args.customStart ?? '');
    const [end, setEnd] = useState(args.customEnd ?? '');
    React.useEffect(() => setValueId(args.valueId), [args.valueId]);
    return (
      <DateRangeDropdown
        {...args}
        valueId={valueId}
        customStart={start}
        customEnd={end}
        onSelectPreset={setValueId}
        onSelectCustom={(s, e) => {
          setStart(s);
          setEnd(e);
          setValueId(args.customId ?? 'custom');
        }}
      />
    );
  },
} satisfies Meta<typeof DateRangeDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A preset selected — click the pill to switch ranges. */
export const Default: Story = {};

/** Today selected. */
export const Today: Story = {
  args: { valueId: 'today' },
};

/** A custom range — the pill shows the formatted start–end. */
export const CustomRange: Story = {
  args: {
    valueId: 'custom',
    customStart: '2026-06-01',
    customEnd: '2026-06-13',
  },
};
