import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { DateField } from './DateField';
import { colors } from '../../styles/theme';

const meta = {
  title: 'Components/DateTime/DateField',
  component: DateField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A trigger pill (calendar icon + formatted date) that opens the shared `DatePicker`. Control-scale font so it matches inputs/selects.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 240, background: colors.active.shade200, padding: 24 }}><Story /></div>],
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  render: () => {
    const [d, setD] = useState<Date | null>(null);
    return <DateField value={d} onChange={setD} disablePast />;
  },
};

export const Filled: Story = {
  render: () => {
    const [d, setD] = useState<Date | null>(new Date(2026, 5, 13));
    return <DateField value={d} onChange={setD} />;
  },
};

export const Disabled: Story = {
  render: () => <DateField value={new Date(2026, 5, 13)} onChange={() => {}} disabled disabledTitle="Walk-in date can't be edited" />,
};
