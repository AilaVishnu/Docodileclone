import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { FrequencyPicker } from './FrequencyPicker';

const meta = {
  title: 'Components/Rx/FrequencyPicker',
  component: FrequencyPicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A cream combobox for the per-day dosing pattern. Offers slot patterns (1-0-1, 1-1-1-1…) and plain-language options (Once a day, Every 8h…). Focus to open; type to filter the list.',
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
    return <FrequencyPicker {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof FrequencyPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty — focus to see the full pattern list. */
export const Default: Story = {};

/** A morning + night slot pattern. */
export const SlotPattern: Story = {
  args: { value: '1-0-1' },
};

/** A plain-language frequency. */
export const PlainLanguage: Story = {
  args: { value: 'Twice a day' },
};
