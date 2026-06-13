import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { PopoverMenu } from './PopoverMenu';

const Kebab = () => (
  <span aria-hidden style={{ fontSize: 20, lineHeight: 1 }}>
    ⋮
  </span>
);

const meta = {
  title: 'Components/PopoverMenu',
  component: PopoverMenu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A generic click-trigger that opens a list of action items — the kebab / tuning menu. Items can carry a leading icon and a `destructive` flag (red). Closes on outside click or after an item is selected.',
      },
    },
  },
  argTypes: {
    align: {
      control: 'inline-radio',
      options: ['left', 'right'],
      table: { defaultValue: { summary: 'right' } },
    },
    ariaLabel: { control: 'text' },
    trigger: { control: false },
    items: { control: false },
  },
  args: {
    ariaLabel: 'Open menu',
    trigger: <Kebab />,
    items: [
      { label: 'Edit', onClick: () => {} },
      { label: 'Duplicate', onClick: () => {} },
      { label: 'Delete', onClick: () => {}, destructive: true },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PopoverMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A kebab trigger with three actions. Click to open. */
export const Default: Story = {};

/** Opens to the left of the trigger. */
export const AlignLeft: Story = {
  args: { align: 'left' },
};

/** Items with leading icons. */
export const WithIcons: Story = {
  args: {
    items: [
      { label: 'Rename', onClick: () => {}, icon: <span aria-hidden>✎</span> },
      { label: 'Share', onClick: () => {}, icon: <span aria-hidden>↗</span> },
      { label: 'Archive', onClick: () => {}, icon: <span aria-hidden>🗄</span>, destructive: true },
    ],
  },
};

/** A text-button trigger instead of a kebab. */
export const TextTrigger: Story = {
  args: {
    trigger: <span style={{ fontSize: 14 }}>Tuning ▾</span>,
    align: 'left',
  },
};
