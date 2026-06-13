import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { StaffWindow } from './StaffWindow';

const Label = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: '#fff', fontWeight: 600 }}>{children}</span>
);

const meta = {
  title: 'Components/StaffWindow',
  component: StaffWindow,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A dark "window" tile used in the staff/clinic layout. Cycles through a palette via `colorIndex`; `dashed` renders an empty add-slot outline. Hovers internally. Stories use a light stage with light text inside.',
      },
    },
  },
  argTypes: {
    colorIndex: {
      control: 'number',
      table: { defaultValue: { summary: '0' } },
    },
    dashed: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    children: { control: false },
    onClick: { control: false },
  },
  args: {
    colorIndex: 0,
    dashed: false,
    children: <Label>Dr. Rao</Label>,
  },
  decorators: [
    (Story) => (
      <div style={{ background: '#f4f4f2', padding: 24, display: 'inline-block' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StaffWindow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SecondColor: Story = {
  args: { colorIndex: 1, children: <Label>Dr. Mehta</Label> },
};

export const Dashed: Story = {
  args: {
    dashed: true,
    children: <span style={{ color: '#555' }}>+ Add staff</span>,
  },
};

/** A few palette colours next to the dashed add-slot. */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        background: '#f4f4f2',
        padding: 24,
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <StaffWindow key={i} colorIndex={i}>
          <Label>Staff {i + 1}</Label>
        </StaffWindow>
      ))}
      <StaffWindow dashed>
        <span style={{ color: '#555' }}>+ Add</span>
      </StaffWindow>
    </div>
  ),
};
