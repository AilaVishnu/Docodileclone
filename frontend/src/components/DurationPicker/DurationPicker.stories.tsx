import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { DurationPicker } from './DurationPicker';

const meta = {
  title: 'Components/DurationPicker',
  component: DurationPicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A cream combobox for a prescription duration. Focus to see common presets (3/5/7 Days, 1 Month, SOS…); typing a bare number expands it into Days / Weeks / Months / Years (e.g. "5" → "5 Days").',
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
    return <DurationPicker {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof DurationPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty — focus to see the preset list. */
export const Default: Story = {};

/** A chosen duration. */
export const WithValue: Story = {
  args: { value: '7 Days' },
};

/** SOS — as-needed, no fixed duration. */
export const SOS: Story = {
  args: { value: 'SOS' },
};
