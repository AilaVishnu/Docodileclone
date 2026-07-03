import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { TimePicker } from './TimePicker';

// A date a week out so none of the slots are locked as "past" — the default
// view shows every hour/minute selectable.
const FUTURE_DATE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

const noop = () => {};

const meta = {
  title: 'Patterns/AppointmentQueue/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
  // The picker uses position:fixed for its backdrop + overlay, so it centers on
  // the viewport. Give the canvas some height so it has room to sit.
  decorators: [
    (Story) => (
      <div style={{ minHeight: 460, position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'The grid time-picker popover used inside Book Appointment. Pick an hour, a 5-minute slot and AM/PM, then confirm with Done. When `selectedDate` is today, slots earlier than the current wall-clock time are locked. Passing `onWalkin` adds a "Walk-in" button that commits the current time and flags the appointment as a walk-in.',
      },
    },
  },
  argTypes: {
    initialTime: { control: 'text' },
    onSelect: { control: false },
    onClose: { control: false },
    onWalkin: { control: false },
    selectedDate: { control: false },
    style: { control: false },
  },
  args: {
    initialTime: '10:30 AM',
    selectedDate: FUTURE_DATE,
    onSelect: noop,
    onClose: noop,
  },
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Seeded to a different starting slot. */
export const EveningSlot: Story = {
  args: { initialTime: '05:45 PM' },
};

/** With the walk-in affordance — adds a "Walk-in" button alongside Done. */
export const WithWalkin: Story = {
  args: { onWalkin: noop },
};
