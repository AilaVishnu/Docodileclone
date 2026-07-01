import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { TimeField } from './TimeField';
import { colors } from '../../styles/theme';

const meta = {
  title: 'Components/DateTime/TimeField',
  component: TimeField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A trigger pill (clock icon + time) that opens the shared `TimePicker`. `isWalkin` shows the "Walk-in" label; `onWalkin` surfaces the picker\'s "now / walk-in" action.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 240, background: colors.active.shade200, padding: 24 }}><Story /></div>],
} satisfies Meta<typeof TimeField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  render: () => {
    const [t, setT] = useState('');
    return <TimeField value={t} onChange={setT} selectedDate={new Date()} onWalkin={setT} />;
  },
};

export const Filled: Story = {
  render: () => {
    const [t, setT] = useState('10:30 AM');
    return <TimeField value={t} onChange={setT} selectedDate={new Date()} onWalkin={setT} />;
  },
};

export const WalkIn: Story = {
  render: () => <TimeField value="" onChange={() => {}} selectedDate={new Date()} isWalkin />,
};
