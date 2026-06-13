import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ClinicWorkspace } from './ClinicWorkspace';

const Panel = ({ title, tint }: { title: string; tint: string }) => (
  <div style={{ padding: 16, background: tint, height: '100%', boxSizing: 'border-box' }}>
    <strong>{title}</strong>
    <p style={{ color: '#5a5a5a' }}>Panel content goes here.</p>
  </div>
);

const meta = {
  title: 'Components/ClinicWorkspace',
  component: ClinicWorkspace,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Two-panel workspace shell — a `left` and a `right` ReactNode side by side, filling the available height. Stories wrap it in a fixed-height stage so the fill is visible.',
      },
    },
  },
  argTypes: {
    left: { control: false },
    right: { control: false },
  },
  args: {
    left: <Panel title="Queue" tint="#eef2ee" />,
    right: <Panel title="Details" tint="#f7f4ee" />,
  },
  decorators: [
    (Story) => (
      <div style={{ height: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClinicWorkspace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
