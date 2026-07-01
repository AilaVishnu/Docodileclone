import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { AnalogClock } from './AnalogClock';
import { withClinicSession, withLocalStorage } from '../../sb/decorators';

// A morning + evening week (9–12 and 5–8 on every weekday, off weekends),
// matching the DoctorSchedule ScheduleState shape (key: docodile_schedule).
// This makes the clock draw shaded working-hour wedges.
const morningEveningDay = {
  off: false,
  sessions: [
    { start: '09:00', end: '12:00' },
    { start: '17:00', end: '20:00' },
  ],
};
const offDay = { off: true, sessions: [] };
const scheduleState = {
  default: {
    mon: morningEveningDay,
    tue: morningEveningDay,
    wed: morningEveningDay,
    thu: morningEveningDay,
    fri: morningEveningDay,
    sat: morningEveningDay,
    sun: offDay,
  },
  overrides: {},
  configured: true,
};

const withSeededSchedule = withLocalStorage({
  docodile_schedule: JSON.stringify(scheduleState),
});

const meta = {
  title: 'Components/DateTime/AnalogClock',
  component: AnalogClock,
  tags: ['autodocs'],
  // Seed the auth/identity keys + a working schedule so the clock draws its
  // shaded working-hour wedges (read from localStorage via loadSchedule()).
  decorators: [withSeededSchedule, withClinicSession],
  parameters: {
    docs: {
      description: {
        component:
          "A live analog clock whose face is shaded with wedges for today's working sessions. The schedule is read from localStorage (key `docodile_schedule`). The hands tick once per second; the second hand sweeps smoothly.",
      },
    },
  },
  argTypes: {
    size: { control: { type: 'range', min: 120, max: 320, step: 10 } },
  },
  args: {
    size: 190,
  },
} satisfies Meta<typeof AnalogClock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = { args: { size: 280 } };
