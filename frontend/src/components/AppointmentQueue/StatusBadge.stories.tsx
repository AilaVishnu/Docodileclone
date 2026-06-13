import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { StatusBadge } from './StatusBadge';

// SCHEDULED is omitted here: it's a backend alias of BOOKED and renders the
// identical "Booked" pill, so the catalog shows it once.
const STATUSES = [
  'BOOKED',
  'WAITING',
  'ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
  'NO_SHOW',
  'CANCELLED',
] as const;

const meta = {
  title: 'Components/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The appointment-status pill used in the queue. Each status maps to its own colour + label. For IN_PROGRESS, pass `sessionStartedAt` to show a live elapsed timer, or `started` to read "Ongoing" on sage.',
      },
    },
  },
  argTypes: {
    status: { control: 'select', options: STATUSES },
    started: { control: 'boolean' },
    sessionStartedAt: { control: 'text' },
    patientId: { control: 'text' },
    onClick: { control: false },
  },
  args: {
    status: 'WAITING',
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Waiting: Story = {};

export const Completed: Story = { args: { status: 'COMPLETED' } };

export const NoShow: Story = { args: { status: 'NO_SHOW' } };

/** IN_PROGRESS with a server start time → a live timer counting up. */
export const InProgressLiveTimer: Story = {
  args: { status: 'IN_PROGRESS', sessionStartedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString() },
};

/** IN_PROGRESS with `started` → reads "Ongoing" on sage (prescription queue). */
export const Ongoing: Story = {
  args: { status: 'IN_PROGRESS', started: true },
};

/** Every status at a glance. */
export const AllStatuses: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      {STATUSES.map((s) => (
        <StatusBadge key={s} status={s} />
      ))}
    </div>
  ),
};
