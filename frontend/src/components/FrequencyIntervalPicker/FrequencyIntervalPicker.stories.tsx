import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { FrequencyIntervalPicker } from './FrequencyIntervalPicker';

const meta = {
  title: 'Components/FrequencyIntervalPicker',
  component: FrequencyIntervalPicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A cream dropdown for the dosing interval — how often a medicine is taken (daily, weekly, fortnightly…), distinct from the per-day pattern handled by FrequencyPicker. A chevron trigger opens a fixed option list; click the open row again to clear it.',
      },
    },
  },
  argTypes: {
    value: { control: 'text' },
    onChange: { control: false },
  },
  args: {
    value: '',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  // Controlled: manages its own open state; drive value with local state.
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '');
    React.useEffect(() => setValue(args.value ?? ''), [args.value]);
    return <FrequencyIntervalPicker {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof FrequencyIntervalPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty — shows the "Frequency" placeholder. Click to open. */
export const Default: Story = {};

/** A selected interval. */
export const Daily: Story = {
  args: { value: 'daily' },
};

/** A weekly interval. */
export const Weekly: Story = {
  args: { value: 'weekly' },
};
