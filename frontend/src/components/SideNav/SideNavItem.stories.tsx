import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { SideNavItem } from './SideNavItem';

// A simple inline glyph so the item has an icon node without pulling in the
// app's icon set.
const DemoIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" />
  </svg>
);

const meta = {
  title: 'Patterns/SideNavItem',
  component: SideNavItem,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A single rail entry: an icon centered above its label, sized for the compact sidebar. Hover lifts the icon slightly and dims the background; the `active` state paints the highlight box. Rendered here on a narrow sidebar-width stage with a dark backdrop to match where it lives.',
      },
    },
  },
  argTypes: {
    label: { control: 'text', description: 'Short label under the icon.' },
    active: { control: 'boolean', description: 'Whether this is the current tab.' },
    icon: { control: false },
    onClick: { control: false },
  },
  args: {
    label: 'Home',
    active: false,
    icon: <DemoIcon />,
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 100,
          padding: '12px 0',
          backgroundColor: '#2b2b2b',
          borderRadius: 8,
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SideNavItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = { args: { label: 'Rx Pad', active: true } };

/** Click toggles the active highlight via local state. */
export const Interactive: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [active, setActive] = useState(false);
    return (
      <SideNavItem
        label="Toggle"
        icon={<DemoIcon />}
        active={active}
        onClick={() => setActive((a) => !a)}
      />
    );
  },
};
