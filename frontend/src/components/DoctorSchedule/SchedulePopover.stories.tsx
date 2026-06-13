import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { SchedulePopover } from './SchedulePopover';
import type { DaySchedule } from './scheduleStorage';
import { withClinicSession, withLocalStorage } from '../../sb/decorators';

// A two-session weekday so the popover renders populated time pickers plus the
// "Add session" / "Apply to" controls.
const SEED_DAY: DaySchedule = {
  off: false,
  sessions: [
    { start: '09:00', end: '12:00' },
    { start: '17:00', end: '20:00' },
  ],
};

// The popover positions itself `fixed` relative to an anchor rect. Supply a
// rect near the top-left of the viewport so it renders fully on the stage.
const ANCHOR_RECT = {
  top: 24,
  bottom: 56,
  left: 24,
  right: 140,
  width: 116,
  height: 32,
  x: 24,
  y: 24,
  toJSON: () => ({}),
} as DOMRect;

const meta = {
  title: 'Patterns/DoctorSchedule/SchedulePopover',
  component: SchedulePopover,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The per-day editing popover anchored under a schedule chip. Toggles a day off/open, edits up to two time sessions (15-min snap), and chooses whether the change applies to just that day, all weekdays, or the whole week. Rendered open here against an anchor rect with callbacks stubbed.',
      },
    },
  },
  argTypes: {
    dayKey: { control: false },
    day: { control: false },
    anchorRect: { control: false },
    onClose: { control: false },
    onSave: { control: false },
  },
  args: {
    dayKey: 'mon',
    day: SEED_DAY,
    anchorRect: ANCHOR_RECT,
    onClose: () => {},
    onSave: () => {},
  },
  decorators: [
    withLocalStorage({ docodile_schedule: '' }),
    withClinicSession,
    (Story) => (
      <div style={{ position: 'relative', width: 420, height: 460 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SchedulePopover>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Open day with two sessions. */
export const Open: Story = {};

/** A day marked off — sessions hidden, just the off/open toggle. */
export const DayOff: Story = {
  args: {
    dayKey: 'sun',
    day: { off: true, sessions: [] },
  },
};
