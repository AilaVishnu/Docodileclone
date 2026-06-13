import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { SideNav, type NavTab } from './SideNav';

const meta = {
  title: 'Patterns/SideNav',
  component: SideNav,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The fixed left rail. Compact icon-over-label items, one per top-level area, with the active tab highlighted. Normally `position: fixed` against the viewport — here it is wrapped in a sized `position: relative` stage so it renders in isolation. `activeTab` / `onTabChange` are controlled; the meta `render` drives them with local state so clicking a tab moves the highlight.',
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    activeTab: {
      control: 'select',
      options: [
        'Home',
        'Appointments',
        'Prescription',
        'Patient Files',
        'Services',
        'Billing',
        'Stats',
        'Pharmacy',
        'Settings',
      ] satisfies NavTab[],
      description: 'Which menu item is highlighted.',
    },
    onTabChange: { control: false },
  },
  args: {
    activeTab: 'Home',
  },
  render: (args) => {
    const [activeTab, setActiveTab] = useState<NavTab>(args.activeTab);
    React.useEffect(() => setActiveTab(args.activeTab), [args.activeTab]);
    return (
      <div style={{ position: 'relative', height: 600, width: 120 }}>
        <SideNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  },
} satisfies Meta<typeof SideNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = { args: { activeTab: 'Home' } };

export const Prescription: Story = { args: { activeTab: 'Prescription' } };

export const Settings: Story = { args: { activeTab: 'Settings' } };
