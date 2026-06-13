import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Toast } from './Toast';

const meta = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Transient notification toast with an icon, a message, an optional inline action button, and a close button. Auto-dismisses after `duration` ms; stories pin it open with `duration: 0`.',
      },
    },
  },
  argTypes: {
    message: { control: 'text' },
    actionLabel: { control: 'text' },
    duration: {
      control: 'number',
      table: { defaultValue: { summary: '4000' } },
    },
    isVisible: { control: false },
    onClose: { control: false },
    onAction: { control: false },
  },
  args: {
    message: 'Clinic created successfully',
    isVisible: true,
    duration: 0,
    onClose: () => {},
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    message: 'Doctor removed',
    actionLabel: 'Undo',
    onAction: () => {},
  },
};
