import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ZeroQueue } from './ZeroQueue';

const meta = {
  title: 'Patterns/AppointmentQueue/ZeroQueue',
  component: ZeroQueue,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The empty-state panel the queue table falls back to when a doctor has no appointments for the selected day. Pure presentation — an illustration plus a reassuring line, no props.',
      },
    },
  },
} satisfies Meta<typeof ZeroQueue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
