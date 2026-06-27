import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Tabs, TabItem } from './Tabs';

const ITEMS: TabItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'doctors', label: 'Doctors' },
  { id: 'settings', label: 'Settings' },
];

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Tab strip in two looks: `connected` (rounded-top tabs attached to the content below — ClinicTabs) and `block` (floating pill blocks — the Stats strip). Supports an optional right-aligned `actions` slot, per-tab `rightSlot`, and `md`/`sm` sizes.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['connected', 'block'],
      table: { defaultValue: { summary: 'connected' } },
    },
    size: {
      control: 'inline-radio',
      options: ['md', 'sm'],
      table: { defaultValue: { summary: 'md' } },
    },
    inline: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    activeId: { control: false },
    items: { control: false },
    actions: { control: false },
    onSelect: { control: false },
    activeBackgroundColor: { control: false },
  },
  args: {
    items: ITEMS,
    activeId: 'overview',
    variant: 'connected',
    size: 'md',
    inline: false,
  },
  render: (args) => {
    const [activeId, setActiveId] = useState(args.activeId ?? ITEMS[0].id);
    React.useEffect(() => setActiveId(args.activeId ?? ITEMS[0].id), [args.activeId]);
    return <Tabs {...args} activeId={activeId} onSelect={setActiveId} />;
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Connected: Story = { args: { variant: 'connected' } };

export const Block: Story = { args: { variant: 'block' } };

export const BlockSmall: Story = { args: { variant: 'block', size: 'sm' } };

export const WithActions: Story = {
  args: {
    variant: 'block',
    actions: [{ label: '+ Add', onClick: () => {} }],
  },
};

export const WithRightSlot: Story = {
  args: {
    items: [
      { id: 'a', label: 'Template A', rightSlot: <span aria-hidden>Default</span> },
      { id: 'b', label: 'Template B' },
    ],
    activeId: 'a',
  },
};

/** Connected vs block, side by side. */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Tabs items={ITEMS} activeId="overview" onSelect={() => {}} variant="connected" />
      <Tabs items={ITEMS} activeId="overview" onSelect={() => {}} variant="block" />
      <Tabs items={ITEMS} activeId="overview" onSelect={() => {}} variant="block" size="sm" />
    </div>
  ),
};
