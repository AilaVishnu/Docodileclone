import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { DatePicker } from './DatePicker';

const TODAY = new Date('2026-06-13');

const meta = {
  title: 'Components/DateTime/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A floating single-date calendar. Click the month title to zoom out to month- then year-pickers. `disablePast` greys out earlier days, and `showDoneButton` adds a "Go to today" shortcut. It closes on outside click via `onClose`; the parent owns the selected date.',
      },
    },
  },
  argTypes: {
    disablePast: { control: 'boolean' },
    showDoneButton: { control: 'boolean' },
    selectedDate: { control: false },
    onSelect: { control: false },
    onClose: { control: false },
    style: { control: false },
  },
  args: {
    selectedDate: TODAY,
    onClose: () => {},
  },
  // Controlled: drive the selected date with local state so days light up.
  render: (args) => {
    const [date, setDate] = useState<Date>(args.selectedDate ?? TODAY);
    React.useEffect(() => setDate(args.selectedDate ?? TODAY), [args.selectedDate]);
    return <DatePicker {...args} selectedDate={date} onSelect={setDate} />;
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default month view, with today selected. */
export const Default: Story = {};

/** Past days greyed out and unclickable — for booking future appointments. */
export const DisablePast: Story = {
  args: { disablePast: true },
};

/** With the "Go to today" shortcut button. */
export const WithDoneButton: Story = {
  args: { showDoneButton: true },
};
