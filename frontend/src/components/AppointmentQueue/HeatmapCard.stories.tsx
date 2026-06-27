import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { HeatmapCard } from './HeatmapCard';
import { withClinicSession, withLocalStorage } from '../../sb/decorators';

// Seed a configured weekly schedule (9 AM–6 PM, Mon–Sat) so HeatmapCard's
// `loadSchedule()` derives a sensible default hour range without an override.
const weekday = { off: false, sessions: [{ start: '09:00', end: '18:00' }] };
const SCHEDULE = JSON.stringify({
  default: {
    mon: weekday,
    tue: weekday,
    wed: weekday,
    thu: weekday,
    fri: weekday,
    sat: weekday,
    sun: { off: true, sessions: [] },
  },
  overrides: {},
  configured: true,
});

// Build ISO timestamps on *today* so the card reads "Today's bookings".
const at = (hour: number, minute: number) => {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

// Appointments spread across the clinic day, clustered around mid-morning and
// early evening so the heatmap shows distinct hot/cold cells.
const SAMPLE_APPOINTMENTS = [
  { rawScheduledTime: at(9, 5), status: 'COMPLETED' },
  { rawScheduledTime: at(9, 20), status: 'COMPLETED' },
  { rawScheduledTime: at(10, 0), status: 'COMPLETED' },
  { rawScheduledTime: at(10, 10), status: 'WAITING' },
  { rawScheduledTime: at(10, 15), status: 'WAITING' },
  { rawScheduledTime: at(10, 45), status: 'WAITING' },
  { rawScheduledTime: at(11, 30), status: 'IN_PROGRESS' },
  { rawScheduledTime: at(13, 0), status: 'WAITING' },
  { rawScheduledTime: at(16, 15), status: 'WAITING' },
  { rawScheduledTime: at(17, 0), status: 'WAITING' },
  { rawScheduledTime: at(17, 5), status: 'WAITING' },
  { rawScheduledTime: at(17, 50), status: 'WAITING' },
];

const meta = {
  title: 'Patterns/AppointmentQueue/HeatmapCard',
  component: HeatmapCard,
  tags: ['autodocs'],
  decorators: [
    withClinicSession,
    withLocalStorage({ docodile_schedule: SCHEDULE }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "The \"Peak Hours\" card under the doctor status panel. Buckets the day's appointments into 15-minute cells (hours × quarters) and shades each by booking density. The hour range is read from the clinic's saved schedule (`docodile_schedule` in localStorage) but auto-expands to cover any after-hours bookings.",
      },
    },
  },
  argTypes: {
    appointments: { control: false },
    startHour: { control: 'number' },
    endHour: { control: 'number' },
    date: { control: false },
  },
  args: {
    appointments: SAMPLE_APPOINTMENTS,
  },
} satisfies Meta<typeof HeatmapCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** An explicit, narrower hour window overriding the saved schedule. */
export const FixedRange: Story = {
  args: { startHour: 9, endHour: 13 },
};

/** No bookings — the card reads "No bookings" and shows an all-cold grid. */
export const Empty: Story = {
  args: { appointments: [] },
};
