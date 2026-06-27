import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { DoctorScheduleStrip } from './DoctorScheduleStrip';
import type { ScheduleState } from './scheduleStorage';
import { withClinicSession, withLocalStorage } from '../../sb/decorators';

// A realistic, populated weekly schedule so the strip renders with hours,
// "Off" days, and a live status line instead of an empty/unconfigured state.
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
  title: 'Patterns/DoctorSchedule/DoctorScheduleStrip',
  component: DoctorScheduleStrip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The "My Hours" editor strip. Reads the clinic schedule from localStorage on mount and renders one row/chip per day with a live "on duty / off duty" status line; clicking a day opens the SchedulePopover. The `layout` prop switches between a narrow vertical day-list and a wide horizontal chip row. Seeded here with a realistic weekly schedule.',
      },
    },
  },
  argTypes: {
    layout: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      table: { defaultValue: { summary: 'vertical' } },
    },
    onChange: { control: false },
  },
  decorators: [
    withLocalStorage({ docodile_schedule: JSON.stringify(SEED_SCHEDULE) }),
    withClinicSession,
  ],
} satisfies Meta<typeof DoctorScheduleStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Narrow card layout — days stacked as calendar-feel rows. */
export const Vertical: Story = {
  args: { layout: 'vertical' },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};

/** Wide chip row — one pill per day, wrapping as needed. */
export const Horizontal: Story = {
  args: { layout: 'horizontal' },
  decorators: [
    (Story) => (
      <div style={{ width: 760 }}>
        <Story />
      </div>
    ),
  ],
};
