import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { SchedulePresetsModal } from './SchedulePresetsModal';
import type { ScheduleState } from './scheduleStorage';
import { withClinicSession, withLocalStorage } from '../../sb/decorators';

// A populated schedule so the modal opens against realistic clinic state.
const SEED_SCHEDULE: ScheduleState = {
  default: {
    mon: { off: false, sessions: [{ start: '17:00', end: '20:00' }] },
    tue: { off: false, sessions: [{ start: '17:00', end: '20:00' }] },
    wed: { off: false, sessions: [{ start: '17:00', end: '20:00' }] },
    thu: { off: false, sessions: [{ start: '17:00', end: '20:00' }] },
    fri: { off: false, sessions: [{ start: '17:00', end: '20:00' }] },
    sat: { off: false, sessions: [{ start: '17:00', end: '20:00' }] },
    sun: { off: true, sessions: [] },
  },
  overrides: {},
  configured: true,
};

const meta = {
  title: 'Patterns/DoctorSchedule/SchedulePresetsModal',
  component: SchedulePresetsModal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The first-run "Set your hours" picker — a Modal of starting-point presets (evening clinic, morning + evening, weekdays 9–6) plus a Custom card. `onPick` receives the chosen week, `onCustom` opens the manual editor, and `onDismiss` closes. Rendered as an open modal with callbacks stubbed.',
      },
    },
  },
  argTypes: {
    onPick: { control: false },
    onCustom: { control: false },
    onDismiss: { control: false },
  },
  args: {
    onPick: () => {},
    onCustom: () => {},
    onDismiss: () => {},
  },
  decorators: [
    withLocalStorage({ docodile_schedule: JSON.stringify(SEED_SCHEDULE) }),
    withClinicSession,
  ],
} satisfies Meta<typeof SchedulePresetsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
