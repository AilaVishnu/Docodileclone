import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { MyHoursCalendar } from './MyHoursCalendar';
import type { ScheduleState } from './scheduleStorage';
import { withClinicSession, withLocalStorage } from '../../sb/decorators';

// A populated weekly schedule so the month grid renders with intensity-shaded
// working days, "Off" cells, and per-day hour labels.
const SEED_SCHEDULE: ScheduleState = {
  default: {
    mon: { off: false, sessions: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '20:00' }] },
    tue: { off: false, sessions: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '20:00' }] },
    wed: { off: false, sessions: [{ start: '17:00', end: '20:00' }] },
    thu: { off: false, sessions: [{ start: '09:00', end: '12:00' }, { start: '17:00', end: '20:00' }] },
    fri: { off: false, sessions: [{ start: '09:00', end: '13:00' }] },
    sat: { off: false, sessions: [{ start: '10:00', end: '14:00' }] },
    sun: { off: true, sessions: [] },
  },
  overrides: {},
  configured: true,
};

const meta = {
  title: 'Patterns/DoctorSchedule/MyHoursCalendar',
  component: MyHoursCalendar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A wall-calendar view of the doctor\'s recurring hours. Reads the clinic schedule from localStorage and shades each day cell by how busy it is, with the spring-bound month header and prev/next navigation. Clicking a day opens the SchedulePopover. Seeded here with a realistic weekly schedule.',
      },
    },
  },
  argTypes: {
    onChange: { control: false },
  },
  decorators: [
    withLocalStorage({ docodile_schedule: JSON.stringify(SEED_SCHEDULE) }),
    withClinicSession,
    (Story) => (
      <div style={{ width: 360, paddingTop: 20 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MyHoursCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
