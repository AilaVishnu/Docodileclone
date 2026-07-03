import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { WhenPicker } from './WhenPicker';

const meta = {
  title: 'Components/Rx/WhenPicker',
  component: WhenPicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A cream dropdown for when a medicine should be taken relative to food/meals (Before Food, After Lunch, Empty Stomach, Bed Time…). A chevron trigger opens a fixed option list; click the open row again to clear it.',
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
    return <WhenPicker {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof WhenPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty — shows the "When" placeholder. Click to open. */
export const Default: Story = {};

/** A selected timing. */
export const AfterFood: Story = {
  args: { value: 'After Food' },
};

/** Empty-stomach timing. */
export const EmptyStomach: Story = {
  args: { value: 'Empty Stomach' },
};
