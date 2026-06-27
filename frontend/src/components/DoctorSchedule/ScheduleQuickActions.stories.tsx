import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ScheduleQuickActions } from './ScheduleQuickActions';
import type { ScheduleState } from './scheduleStorage';
import { withClinicSession, withLocalStorage } from '../../sb/decorators';

// A populated weekly schedule so the "Closing early" action has a live
// session to trim and the presets modal opens against real state.
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
  title: 'Patterns/DoctorSchedule/ScheduleQuickActions',
  component: ScheduleQuickActions,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A standalone "act on your hours" tray — one-tap shortcuts to mark tomorrow off, close early today, or open the presets picker. Reads/writes the clinic schedule in localStorage. Seeded here with a realistic weekly schedule.',
      },
    },
  },
  decorators: [
    withLocalStorage({ docodile_schedule: JSON.stringify(SEED_SCHEDULE) }),
    withClinicSession,
    (Story) => (
      <div style={{ position: 'relative', width: 460, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScheduleQuickActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
